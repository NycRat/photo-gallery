use mongodb::bson::{doc, Document};
use std::{collections::HashMap, env};
extern crate dotenv;
use dotenv::dotenv;

fn scale_image_file(image: &image::DynamicImage, scale: f32) -> image::DynamicImage {
    image.thumbnail(
        (image.width() as f32 * scale) as u32,
        (image.height() as f32 * scale) as u32,
    )
}

fn get_image_buffer(image: &image::DynamicImage) -> Vec<u8> {
    let mut cursor = std::io::Cursor::new(Vec::new());
    image
        .write_to(&mut cursor, image::ImageOutputFormat::Jpeg(75))
        .unwrap();
    cursor.into_inner()
}

pub fn is_valid_gallery(gallery: &str) -> bool {
    return is_public_gallery(gallery) && gallery != "imageDB" && gallery != "albumDB";
}

pub fn is_public_gallery(gallery: &str) -> bool {
    return gallery != "admin" && gallery != "local" && gallery != "config" && gallery != "tokenDB";
}

pub struct MongoConnection {
    pub client: mongodb::Client,
    galleries: HashMap<String, HashMap<String, u32>>,
}

impl MongoConnection {
    pub async fn init() -> Self {
        dotenv().ok();
        let uri = env::var("MONGODB_URI").unwrap();
        let client_options = mongodb::options::ClientOptions::parse(uri).await.unwrap();
        let client = mongodb::Client::with_options(client_options).unwrap();
        let gallery_list;
        match client.list_database_names(None, None).await {
            Ok(mut databases) => {
                databases.retain(|db| is_valid_gallery(db));
                for i in 0..databases.len() {
                    databases[i] = databases[i].replace("_", " ");
                }
                gallery_list = databases;
            }
            Err(_) => {
                gallery_list = vec![];
            }
        }

        let mut galleries: HashMap<String, HashMap<String, u32>> = HashMap::new();

        for gallery in gallery_list {
            galleries.insert(gallery.clone(), HashMap::new());

            let gallery_obj = client.database(gallery.replace(" ", "_").as_str());
            let album_list = gallery_obj.list_collection_names(None).await.unwrap();

            for album in album_list {
                let album_length: u32;

                match gallery_obj
                    .collection::<Document>(&album)
                    .count_documents(doc! {"size": "x"}, None)
                    .await
                {
                    Ok(len) => {
                        album_length = len as u32;
                    }
                    Err(_) => {
                        album_length = 0;
                    }
                }

                galleries
                    .get_mut(&gallery)
                    .unwrap()
                    .insert(album, album_length);
            }
        }

        println!("{:?}", galleries);

        MongoConnection { client, galleries }
    }

    pub fn get_gallery(&self, gallery_name: &str) -> mongodb::Database {
        self.client
            .database(gallery_name.replace(" ", "_").as_str())
    }

    pub fn get_album(&self, gallery_name: &str, album_name: &str) -> mongodb::Collection<Document> {
        self.get_gallery(gallery_name)
            .collection::<Document>(album_name)
    }

    pub async fn album_exists(&self, gallery_name: &str, album_name: &str) -> bool {
        if let Some(gallery) = self.galleries.get(gallery_name) {
            if gallery.contains_key(album_name) {
                return true;
            }
        }
        return false;
    }

    pub async fn get_gallery_list(&self) -> Vec<String> {
        let mut gallery_list: Vec<String> = vec![];

        for gallery in &self.galleries {
            gallery_list.push(gallery.0.to_string());
        }

        return gallery_list;
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
        if let Some(gallery) = self.galleries.get(gallery_name) {
            let mut album_list: Vec<String> = vec![];

            for album in gallery {
                album_list.push(album.0.to_string());
            }

            return album_list;
        } else {
            return vec![];
        }
    }

    pub async fn get_album_length(&self, gallery_name: &str, album_name: &str) -> i64 {
        if let Some(gallery) = self.galleries.get(gallery_name) {
            if let Some(album_length) = gallery.get(album_name) {
                return *album_length as i64;
            }
        }
        return -1;
    }

    pub async fn is_admin_token(&self, gallery_name: &str, token: &str) -> bool {
        let gallery_token = self.get_admin_token(gallery_name).await;
        if gallery_token == "" {
            return false;
        }
        if token == gallery_token {
            return true;
        }
        return false;
    }

    async fn get_admin_token(&self, gallery_name: &str) -> String {
        let col = self.get_album("tokenDB", "tokens");
        match col
            .find_one(doc! {"gallery": gallery_name.replace(" ", "_")}, None)
            .await
        {
            Ok(doc) => {
                if let Some(token_doc) = doc {
                    match token_doc.get_str("token") {
                        Ok(token) => {
                            return token.to_owned();
                        }
                        Err(_) => {}
                    }
                }
            }
            Err(_) => return "".to_owned(),
        }
        "".to_owned()
    }

    pub async fn scale_and_post_image(
        &mut self,
        image_data: &Vec<u8>,
        gallery_name: &str,
        album_name: &str,
        image_index: u32,
    ) {
        match image::load_from_memory_with_format(&image_data, image::ImageFormat::Jpeg) {
            Ok(image_l) => {
                // TODO - determine solution to scaling with different image sizes
                let image_x = scale_image_file(&image_l, 1f32 / 24f32);
                let image_s = scale_image_file(&image_l, 1f32 / 4f32);
                let image_m = scale_image_file(&image_l, 1f32 / 2f32);
                // go in pending database
                self.post_image(
                    gallery_name,
                    album_name,
                    &get_image_buffer(&image_x),
                    "x",
                    image_index,
                )
                .await;
                self.post_image(
                    gallery_name,
                    album_name,
                    &get_image_buffer(&image_s),
                    "s",
                    image_index,
                )
                .await;
                self.post_image(
                    gallery_name,
                    album_name,
                    &get_image_buffer(&image_m),
                    "m",
                    image_index,
                )
                .await;

                if let Some(albums) = self.galleries.get_mut(gallery_name) {
                    if let Some(album_length) = albums.get_mut(album_name) {
                        println!("OLD LEN: {}", album_length);
                        *album_length += 1;
                    }
                    if let Some(album_length) = albums.get_mut(album_name) {
                        println!("NEW LEN: {}", album_length);
                    }
                }
            }
            Err(_) => {
                // image is not jpeg
            }
        }
    }

    pub async fn post_image(
        &self,
        gallery_name: &str,
        album_name: &str,
        image_data: &Vec<u8>,
        image_size: &str,
        image_index: u32,
    ) {
        if !self.album_exists(gallery_name, album_name).await {
            return;
        }
        let album = self.get_album(gallery_name, album_name);

        match image_size {
            "x" | "s" | "m" => {}
            _ => {
                return;
            }
        }

        use mongodb::bson::spec::BinarySubtype;
        use mongodb::bson::Binary;

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

    pub async fn delete_image(&mut self, gallery_name: &str, album_name: &str, index: u32) {
        if !self.album_exists(gallery_name, album_name).await {
            return;
        }
        let album = self.get_album(gallery_name, album_name);
        let update_doc = doc! {"$inc": {"index": -1}};

        match album.delete_many(doc! {"index": index}, None).await {
            Ok(del_res) => {
                println!("{:?}", del_res);

                if let Some(albums) = self.galleries.get_mut(gallery_name) {
                    if let Some(album_length) = albums.get_mut(album_name) {
                        println!("OLD LEN: {}", album_length);
                        *album_length -= 1;
                    }
                    if let Some(album_length) = albums.get_mut(album_name) {
                        println!("NEW LEN: {}", album_length);
                    }
                }

                match album
                    .update_many(doc! {"index": {"$gt": index}}, update_doc, None)
                    .await
                {
                    Ok(update_res) => {
                        println!("{:?}", update_res);
                    }
                    Err(_) => {}
                }
            }
            Err(_) => {}
        }
    }

    pub async fn create_album(&mut self, gallery_name: &str, album_name: &str) {
        match self
            .get_gallery(&gallery_name)
            .create_collection(&album_name, None)
            .await
        {
            Ok(_) => {
                if let Some(albums) = self.galleries.get_mut(gallery_name) {
                    albums.insert(album_name.to_owned(), 0);
                }

                println!("Created album: {} in {}", album_name, gallery_name);
            }
            Err(e) => println!("{}", e),
        }
    }

    pub async fn delete_album(&mut self, gallery_name: &str, album_name: &str) {
        match self.get_album(&gallery_name, &album_name).drop(None).await {
            Ok(_) => {
                if let Some(albums) = self.galleries.get_mut(gallery_name) {
                    albums.remove(album_name);
                }
                println!("Deleted album: {} in {}", album_name, gallery_name);
            }
            Err(e) => println!("{}", e),
        }
    }
}
