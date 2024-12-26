use std::{env, str::FromStr};

use axum::{
    extract::Request,
    http::{self, StatusCode},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use uuid::Uuid;

use crate::user::entity::User;

use super::dto::Claims;

pub async fn auth(mut req: Request, next: Next) -> Result<Response, StatusCode> {
    let auth_header = req
        .headers()
        .get(http::header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok());

    let auth_header = if let Some(auth_header) = auth_header {
        auth_header
    } else {
        return Err(StatusCode::UNAUTHORIZED);
    };

    if let Some(current_user) = authorize_current_user(auth_header).await {
        req.extensions_mut().insert(current_user);
        Ok(next.run(req).await)
    } else {
        Err(StatusCode::UNAUTHORIZED)
    }
}

async fn authorize_current_user(auth_header: &str) -> Option<User> {
    let token = auth_header.split_whitespace().nth(1)?;
    let secret = env::var("JWT_SECRET").unwrap_or("POMODORO".to_string());

    let decoding_key = DecodingKey::from_secret(secret.as_ref());
    let validation = Validation::new(Algorithm::HS256);

    match decode::<Claims>(token, &decoding_key, &validation) {
        Ok(token_data) => Some(User {
            id: Uuid::from_str(token_data.claims.id.as_str()).unwrap_or_else(|_| Uuid::new_v4()),
            name: token_data.claims.name,
            username: token_data.claims.username,
            avatar: token_data.claims.avatar,
            email: "".to_string(),
            password: "".to_string(),
        }),
        Err(_) => None,
    }
}
