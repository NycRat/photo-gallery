use mongodb_connection::MongoConnection;
use std::env;

mod file_util;
mod mongodb_connection;

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
        "help" => println!("Actions: \ninsert_image\ninsert_albumn\ncreate_album"),
        "insert_image" => {
            let album_name = &args[2];
            let mut file_data_vec: Vec<Vec<u8>> = Vec::new();
            for i in 3..args.len() {
                file_data_vec.push(file_util::get_data_from_file(&args[i]));
            }

            let db_connection = MongoConnection::init().await;
            db_connection.insert_images(album_name, file_data_vec).await;
        }
        "insert_album" => {
            let album_dir = &args[2];
            let image_files = std::fs::read_dir(album_dir).unwrap();
            let mut file_data_vec: Vec<Vec<u8>> = Vec::new();
            for image_file in image_files {
                if image_file.as_ref().unwrap().file_name().to_ascii_lowercase() == ".ds_store" {
                    continue;
                }
                let hting = image_file.unwrap().path();
                let image_file_path = hting.to_str().unwrap();
                println!("{}", image_file_path);
                file_data_vec.push(file_util::get_data_from_file(image_file_path));
            }
            let db_connection = MongoConnection::init().await;
            db_connection.insert_images(album_dir, file_data_vec).await;
        }
        "create_album" => {
            let album_name = &args[2];
            let db_connection = MongoConnection::init().await;
            db_connection.create_album(album_name).await;
        }
        _ => println!("Not a valid action. use action:: \"help\", for more info"),
    }
}
