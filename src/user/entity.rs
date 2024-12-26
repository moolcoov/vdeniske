use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

#[derive(Serialize, Deserialize, FromRow, Debug, Clone)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    pub username: String,
    pub avatar: String,

    #[serde(skip)]
    pub email: String,
    #[serde(skip)]
    pub password: String,
}
