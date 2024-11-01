use chrono::NaiveDateTime;

pub fn sqlite_timestamp_to_unix_timestamp(timestamp: &str) -> anyhow::Result<i64> {
    // Parse SQLite timestamp string into a `NaiveDateTime`
    let dt = NaiveDateTime::parse_from_str(timestamp, "%Y-%m-%d %H:%M:%S")?;

    // Convert `NaiveDateTime` to Unix timestamp (seconds since epoch)
    Ok(dt.and_utc().timestamp())
}
