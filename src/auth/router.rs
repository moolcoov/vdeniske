use axum::{
    http::header::HeaderMap, response::IntoResponse, routing::post, Extension, Json, Router,
};
use sqlx::{Pool, Postgres};

use crate::utils::extract_ip;

use super::{
    dto::{LoginReqDto, RegisterReqDto},
    service::{login, register},
};

pub fn auth_router() -> Router {
    let router = Router::new()
        .route("/login", post(login_route))
        .route("/register", post(register_route));

    router
}

async fn login_route(
    Extension(db): Extension<Pool<Postgres>>,
    headers: HeaderMap,
    Json(dto): Json<LoginReqDto>,
) -> impl IntoResponse {
    let ip = extract_ip(headers);

    let result = login(&db, dto, ip).await.unwrap();
    Json(result)
}

async fn register_route(
    Extension(db): Extension<Pool<Postgres>>,
    headers: HeaderMap,
    Json(dto): Json<RegisterReqDto>,
) -> impl IntoResponse {
    let ip = extract_ip(headers);

    let user = register(&db, dto, ip).await.unwrap();
    Json(user)
}
