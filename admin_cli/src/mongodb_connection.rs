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

    pub fn get_collection(&self, name: &str) -> mongodb::Collection<Document> {
        self.database.collection::<Document>(name)
    }

    pub async fn insert_image(&self, album_name: &str, image_data: Vec<u8>) -> () {
        let collection = self.get_collection("albums");

        use mongodb::bson::Binary;
        use mongodb::bson::spec::BinarySubtype;

        let data = Binary {subtype: BinarySubtype::Generic, bytes: image_data};

        let update = doc! {
            "$push": { "images": data }
        };

        match collection
            .update_one(doc! {"album_name": album_name}, update, None)
            .await
        {
            Ok(_) => println!("Document Updated"),
            Err(e) => println!("{}", e),
        }
    }
}
