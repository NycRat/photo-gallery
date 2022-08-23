use std::path::PathBuf;

use mongodb_connection::{is_public_gallery, is_valid_gallery, MongoConnection};
use rand::Rng;
use rocket::data::ToByteUnit;
use rocket::request::{FromRequest, Outcome};
use rocket::State;
use rocket::{Data, Request};

#[macro_use]
extern crate rocket;

mod mongodb_connection;

struct AdminAuth(bool);
#[rocket::async_trait]
impl<'r> FromRequest<'r> for AdminAuth {
    type Error = ();

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let token = request.headers().get_one("token");
        let gallery;
        if let Some(xd) = request.query_value::<String>("gallery") {
            match xd {
                Ok(gal) => {
                    gallery = gal;
                }
                Err(_) => {
                    // return Outcome::Failure((Status::Unauthorized, ApiTokenError::Missing));
                    return Outcome::Success(AdminAuth(false));
                }
            }
        } else {
            // return Outcome::Failure((Status::Unauthorized, ApiTokenError::Missing));
            return Outcome::Success(AdminAuth(false));
        }

        match token {
            Some(token) => {
                if let Some(mongodb_connection) = request.rocket().state::<MongoConnection>() {
                    if mongodb_connection.is_admin_token(&gallery, token).await {
                        return Outcome::Success(AdminAuth(true));
                    }
                }
                return Outcome::Success(AdminAuth(false));
                // return Outcome::Failure((Status::Unauthorized, ApiTokenError::Invalid));
            }
            None => Outcome::Success(AdminAuth(false)), // Outcome::Failure((Status::Unauthorized, ApiTokenError::Missing)),
        }
    }
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
    auth: AdminAuth,
    mongodb_connection: &State<MongoConnection>,
) {
    if auth.0 {
        let data_str;
        match image_data.open(15.megabytes()).into_bytes().await {
            Ok(bytes) => {
                data_str = bytes.to_vec();
            }
            Err(_) => {
                return;
            }
        }
        let image_index: u32 = mongodb_connection.get_album_length(gallery, album).await as u32;
        mongodb_connection
            .scale_and_post_image(&data_str, gallery, album, image_index)
            .await;
    }
}

#[delete("/image?<gallery>&<album>&<index>")]
async fn delete_image(
    gallery: &str,
    album: &str,
    index: u32,
    auth: AdminAuth,
    mongodb_connection: &State<MongoConnection>,
) {
    if auth.0 {
        mongodb_connection.delete_image(gallery, album, index).await;
    }
}

#[get("/image_index_random?<gallery>&<album>")]
async fn get_random_image_index(
    gallery: &str,
    album: &str,
    mongodb_connection: &State<MongoConnection>,
) -> String {
    let album_length = mongodb_connection.get_album_length(gallery, album).await;
    if album_length <= 1 {
        return "0".to_owned();
    }
    rand::thread_rng().gen_range(0..album_length).to_string()
}

#[get("/album_random?<gallery>")]
async fn get_random_album(gallery: &str, mongodb_connection: &State<MongoConnection>) -> String {
    let album_list = mongodb_connection.get_album_list(gallery).await;
    let index = rand::thread_rng().gen_range(0..album_list.len());
    album_list[index].clone()
}

#[get("/has_admin?<gallery>")]
async fn get_has_admin(gallery: &str, auth: AdminAuth) -> String {
    if auth.0 {
        return "true".to_owned();
    }
    return "false".to_owned();
}

#[post("/album?<gallery>&<album>")]
async fn post_album(
    gallery: &str,
    album: &str,
    auth: AdminAuth,
    mongodb_connection: &State<MongoConnection>,
) {
    if auth.0 {
        mongodb_connection.create_album(gallery, album).await;
    }
}

#[delete("/album?<gallery>&<album>")]
async fn delete_album(
    gallery: &str,
    album: &str,
    auth: AdminAuth,
    mongodb_connection: &State<MongoConnection>,
) {
    if auth.0 {
        mongodb_connection.delete_album(gallery, album).await;
    }
}

#[options("/<path..>")]
async fn options_route(path: PathBuf) -> &'static str {
    ""
}

#[launch]
async fn rocket() -> _ {
    let mongodb_connection = MongoConnection::init().await;
    use rocket::http::Method;
    use rocket_cors::{AllowedOrigins, CorsOptions};

    let cors = CorsOptions::default()
        .allowed_origins(AllowedOrigins::all())
        .allowed_methods(
            vec![Method::Get, Method::Post, Method::Delete, Method::Options]
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
                get_has_admin,
                post_image,
                delete_image,
                delete_album,
                post_album,
                get_random_album,
                get_random_image_index,
                options_route
            ],
        )
}
