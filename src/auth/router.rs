use axum::{response::IntoResponse, routing::post, Extension, Json, Router};
use sqlx::{Pool, Postgres};

use crate::user::service::create_user;

use super::{
    dto::{LoginReqDto, RegisterReqDto},
    service::login,
};

pub fn auth_router() -> Router {
    let router = Router::new()
        .route("/login", post(login_route))
        .route("/register", post(register_route));

    router
}

async fn login_route(
    Extension(db): Extension<Pool<Postgres>>,
    Json(dto): Json<LoginReqDto>,
) -> impl IntoResponse {
    let result = login(&db, dto).await.unwrap();
    Json(result)
}

async fn register_route(
    Extension(db): Extension<Pool<Postgres>>,
    Json(dto): Json<RegisterReqDto>,
) -> impl IntoResponse {
    let user = create_user(&db, dto).await;
    Json(user)
}
