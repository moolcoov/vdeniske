use std::path::Path as StdPath;
use std::str::FromStr;

use super::attachment_service::remove_attachment;
use super::like_service::dislike_post;
use super::service::{create_post, get_post_by_id, get_posts, get_replies};
use crate::auth::middleware::auth;
use crate::post::attachment_service::create_attachment;
use crate::post::dto::CreatePostDto;
use crate::post::entity::Attachment;
use crate::post::like_service::like_post;
use crate::user::entity::User;
use crate::utils::{extract_ip, PaginationReq};
use axum::extract::{Multipart, Path};
use axum::http::HeaderMap;
use axum::routing::post;
use axum::{
    extract::Query, middleware, response::IntoResponse, routing::get, Extension, Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::{Pool, Postgres};
use tokio::fs::File;
use tokio::io::AsyncWriteExt;
use uuid::Uuid;

pub fn post_router() -> Router {
    let router = Router::new()
        .route("/", post(create_post_route))
        .route("/:id/like", post(like_post_route))
        .route("/:id/dislike", post(dislike_post_route))
        .route(
            "/:id/attachments",
            post(create_attachment_route).delete(remove_attachment_route),
        )
        .route_layer(middleware::from_fn(auth))
        .route("/", get(get_posts_route))
        .route("/:id", get(get_posts_by_id_route))
        .route("/:id/replies", get(get_replies_route));

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
    headers: HeaderMap,
    Json(dto): Json<CreatePostDto>,
) -> impl IntoResponse {
    let ip = extract_ip(headers);

    let post = create_post(&db, dto, user.id, ip).await.unwrap();

    Json(post)
}

async fn like_post_route(
    Extension(db): Extension<Pool<Postgres>>,
    Extension(user): Extension<User>,
    Path(post_id): Path<String>,
) -> impl IntoResponse {
    let result = like_post(&db, user.id, Uuid::from_str(post_id.as_str()).unwrap()).await;
    Json(result)
}

async fn dislike_post_route(
    Extension(db): Extension<Pool<Postgres>>,
    Extension(user): Extension<User>,
    Path(post_id): Path<String>,
) -> impl IntoResponse {
    let result = dislike_post(&db, user.id, Uuid::from_str(post_id.as_str()).unwrap()).await;
    Json(result)
}

async fn get_replies_route(
    Extension(db): Extension<Pool<Postgres>>,
    Path(post_id): Path<String>,
    Query(pagination): Query<PaginationReq>,
) -> impl IntoResponse {
    let result = get_replies(
        &db,
        Uuid::from_str(post_id.as_str()).unwrap(),
        pagination.page_size,
        pagination.page_number,
    )
    .await;

    Json(result)
}

async fn create_attachment_route(
    Extension(db): Extension<Pool<Postgres>>,
    Extension(user): Extension<User>,
    Path(post_id): Path<String>,
    mut multipart: Multipart,
) -> impl IntoResponse {
    let mut attachments: Vec<Attachment> = Vec::new();

    while let Some(field) = multipart.next_field().await.unwrap_or(None) {
        if field.name() != Some("file") {
            continue;
        }

        if let Some(file_name) = field.file_name().map(ToString::to_string) {
            let extension = StdPath::new(&file_name)
                .extension()
                .and_then(|ext| ext.to_str())
                .unwrap_or("");

            let new_filename = format!("{}.{}", Uuid::new_v4(), extension);
            let file_path = format!("/static/attachments/{}", new_filename);

            let attachment = create_attachment(
                &db,
                Uuid::from_str(post_id.as_str()).unwrap(),
                user.id,
                extension.to_string(),
                file_path.clone(),
            )
            .await
            .unwrap();

            let file_data = field.bytes().await.unwrap();

            let mut file = File::create(&file_path).await.unwrap();
            file.write_all(&file_data).await.unwrap();

            attachments.push(attachment);
        }
    }

    Json(attachments)
}

async fn remove_attachment_route(
    Extension(db): Extension<Pool<Postgres>>,
    Extension(user): Extension<User>,
    Path(post_id): Path<String>,
    Path(attachment_id): Path<String>,
) -> impl IntoResponse {
    let result = remove_attachment(
        &db,
        Uuid::from_str(post_id.as_str()).unwrap(),
        Uuid::from_str(attachment_id.as_str()).unwrap(),
        user.id,
    )
    .await;

    Json(result)
}
