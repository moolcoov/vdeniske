use std::env;

use auth::router::auth_router;
use axum::{Extension, Router};
use post::router::post_router;
use sqlx::postgres::PgPoolOptions;
use user::router::user_router;

mod auth;
mod post;
mod user;
mod utils;

#[tokio::main]
async fn main() {
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

    let app = Router::new()
        .nest("/api/v1/users", user_router())
        .nest("/api/v1/auth", auth_router())
        .nest("/api/v1/posts", post_router())
        .layer(Extension(pool));

    let listener = tokio::net::TcpListener::bind(address).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
