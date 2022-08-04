extern crate args;
extern crate getopts;
use mongodb_connection::MongoConnection;
use std::env;

mod file_util;
mod mongodb_connection;

async fn parse(input_args: &Vec<String>) -> Result<(), args::ArgsError> {
    let mut args = args::Args::new(
        "photo_admin",
        "Program for interacting with photo gallery database with admin privileges",
    );
    args.flag("h", "help", "Print usage menu");
    args.option(
        "a",
        "action",
        "Action to run",
        "ACTION",
        getopts::Occur::Optional,
        Some("help".to_owned()),
    );
    args.option(
        "n",
        "name",
        "The name of album",
        "ALBUM_NAME",
        getopts::Occur::Optional,
        None,
    );
    args.option(
        "f",
        "files",
        "Input image files",
        "FILES",
        getopts::Occur::Optional,
        Some("".to_owned()),
    );
    args.option(
        "s",
        "size",
        "Size of photo (preview, medium, full)",
        "SIZE",
        getopts::Occur::Optional,
        Some("".to_owned()),
    );

    args.parse(input_args)?;
    if args.value_of::<bool>("help").unwrap() {
        println!("{}", args.full_usage());
        return Ok(());
    }

    let action: String = args.value_of("action").unwrap();

    match action.as_str() {
        "insert_images" => {
            let album_name = args.value_of::<String>("name").unwrap();
            let image_size = args.value_of::<String>("size").unwrap();
            let arg_files = args.value_of::<String>("files").unwrap();

            let mut file_data_vec: Vec<Vec<u8>> = Vec::new();
            let input_files = arg_files.split(" ");

            for file in input_files {
                file_data_vec.push(file_util::get_data_from_file(file));
            }

            let db_connection = MongoConnection::init().await;
            db_connection
                .insert_images(album_name, file_data_vec, image_size)
                .await;
        }
        "insert_album" => {
            let album_dir = args.value_of::<String>("name").unwrap();
            let image_size = args.value_of::<String>("size").unwrap();
            let image_files = std::fs::read_dir(&album_dir).unwrap();
            let mut file_data_vec: Vec<Vec<u8>> = Vec::new();
            for image_file in image_files {
                if image_file
                    .as_ref()
                    .unwrap()
                    .file_name()
                    .to_ascii_lowercase()
                    == ".ds_store"
                {
                    continue;
                }
                let hting = image_file.unwrap().path();
                let image_file_path = hting.to_str().unwrap();
                file_data_vec.push(file_util::get_data_from_file(image_file_path));
            }
            let db_connection = MongoConnection::init().await;
            db_connection
                .insert_images(album_dir, file_data_vec, image_size)
                .await;
        }
        "create_album" => {
            let album_name = args.value_of::<String>("name").unwrap();
            let db_connection = MongoConnection::init().await;
            db_connection.create_album(album_name).await;
        }
        _ => println!("{}", args.full_usage()),
    }

    Ok(())
}

#[tokio::main]
async fn main() {
    let args: Vec<String> = env::args().collect();
    match parse(&args).await {
        Ok(_) => {}
        Err(err) => println!("{}", err),
    }
}
