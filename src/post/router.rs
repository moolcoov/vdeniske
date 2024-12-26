use axum::{extract::Query, response::IntoResponse, routing::get, Extension, Json, Router};
use sqlx::{Pool, Postgres};

use crate::utils::PaginationReq;

use super::service::get_posts;

pub fn post_router() -> Router {
    let router = Router::new().route("/", get(get_posts_route));

    router
}

async fn get_posts_route(
    Extension(db): Extension<Pool<Postgres>>,
    Query(pagination): Query<PaginationReq>,
) -> impl IntoResponse {
    let result = get_posts(
        &db,
        pagination.search,
        pagination.page_size,
        pagination.page_number,
    )
    .await;
    Json(result)
}
