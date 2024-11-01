use rust_search::{FileSize, FilterExt, SearchBuilder};
use std::{
    path::PathBuf,
    time::{Duration, SystemTime},
};

#[derive(serde::Deserialize, serde::Serialize)]
pub struct SearchParams {
    locations: Vec<PathBuf>,
    query: Option<String>,
    ext: Option<String>,
    depth: Option<usize>,
    limit: Option<usize>,
    hidden: bool,
    ignore_case: bool,
    file_size_greater: Option<u64>,
    file_size_smaller: Option<u64>,
    file_size_equal: Option<u64>,
    created_after: Option<u64>,
    created_before: Option<u64>,
    modified_after: Option<u64>,
    modified_before: Option<u64>,
}

fn search(search_params: SearchParams) -> Vec<String> {
    let mut searcher = SearchBuilder::default();
    if search_params.locations.len() == 1 {
        searcher = searcher.location(search_params.locations[0].clone());
    } else {
        searcher = searcher.more_locations(search_params.locations);
    }
    if let Some(query) = search_params.query {
        searcher = searcher.search_input(query);
    }
    if let Some(ext) = search_params.ext {
        searcher = searcher.ext(ext);
    }
    if let Some(depth) = search_params.depth {
        searcher = searcher.depth(depth);
    }
    if let Some(limit) = search_params.limit {
        searcher = searcher.limit(limit);
    }
    if let Some(file_size_smaller) = search_params.file_size_smaller {
        searcher = searcher.file_size_smaller(FileSize::Byte(file_size_smaller));
    }
    if let Some(file_size_greater) = search_params.file_size_greater {
        searcher = searcher.file_size_greater(FileSize::Byte(file_size_greater));
    }
    if let Some(file_size_equal) = search_params.file_size_equal {
        searcher = searcher.file_size_equal(FileSize::Byte(file_size_equal));
    }
    if let Some(created_after) = search_params.created_after {
        searcher =
            searcher.created_after(SystemTime::UNIX_EPOCH + Duration::from_secs(created_after));
    }
    if let Some(created_before) = search_params.created_before {
        searcher =
            searcher.created_before(SystemTime::UNIX_EPOCH + Duration::from_secs(created_before));
    }
    if let Some(modified_after) = search_params.modified_after {
        searcher =
            searcher.modified_after(SystemTime::UNIX_EPOCH + Duration::from_secs(modified_after));
    }
    if let Some(modified_before) = search_params.modified_before {
        searcher =
            searcher.modified_before(SystemTime::UNIX_EPOCH + Duration::from_secs(modified_before));
    }

    if search_params.hidden {
        searcher = searcher.hidden();
    }
    if search_params.ignore_case {
        searcher = searcher.ignore_case();
    }
    searcher.build().collect()
}

#[tauri::command]
pub async fn file_search(search_params: SearchParams) -> Result<Vec<PathBuf>, String> {
    Ok(search(search_params)
        .iter()
        .map(|x| PathBuf::from(x))
        .collect())
}
