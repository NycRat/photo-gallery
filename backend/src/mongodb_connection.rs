use mongodb::bson::{doc, Document};
use std::env;
use tokio_stream::StreamExt;
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

    pub fn get_album(&self, name: &str) -> mongodb::Collection<Document> {
        self.database.collection::<Document>(name)
    }

    pub async fn get_image_data(
        &self,
        album_name: &str,
        image_index: i32,
        image_size: &str
    ) -> Result<String, String> {
        let album = self.get_album(album_name);

        let doc = match album.find_one(doc! {"index": image_index, "size": image_size}, None).await {
            Ok(opt_doc) => {
                if let Some(doc_real) = opt_doc {
                    doc_real
                } else {
                    return Err("Image does not exist".to_owned());
                }
            }
            Err(e) => {
                println!("{}", e.to_owned());
                return Err("MongoDB Error".to_owned());
            }
        };

        if let Some(bson_data) = doc.get("image_data") {
            let data = bson_data.to_string();
            return Ok(data[11..data.len() - 1].to_owned()); // get rid of Binary(0x0, .... )
        } else {
            return Err("Image data does not exist".to_owned());
        }
    }

    pub async fn get_album_list(&self) -> Vec<String> {
        self.database.list_collection_names(None).await.unwrap()
    }

    pub async fn get_album_length(&self, album_name: &str) -> String {
        match self.get_album(album_name).count_documents(doc!["size": "s"], None).await {
            Ok(len) => {
                return len.to_string();
            }
            Err(e) => {
                return e.to_string();
            }
        }
    }

    /* pub async fn get_items(&self) -> String {
        async fn get_items_result(
            collection: &mongodb::Collection<Document>,
        ) -> mongodb::error::Result<Vec<Document>> {
            let mut cursor: mongodb::Cursor<Document> = collection.find(None, None).await?;
            let mut items: Vec<Document> = Vec::new();
            while let Ok(Some(item)) = cursor.try_next().await {
                items.push(item);
            }

            Ok(items)
        }

        let collection = self.get_album("albums");

        let items_result = get_items_result(&collection).await;

        let mut items_str: String = String::from("{");

        match items_result {
            Ok(items) => {
                for e in items {
                    println!("{}", e.to_string());
                    items_str.push_str(e.to_string().as_str());
                }
            }
            Err(e) => {
                println!("{}", e);
            }
        };

        items_str.push('}');

        items_str
    } */
}
