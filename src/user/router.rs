use axum::{extract::Path, response::IntoResponse, routing::get, Extension, Json, Router};
use sqlx::{Pool, Postgres};
use uuid::Uuid;

use super::service::{get_user_by_id, get_users};

pub fn user_router() -> Router {
    let router = Router::new()
        .route("/", get(users))
        .route("/{id}", get(user_by_id));

    router
}

async fn users(Extension(db): Extension<Pool<Postgres>>) -> impl IntoResponse {
    let users = get_users(&db).await;
    Json(users)
}

async fn user_by_id(
    Extension(db): Extension<Pool<Postgres>>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    let user = get_user_by_id(&db, id).await;
    Json(user)
}
