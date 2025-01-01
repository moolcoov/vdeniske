use sqlx::{Pool, Postgres};
use uuid::Uuid;

use super::{entity::Attachment, service::get_post_by_id};

pub async fn create_attachment(
    db: &Pool<Postgres>,
    post_id: Uuid,
    user_id: Uuid,
    file_type: String,
    file_path: String,
) -> Result<Attachment, String> {
    let post = get_post_by_id(db, post_id).await;

    if post.is_none() {
        return Err("Post not found".to_string());
    }

    let unwrapped_post = post.unwrap();
    if !unwrapped_post.author.iter().any(|u| u.id == user_id) {
        return Err("You are not the author of this post".to_string());
    }

    let attachment = sqlx::query_as::<_, Attachment>(
        r#"
            INSERT INTO attachments (type, filename, user_id, post_id) VALUES ($1, $2, $3, $4) RETURNING *;
            "#,
    )
    .bind(file_type)
    .bind(file_path)
    .bind(user_id)
    .bind(unwrapped_post.id)
    .fetch_one(db)
    .await
    .unwrap();

    Ok(attachment)
}

pub async fn remove_attachment(
    db: &Pool<Postgres>,
    post_id: Uuid,
    attachment_id: Uuid,
    user_id: Uuid,
) -> Result<(), String> {
    let post = get_post_by_id(db, post_id).await;

    if post.is_none() {
        return Err("Post not found".to_string());
    }

    let unwrapped_post = post.unwrap();
    if !unwrapped_post.author.iter().any(|u| u.id == user_id) {
        return Err("You are not the author of this post".to_string());
    }

    sqlx::query(
        r#"
            DELETE FROM attachments WHERE id = $1;
            "#,
    )
    .bind(attachment_id)
    .execute(db)
    .await
    .unwrap();

    Ok(())
}
