use std::env;

use axum::http::HeaderMap;
use serde::{Deserialize, Serialize};

pub mod cf_token;
pub mod turnstile;

#[derive(Serialize, Deserialize, Debug)]
pub struct Pageable<T> {
    pub content: T,
    pub page_size: i64,
    pub page_number: i64,
    pub last_page: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PaginationReq {
    pub page_size: i64,
    pub page_number: i64,
}

pub fn extract_ip(headers: HeaderMap) -> String {
    if let Some(ip) = headers.get("CF-Connecting-IP") {
        return ip.to_str().unwrap().to_string();
    } else {
        return "".to_string();
    }
}

#[derive(Serialize, Deserialize)]
pub struct Status {
    pub success: bool,
}

pub fn is_dev() -> bool {
    env::var("MODE").unwrap_or("PROD".to_string()) == "DEV"
}
