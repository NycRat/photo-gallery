use mongodb_connection::{is_public_gallery, is_valid_gallery, MongoConnection};
use rand::Rng;
use rocket::data::ToByteUnit;
use rocket::Data;
use rocket::{http::CookieJar, State};


#[macro_use]
extern crate rocket;

mod mongodb_connection;

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

#[get("/album_length?<gallery>&<album>")]
async fn get_album_length(
    gallery: &str,
    album: &str,
    mongodb_connection: &State<MongoConnection>,
) -> String {
    if !is_public_gallery(gallery) {
        return "-1".to_owned();
    }
    mongodb_connection
        .get_album_length(gallery, album)
        .await
        .to_string()
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
        Err(_) => return "".to_owned(),
    }
}

#[post("/image?<gallery>&<album>", data = "<image_data>")]
async fn post_image(
    gallery: &str,
    album: &str,
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
    match jar.get("auth_token") {
        Some(token) => {
            if mongodb_connection
                .is_admin_token(gallery, token.value())
                .await
            {
                mongodb_connection
                    .scale_and_post_image(&data_str, gallery, album)
                    .await;
            }
        }
        None => {}
    }
}

#[delete("/image?<gallery>&<album>&<index>")]
async fn delete_image(
    gallery: &str,
    album: &str,
    index: u32,
    jar: &CookieJar<'_>,
    mongodb_connection: &State<MongoConnection>,
) {
    match jar.get("auth_token") {
        Some(token) => {
            if mongodb_connection
                .is_admin_token(gallery, token.value())
                .await
            {
                mongodb_connection.delete_image(gallery, album, index).await;
            }
        }
        None => {}
    }
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
    let album_len = mongodb_connection.get_album_length(gallery, album).await as u32;
    let image_index = rand::thread_rng().gen_range(0..album_len);
    mongodb_connection
        .get_image_data(gallery, album, image_index, size)
        .await
        .unwrap()
}

#[get("/has_admin?<gallery>")]
async fn get_has_admin(
    gallery: &str,
    jar: &CookieJar<'_>,
    mongodb_connection: &State<MongoConnection>,
) -> String {
    match jar.get("auth_token") {
        Some(token) => {
            if mongodb_connection
                .is_admin_token(gallery, token.value())
                .await
            {
                return "true".to_owned();
            }
        }
        None => {}
    }
    return "false".to_owned();
}

#[post("/album?<gallery>&<album>")]
async fn post_album(
    gallery: &str,
    album: &str,
    jar: &CookieJar<'_>,
    mongodb_connection: &State<MongoConnection>,
) {
    match jar.get("auth_token") {
        Some(token) => {
            if mongodb_connection
                .is_admin_token(gallery, token.value())
                .await
            {
                mongodb_connection.create_album(gallery, album).await;
            }
        }
        None => {}
    }
}

#[delete("/album?<gallery>&<album>")]
async fn delete_album(
    gallery: &str,
    album: &str,
    jar: &CookieJar<'_>,
    mongodb_connection: &State<MongoConnection>,
) {
    match jar.get("auth_token") {
        Some(token) => {
            if mongodb_connection.is_admin_token(gallery, token.value()).await {
                mongodb_connection.delete_album(gallery, album).await;
            }
        }
        None => {}
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
            vec![Method::Get, Method::Post, Method::Delete]
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
                post_image,
                delete_image,
                delete_album,
                post_album
            ],
        )
}
