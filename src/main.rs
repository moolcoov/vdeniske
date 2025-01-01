use auth::router::auth_router;
use axum::{extract::DefaultBodyLimit, Extension, Router};
use post::router::post_router;
use sqlx::postgres::PgPoolOptions;
use std::env;
use user::router::user_router;

use tower_http::cors::{Any, CorsLayer};
use tower_http::limit::RequestBodyLimitLayer;

mod auth;
mod post;
mod user;
mod utils;

#[tokio::main]
async fn main() {
    let subscriber = tracing_subscriber::FmtSubscriber::new();
    tracing::subscriber::set_global_default(subscriber).unwrap();

    let port = env::var("PORT").unwrap_or("3000".to_string());
    let address = format!("0.0.0.0:{}", port);

    let pg_address = env::var("POSTGRES_URL")
        .unwrap_or("postgres://demo:demo@localhost:5432/vdeniske".to_string());

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(pg_address.as_str())
        .await
        .unwrap();

    let row: (String,) = sqlx::query_as("SELECT version()")
        .fetch_one(&pool)
        .await
        .unwrap();

    println!("connected to: {}", row.0);

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .nest("/api/v1/users", user_router())
        .nest("/api/v1/auth", auth_router())
        .nest("/api/v1/posts", post_router())
        .layer(Extension(pool))
        .layer(cors)
        .layer(DefaultBodyLimit::disable())
        .layer(RequestBodyLimitLayer::new(25 * 1024 * 1024));

    let listener = tokio::net::TcpListener::bind(address).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
