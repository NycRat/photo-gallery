use mongodb_connection::MongoConnection;
use std::env;

mod mongodb_connection;
mod file_util;

#[tokio::main]
async fn main() {
    let args: Vec<String> = env::args().collect();
    let action: &str;

    if args.len() < 2 {
        action = "help";
    } else {
        action = &args[1].as_str();
    }

    match action {
        "help" => println!("Actions: \ninsert_image\n...\n..."),
        "insert_image" => {
            let filename = &args[2];

            let file_data = file_util::get_data_from_file(filename);

            let db_connection = MongoConnection::init().await;
            db_connection.insert_image("greatest_album", file_data).await;
        }
        _ => println!("Not a valid action. use action:: \"help\", for more info"),
    }
}
