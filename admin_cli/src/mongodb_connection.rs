use mongodb::bson::{doc, Document};
use std::env;
extern crate dotenv;
use dotenv::dotenv;

pub struct MongoConnection {
    pub database: mongodb::Database,
}

impl MongoConnection {
    pub async fn init() -> Self {
        async fn get_database() -> mongodb::error::Result<mongodb::Database> {
            dotenv().ok();
            let uri = match env::var("MONGODB_URI") {
                Ok(v) => v.to_string(),
                Err(_) => format!("Error loading env"),
            };

            let client_options = mongodb::options::ClientOptions::parse(uri).await?;

            let client = mongodb::Client::with_options(client_options)?;

            let database = client.database("albumDB");

            Ok(database)
        }

        let mut database: Option<mongodb::Database> = None;

        match get_database().await {
            Ok(db) => {
                database = Some(db);
            }
            Err(err) => {
                println!("{}", err);
            }
        }

        MongoConnection {
            database: database.unwrap(),
        }
    }

    pub fn get_album(&self, name: String) -> mongodb::Collection<Document> {
        self.database.collection::<Document>(name.as_str())
    }

    pub async fn create_album(&self, album_name: String) {
        match self.database.create_collection(&album_name, None).await {
            Ok(_) => println!("Created album: {}", album_name),
            Err(e) => println!("{}", e),
        }
    }

    pub async fn insert_images(&self, album_name: String, image_data_vec: Vec<Vec<u8>>) {
        let album = self.get_album(album_name);

        use mongodb::bson::spec::BinarySubtype;
        use mongodb::bson::Binary;

        let mut image_index: u32 = album.count_documents(None, None).await.unwrap() as u32;

        for image_data in image_data_vec {
            let data = Binary {
                subtype: BinarySubtype::Generic,
                bytes: image_data,
            };

            match album
                .insert_one(
                    doc! {
                        "index": image_index,
                        "size": "preview", // preview, medium, full
                        "image_data": data
                    },
                    None,
                )
                .await
            {
                Ok(_res) => {
                    println!("Inserted image with at index: {}", image_index);
                    image_index += 1;
                }
                Err(e) => println!("{}", e),
            };
        }
    }
}
