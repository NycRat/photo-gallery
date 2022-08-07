pub fn get_data_from_file(filepath: &str) -> Vec<u8> {
    let buffer = std::fs::read(filepath).unwrap();
    buffer
}

pub fn get_image_file(filepath: &str) -> image::DynamicImage {
    image::io::Reader::open(filepath).unwrap().decode().unwrap()
}

pub fn scale_image_file(image: &image::DynamicImage, scale: f32) -> image::DynamicImage {
    image.thumbnail((image.width() as f32 * scale) as u32, (image.height() as f32 * scale) as u32)
}

pub fn save_image_file(filepath: &str, image: &image::DynamicImage) {
    println!("Saved: {}", filepath);
    image.save(filepath).unwrap();
}

pub fn get_no_extension(filepath: &str, extension_len: usize) -> String {
    filepath[0..filepath.len() - extension_len].to_owned()
}

pub fn get_image_size(filepath: &str) -> String {
    let no_extension = get_no_extension(filepath, 5); // .jpeg
    let image_size = &no_extension[no_extension.len()-1..no_extension.len()];
    image_size.to_owned()
}
