use serde::{Deserialize, Serialize};

use crate::user::entity::User;

#[derive(Serialize, Deserialize)]
pub struct LoginReqDto {
    pub username: String,
    pub password: String,
    pub turnstile_token: String,
}

#[derive(Serialize, Deserialize)]
pub struct LoginResDto {
    pub access_token: String,
    pub user: User,
}

#[derive(Serialize, Deserialize)]
pub struct RegisterReqDto {
    pub name: String,
    pub username: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub id: String,
    pub username: String,
    pub avatar: String,
    pub name: String,
    pub exp: usize,
}
