use mongodb::bson::{doc, Document};
use std::env;
extern crate dotenv;
use dotenv::dotenv;

pub struct MongoConnection {
    pub database: mongodb::Database,
}

impl MongoConnection {
    pub async fn init() -> Self {
        dotenv().ok();
        let uri = env::var("MONGODB_URI").unwrap();

        let client_options = mongodb::options::ClientOptions::parse(uri).await.unwrap();
        let client = mongodb::Client::with_options(client_options).unwrap();

        let database = client.database("albumDB");

        MongoConnection { database }
    }

    pub fn get_album(&self, name: &String) -> mongodb::Collection<Document> {
        self.database.collection::<Document>(name.as_str())
    }

    pub async fn get_album_len(&self, name: &String) -> i32 {
        self.get_album(name)
            .count_documents(doc! {"size": "s"}, None)
            .await
            .unwrap() as i32
    }

    pub async fn create_album(&self, album_name: &String) {
        match self.database.create_collection(&album_name, None).await {
            Ok(_) => println!("Created album: {}", album_name),
            Err(e) => println!("{}", e),
        }
    }

    pub async fn delete_album(&self, album_name: &String) {
        match self.get_album(album_name).drop(None).await {
            Ok(_) => println!("Deleted album: {}", album_name),
            Err(e) => println!("{}", e),
        }
    }

    pub async fn insert_image(
        &self,
        album_name: &String,
        image_data: &Vec<u8>,
        image_size: &String,
    ) {
        match image_size.as_str() {
            "x" | "s" | "m" | "l" => {}
            _ => {
                println!("{} is not a valid size. (x, s, m, l)", image_size);
                return;
            }
        }

        let album = self.get_album(&album_name);

        use mongodb::bson::spec::BinarySubtype;
        use mongodb::bson::Binary;

        let image_index: u32 = album
            .count_documents(doc! {"size": &image_size}, None)
            .await
            .unwrap() as u32;

        let data = Binary {
            subtype: BinarySubtype::Generic,
            bytes: image_data.to_vec(),
        };

        match album
            .insert_one(
                doc! {
                    "index": image_index,
                    "size": image_size,
                    "image_data": data
                },
                None,
            )
            .await
        {
            Ok(_res) => {
                println!("Inserted {} image with at index: {}", image_size ,image_index);
            }
            Err(e) => println!("{}", e),
        };
    }
}
