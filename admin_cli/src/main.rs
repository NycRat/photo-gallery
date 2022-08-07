extern crate args;
extern crate getopts;
use file_util::{get_image_file, save_image_file, scale_image_file, get_no_extension, get_image_size};
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
        "Size of photo (s, m, l)",
        "SIZE",
        getopts::Occur::Optional,
        Some("".to_owned()),
    );
    args.option(
        "i",
        "index",
        "Index of image",
        "INDEX",
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
        "scale_images" => {
            let files_dir = args.value_of::<String>("name").unwrap();
            let mut image_files: Vec<_> = std::fs::read_dir(&files_dir)
                .unwrap()
                .map(|f| f.unwrap())
                .collect();

            image_files.sort_by_key(|file| file.path());

            for image_file in image_files {
                if image_file.file_name().to_ascii_lowercase() == ".ds_store" {
                    continue;
                }
                let hting = image_file.path();
                let image_file_path = hting.to_str().unwrap();

                let image = get_image_file(image_file_path);

                let path_no_extension = get_no_extension(image_file_path, 5);

                let x = path_no_extension.clone() + "_x.jpeg";
                save_image_file(x.as_str(), &scale_image_file(&image, 1f32/24f32));
                let s = path_no_extension.clone() + "_s.jpeg";
                save_image_file(s.as_str(), &scale_image_file(&image, 1f32/4f32));
                let m = path_no_extension.clone() + "_m.jpeg";
                save_image_file(m.as_str(), &scale_image_file(&image, 1f32/2f32));

                std::fs::rename(image_file_path, path_no_extension.clone() + "_l.jpeg").unwrap();

            }
        }
        "insert_images" => {
            // let album_name = args.value_of::<String>("name").unwrap();
            // let image_size = args.value_of::<String>("size").unwrap();
            // let arg_files = args.value_of::<String>("files").unwrap();

            // let input_files = arg_files.split(" ");

            // let db_connection = MongoConnection::init().await;

            // for file in input_files {
            //     let image_data = file_util::get_data_from_file(file);
            //     db_connection
            //         .insert_image(&album_name, &image_data, &image_size)
            //         .await;
            // }

        }
        "insert_album" => {
            let album_dir = args.value_of::<String>("name").unwrap();
            let mut image_files: Vec<_> = std::fs::read_dir(&album_dir)
                .unwrap()
                .map(|f| f.unwrap())
                .collect();
            image_files.sort_by_key(|file| file.path());

            let db_connection = MongoConnection::init().await;
            for image_file in image_files {
                if image_file.file_name().to_ascii_lowercase() == ".ds_store" {
                    continue;
                }
                let hting = image_file.path();
                let image_file = hting.to_str().unwrap();
                let image_size = get_image_size(image_file);
                match image_size.as_str() {
                    "x" | "s" | "m" | "l" => {}
                    _ => {continue;}
                }


                let image_data = file_util::get_data_from_file(image_file);

                db_connection
                    .insert_image(&album_dir, &image_data, &image_size)
                    .await;
            }
        }
        "create_album" => {
            let album_name = args.value_of::<String>("name").unwrap();
            let db_connection = MongoConnection::init().await;
            db_connection.create_album(&album_name).await;
        }
        "delete_image" => {
            let album_name = args.value_of::<String>("name").unwrap();
            let image_index = args.value_of::<i32>("index").unwrap();
            let mut line = String::new();
            std::io::stdin().read_line(&mut line).unwrap();
            let db_connection = MongoConnection::init().await;
        }
        "delete_album" => {
            let album_name = args.value_of::<String>("name").unwrap();
            let db_connection = MongoConnection::init().await;
            println!(
                "Delete \"{}\" with {} images?",
                album_name,
                db_connection.get_album_len(&album_name).await
            );
            print!("Retype album name to confirm: ");
            std::io::Write::flush(&mut std::io::stdout()).unwrap();

            let mut y_n = String::new();
            std::io::stdin().read_line(&mut y_n).unwrap();
            if y_n.trim_end() == album_name {
                db_connection.delete_album(&album_name).await;
            } else {
                println!("Album names do not match");
            }
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
