use std::io::Read;

use mongodb::Cursor;
use mongodb_connection::{is_public_gallery, is_valid_gallery, MongoConnection};
use rand::Rng;
use rocket::data::ToByteUnit;
use rocket::Data;
use rocket::{http::CookieJar, State};

#[macro_use]
extern crate rocket;

mod mongodb_connection;

fn scale_image_file(image: &image::DynamicImage, scale: f32) -> image::DynamicImage {
    image.thumbnail(
        (image.width() as f32 * scale) as u32,
        (image.height() as f32 * scale) as u32,
    )
}

fn get_image_buffer(image: &image::DynamicImage) -> Vec<u8> {
    let mut cursor = std::io::Cursor::new(Vec::new());
    image
        .write_to(&mut cursor, image::ImageOutputFormat::Jpeg(75))
        .unwrap();
    cursor.into_inner()
}

#[get("/gallery_list")]
async fn get_gallery_list(mongodb_connection: &State<MongoConnection>) -> String {
    let galleries = mongodb_connection.get_gallery_list().await;
    let mut res = String::new();
    for i in 0..galleries.len() {
        res.push_str(&galleries[i]);
        if i != galleries.len() - 1 {
            res.push('\n');
        }
    }
    res
}

#[get("/album_list?<gallery>")]
async fn get_album_list(gallery: &str, mongodb_connection: &State<MongoConnection>) -> String {
    if !is_valid_gallery(gallery) {
        return "".to_owned();
    }
    let albums = mongodb_connection.get_album_list(gallery).await;
    let mut res = String::new();
    for i in 0..albums.len() {
        res.push_str(&albums[i]);
        if i != albums.len() - 1 {
            res.push('\n');
        }
    }
    res
}

#[get("/image?<gallery>&<album>&<index>&<size>")]
async fn get_image(
    gallery: &str,
    album: &str,
    index: u32,
    size: &str,
    mongodb_connection: &State<MongoConnection>,
) -> String {
    if !is_public_gallery(gallery) {
        return "".to_owned();
    }
    match mongodb_connection
        .get_image_data(gallery, album, index, size)
        .await
    {
        Ok(img_data) => return img_data,
        Err(e) => return "".to_owned(),
    }
}

#[get("/album_length?<gallery>&<album>")]
async fn get_album_length(
    gallery: &str,
    album: &str,
    mongodb_connection: &State<MongoConnection>,
) -> String {
    if !is_public_gallery(gallery) {
        return "0".to_owned();
    }
    mongodb_connection
        .get_album_length(gallery, album)
        .await
        .to_string()
}

#[get("/image_random?<gallery>&<size>")]
async fn get_random_gallery_image(
    gallery: &str,
    size: &str,
    mongodb_connection: &State<MongoConnection>,
) -> String {
    let album_list = mongodb_connection.get_album_list(gallery).await;
    let album = album_list
        .get(rand::thread_rng().gen_range(0..album_list.len()))
        .unwrap();
    let album_len = mongodb_connection.get_album_length(gallery, album).await;
    let image_index = rand::thread_rng().gen_range(0..album_len);
    mongodb_connection
        .get_image_data(gallery, album, image_index, size)
        .await
        .unwrap()
}

#[get("/has_admin?<gallery>")]
async fn get_has_admin(gallery: &str, jar: &CookieJar<'_>, mongodb_connection: &State<MongoConnection>) -> String {
    println!("{:?}", jar);
    match jar.get("auth_token") {
        Some(token) => {
            let gallery_token = mongodb_connection.get_admin_token(gallery).await;
            if gallery_token == "" {
                return "false".to_owned();
            }
            println!("{} != {}", token.value(), gallery_token);
            if token.value() == gallery_token {
                return "true".to_owned();
            }
        }
        None => {
            println!("NO TOKEN");
        }
    }
    return "false".to_owned();
}

#[post("/image", data = "<image_data>")]
async fn post_image_to_image_db(
    image_data: Data<'_>,
    jar: &CookieJar<'_>,
    mongodb_connection: &State<MongoConnection>,
) {
    let data_str;
    match image_data.open(15.megabytes()).into_bytes().await {
        Ok(bytes) => {
            data_str = bytes.to_vec();
        }
        Err(_) => {
            return;
        }
    }
    match image::load_from_memory_with_format(&data_str, image::ImageFormat::Jpeg) {
        Ok(image_l) => {
            // TODO - determine solution to scaling with different image sizes
            let image_x = scale_image_file(&image_l, 1f32 / 24f32);
            let image_s = scale_image_file(&image_l, 1f32 / 4f32);
            let image_m = scale_image_file(&image_l, 1f32 / 2f32);
            match jar.get("auth_token") {
                Some(token) => {
                    if token.value() == mongodb_connection.get_admin_token("imageDB").await {
                        mongodb_connection
                            .post_image("imageDB", "images", &get_image_buffer(&image_x), "x")
                            .await;
                        mongodb_connection
                            .post_image("imageDB", "images", &get_image_buffer(&image_s), "s")
                            .await;
                        mongodb_connection
                            .post_image("imageDB", "images", &get_image_buffer(&image_m), "m")
                            .await;
                        mongodb_connection
                            .post_image("imageDB", "images", &get_image_buffer(&image_l), "l")
                            .await;
                        return;
                    }
                }
                None => {}
            }
            // go in pending database
        }
        Err(_) => {
            // image is not jpeg
            return;
        }
    }
}

#[launch]
async fn rocket() -> _ {
    let mongodb_connection = MongoConnection::init().await;
    use rocket::http::Method;
    use rocket_cors::{AllowedOrigins, CorsOptions};

    let cors = CorsOptions::default()
        .allowed_origins(AllowedOrigins::all())
        .allowed_methods(
            vec![Method::Get, Method::Post, Method::Patch]
                .into_iter()
                .map(From::from)
                .collect(),
        )
        .allow_credentials(true);

    rocket::build()
        .attach(cors.to_cors().unwrap())
        .manage(mongodb_connection)
        .mount(
            "/api/",
            routes![
                get_gallery_list,
                get_album_list,
                get_album_length,
                get_image,
                get_random_gallery_image,
                get_has_admin,
                post_image_to_image_db
            ],
        )
}
