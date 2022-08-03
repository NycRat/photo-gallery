use mongodb_connection::MongoConnection;
use rocket::State;

#[macro_use]
extern crate rocket;

mod mongodb_connection;

#[get("/")]
async fn index(mongodb_connection: &State<MongoConnection>) -> String {
    mongodb_connection.get_items().await
}

#[launch]
async fn rocket() -> _ {
    let mongo_connection = MongoConnection::init().await;

    rocket::build().manage(mongo_connection).mount("/", routes![index])
}

