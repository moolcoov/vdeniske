use std::str::FromStr;

use crate::auth::middleware::auth;
use crate::post::dto::CreatePostDto;
use crate::user::entity::User;
use crate::utils::PaginationReq;
use axum::extract::Path;
use axum::routing::post;
use axum::{
    extract::Query, middleware, response::IntoResponse, routing::get, Extension, Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::{Pool, Postgres};
use uuid::Uuid;

use super::service::{create_post, get_post_by_id, get_posts};

pub fn post_router() -> Router {
    let router = Router::new()
        .route("/", post(create_post_route))
        .route_layer(middleware::from_fn(auth))
        .route("/", get(get_posts_route))
        .route("/:id", get(get_posts_by_id_route));

    router
}

#[derive(Debug, Serialize, Deserialize)]
struct Search {
    search: String,
}

async fn get_posts_route(
    Extension(db): Extension<Pool<Postgres>>,
    Query(pagination): Query<PaginationReq>,
    Query(search): Query<Search>,
) -> impl IntoResponse {
    let result = get_posts(
        &db,
        search.search,
        pagination.page_size,
        pagination.page_number,
    )
    .await;
    Json(result)
}

async fn get_posts_by_id_route(
    Extension(db): Extension<Pool<Postgres>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let result = get_post_by_id(&db, Uuid::from_str(id.as_str()).unwrap()).await;
    Json(result)
}

async fn create_post_route(
    Extension(db): Extension<Pool<Postgres>>,
    Extension(user): Extension<User>,
    Json(dto): Json<CreatePostDto>,
) -> impl IntoResponse {
    let post = create_post(&db, dto, user.id).await;

    Json(post)
}
