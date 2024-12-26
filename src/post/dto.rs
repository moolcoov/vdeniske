use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::post::entity::Attachment;
use crate::user::entity::User;

#[derive(Serialize, Deserialize, Debug)]
pub struct CreatePostDto {
    pub content: String
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PostDto {
    pub id: Uuid,
    pub content: String,

    pub author: User,
    pub attachments: Vec<Attachment>
}