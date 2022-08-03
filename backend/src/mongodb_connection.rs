use tokio_stream::StreamExt;
use mongodb::bson::Document;
use std::env;
extern crate dotenv;
use dotenv::dotenv;


pub struct MongoConnection {
    pub database: mongodb::Database
}

impl MongoConnection {
    pub async fn init() -> Self {
        async fn get_database() -> mongodb::error::Result<mongodb::Database> {
            dotenv().ok();
            let uri = match env::var("MONGODB_URI") {
                Ok(v) => v.to_string(),
                Err(_) => format!("Error loading env"),
            };
 
            let client_options = mongodb::options::ClientOptions::parse(
                uri
            ).await?;

            let client = mongodb::Client::with_options(client_options)?;

            let database = client.database("testDB");

            Ok(database)
        }

        let mut database: Option<mongodb::Database> = None;

        match get_database().await {
            Ok(db) => {
                database = Some(db);
            },
            Err(err) => {
                println!("{}", err);
            },
        }

        MongoConnection { database: database.unwrap() }
    }

    pub fn get_collection(&self, name: &str) -> mongodb::Collection<Document> {
        self.database.collection::<Document>(name)
    }

    pub async fn get_items(&self) -> String {
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

        let collection = self.get_collection("counts");

        let items_result = get_items_result(&collection).await;

        let mut items_str: String = String::from("{");

        match items_result {
            Ok(items) => {
                for e in items {
                    println!("{}", e.to_string());
                    items_str.push_str(e.to_string().as_str());
                }
            },
            Err(e) => {
                println!("{}", e);
            },
        };

        items_str.push('}');

        items_str

    }


}
