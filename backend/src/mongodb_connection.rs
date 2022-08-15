use mongodb::bson::{doc, Document};
use std::env;
extern crate dotenv;
use dotenv::dotenv;

pub struct MongoConnection {
    pub client: mongodb::Client,
    pub admin_token: String,
}

pub fn is_valid_gallery(gallery: &str) -> bool {
    return is_public_gallery(gallery) && gallery != "imageDB" && gallery != "albumDB";
}

pub fn is_public_gallery(gallery: &str) -> bool {
    return gallery != "admin" && gallery != "local" && gallery != "config";
}

impl MongoConnection {
    pub async fn init() -> Self {
        dotenv().ok();
        let uri = env::var("MONGODB_URI").unwrap();
        let admin_token = env::var("ADMIN_TOKEN").unwrap();
        let client_options = mongodb::options::ClientOptions::parse(uri).await.unwrap();
        let client = mongodb::Client::with_options(client_options).unwrap();

        MongoConnection {
            client,
            admin_token,
        }
    }

    pub fn get_gallery(&self, gallery_name: &str) -> mongodb::Database {
        self.client.database(gallery_name)
    }

    pub fn get_album(&self, gallery_name: &str, album_name: &str) -> mongodb::Collection<Document> {
        self.get_gallery(gallery_name)
            .collection::<Document>(album_name)
    }

    pub async fn get_gallery_list(&self) -> Vec<String> {
        match self.client.list_database_names(None, None).await {
            Ok(mut databases) => {
                databases.retain(|db| is_valid_gallery(db));
                databases
            }
            Err(_) => {
                vec![]
            }
        }
    }

    pub async fn get_image_data(
        &self,
        gallery_name: &str,
        album_name: &str,
        image_index: u32,
        image_size: &str,
    ) -> Result<String, String> {
        let album = self.get_album(gallery_name, album_name);

        let doc = match album
            .find_one(doc! {"index": image_index, "size": image_size}, None)
            .await
        {
            Ok(opt_doc) => {
                if let Some(doc_real) = opt_doc {
                    doc_real
                } else {
                    return Err("Image does not exist".to_owned());
                }
            }
            Err(e) => {
                println!("{}", e.to_string());
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

    pub async fn get_album_list(&self, gallery_name: &str) -> Vec<String> {
        self.get_gallery(gallery_name)
            .list_collection_names(None)
            .await
            .unwrap()
    }

    pub async fn get_album_length(&self, gallery_name: &str, album_name: &str) -> u32 {
        match self
            .get_album(gallery_name, album_name)
            .count_documents(doc!["size": "s"], None)
            .await
        {
            Ok(len) => {
                return len as u32;
            }
            Err(_) => {
                return 0;
            }
        }
    }

    pub async fn post_image(
        &self,
        gallery_name: &str,
        album_name: &str,
        image_data: &Vec<u8>,
        image_size: &str,
    ) {
        let album = self.get_album(gallery_name, album_name);
        match image_size {
            "x" | "s" | "m" | "l" => {}
            _ => {
                return;
            }
        }

        use mongodb::bson::spec::BinarySubtype;
        use mongodb::bson::Binary;

        let image_index: u32 = album
            .count_documents(doc! {"size": &image_size}, None)
            .await
            .unwrap() as u32;

        let binary_data = Binary {
            subtype: BinarySubtype::Generic,
            bytes: image_data.to_vec(),
        };

        match album
            .insert_one(
                doc! {
                    "index": image_index,
                    "size": image_size,
                    "image_data": binary_data
                },
                None,
            )
            .await
        {
            Ok(_res) => {
                println!(
                    "Inserted {} image with at index: {}",
                    image_size, image_index
                );
            }
            Err(e) => println!("{}", e),
        };
    }
}
