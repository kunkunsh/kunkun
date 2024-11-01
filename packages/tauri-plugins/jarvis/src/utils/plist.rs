pub fn plist_to_json(plist_content: String) -> Result<serde_json::Value, String> {
    let reader = std::io::Cursor::new(plist_content.as_bytes());
    let parsed_plist_value: plist::Value =
        plist::Value::from_reader(reader).expect("Failed to parse plist file");
    // TODO: maybe there is a more elegant way to do this conversion
    let json_string =
        serde_json::to_string(&parsed_plist_value).expect("Failed to convert plist to json");
    let json_value: serde_json::Value =
        serde_json::from_str(&json_string).expect("Failed to convert json to Value");
    Ok(json_value)
}
