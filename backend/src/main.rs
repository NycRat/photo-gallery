use mongodb_connection::{is_valid_gallery, MongoConnection};
use rand::Rng;
use rocket::State;
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

#[get("/image?<gallery>&<album>&<index>&<size>")]
async fn get_image(
    gallery: &str,
    album: &str,
    index: u32,
    size: &str,
    mongodb_connection: &State<MongoConnection>,
) -> String {
    if !is_valid_gallery(gallery) {
        return "".to_owned();
    }
    match mongodb_connection
        .get_image_data(gallery, album, index, size)
        .await
    {
        Ok(img_data) => return img_data,
        Err(e) => return e,
    }
}

#[get("/album_length?<gallery>&<album>")]
async fn get_album_length(
    gallery: &str,
    album: &str,
    mongodb_connection: &State<MongoConnection>,
) -> String {
    if !is_valid_gallery(gallery) {
        return "".to_owned();
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

#[launch]
async fn rocket() -> _ {
    let mongo_connection = MongoConnection::init().await;
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
        .manage(mongo_connection)
        .mount(
            "/api/",
            routes![
                get_gallery_list,
                get_album_list,
                get_album_length,
                get_image,
                get_random_gallery_image,
            ],
        )
}
