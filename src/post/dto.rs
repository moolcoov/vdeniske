use crate::post::entity::Attachment;
use crate::user::entity::User;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct CreatePostDto {
    pub content: String,
    pub reply_to: Option<Uuid>,
    pub turnstile_token: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PostDto {
    pub id: Uuid,
    pub content: String,

    pub author: User,
    pub attachments: Vec<Attachment>,
}
