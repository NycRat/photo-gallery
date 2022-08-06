use mongodb_connection::MongoConnection;
use rocket::State;

#[macro_use]
extern crate rocket;

mod mongodb_connection;

#[get("/album/list")]
async fn get_album_list(mongodb_connection: &State<MongoConnection>) -> String {
    let albums = mongodb_connection.get_album_list().await;
    let mut res = String::new();
    for i in 0..albums.len() {
        res.push_str(&albums[i]);
        if i != albums.len() - 1 {
            res.push('\n');
        }
    }
    res
}

#[get("/image?<album>&<index>&<size>")]
async fn get_image(album: &str, index: i32, size: &str, mongodb_connection: &State<MongoConnection>) -> String {
    match mongodb_connection.get_image_data(album, index, size).await {
        Ok(img_data) => return img_data,
        Err(e) => return e,
    }
}

#[get("/album/length?<name>")]
async fn get_album_length(name: &str, mongodb_connection: &State<MongoConnection>) -> String {
    mongodb_connection.get_album_length(name).await
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
            routes![get_album_list, get_album_length, get_image],
        )
}
