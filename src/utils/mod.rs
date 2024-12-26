use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Pageable<T> {
    pub content: T,
    pub page_size: i64,
    pub page_number: i64,
    pub last_page: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PaginationReq {
    pub search: String,
    pub page_size: i64,
    pub page_number: i64,
}
