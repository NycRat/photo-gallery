pub fn get_data_from_file(filepath: &str) -> Vec<u8> {
    let buffer = std::fs::read(filepath).unwrap();
    buffer
}
