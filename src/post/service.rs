use sqlx::{Pool, Postgres};
use uuid::Uuid;

use crate::utils::Pageable;

use super::entity::Post;

pub async fn get_posts(
    db: &Pool<Postgres>,
    search: String,
    page_size: i64,
    page_number: i64,
) -> Pageable<Vec<Post>> {
    let offset = page_size * (page_number - 1);

    let posts = sqlx::query_as::<_, Post>(
        r#"
            SELECT p.*,
                u.id AS user_id,
                u.name AS user_name,
                u.username AS user_username,
                u.avatar AS user_avatar
            FROM posts p
            LEFT JOIN users u ON u.id = p.user_id
            WHERE p.content ILIKE $1
            ORDER BY p.id
            LIMIT $2 OFFSET $3;
        "#,
    )
    .bind(search.clone().to_lowercase())
    .bind(page_size as i64)
    .bind(offset as i64)
    .fetch_all(db)
    .await
    .unwrap();

    let row: (i64,) = sqlx::query_as("select count(p.*) from posts p where p.content ILIKE $1")
        .bind(search.to_lowercase())
        .fetch_one(db)
        .await
        .unwrap();

    Pageable {
        content: posts,
        page_size,
        page_number,
        last_page: (row.0 as f64 / page_size as f64).ceil() as i64,
    }
}

pub async fn get_post_by_id(db: &Pool<Postgres>, id: Uuid) -> Option<Post> {
    let post = sqlx::query_as::<_, Post>(
        r#"
                select p.*,
                    u.id as user_id,
                    u.name as user_name,
                    u.username as user_username,
                    u.avatar as user_avatar
                from posts p
                where p.id = $1
                left join users u on u.id = p.user_id
            "#,
    )
    .bind(id.to_string())
    .fetch_one(db)
    .await;

    return post.ok();
}
