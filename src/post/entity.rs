use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

#[derive(Serialize, Deserialize, FromRow, Debug)]
pub struct Post {
    pub id: Uuid,
    pub content: String,

    pub user_username: String,
    pub user_name: String,
    pub user_avatar: String,
    pub user_id: Uuid,
    // pub author: User,
}
