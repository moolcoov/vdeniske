use crate::user::entity::User;
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use sqlx::types::Json;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Attachment {
    pub id: Uuid,
    pub r#type: String,
    pub filename: String,
}

#[derive(Serialize, Deserialize, FromRow, Debug)]
pub struct Post {
    pub id: Uuid,
    pub content: String,
    pub likes: i64,
    pub dislikes: i64,
    pub replies: i64,

    pub author: Json<Vec<User>>,
    pub attachments: Json<Option<Vec<Attachment>>>,
}
