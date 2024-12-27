use super::entity::Post;
use crate::auth::service::LoginError;
use crate::utils::{is_dev, Pageable};
use crate::{post::dto::CreatePostDto, utils::turnstile::confirm_turnstile_token};
use sqlx::{Pool, Postgres};
use std::str::FromStr;
use uuid::Uuid;

pub async fn get_posts(
    db: &Pool<Postgres>,
    search: String,
    page_size: i64,
    page_number: i64,
) -> Pageable<Vec<Post>> {
    let offset = page_size * (page_number - 1);

    if page_size > 100 {
        return Pageable {
            content: vec![],
            page_size,
            page_number,
            last_page: 0,
        };
    }

    let posts = sqlx::query_as::<_, Post>(
        r#"
            SELECT p.*,
                json_agg(u) as author,
                json_agg(a) as attachments
            FROM posts p
            LEFT JOIN users u ON u.id = p.user_id
            LEFT JOIN attachments a ON a.post_id = p.id
            WHERE p.content ILIKE $1
            GROUP BY p.id, p.content, p.user_id
            ORDER BY p.id
            LIMIT $2 OFFSET $3;
        "#,
    )
    .bind(format!("%{}%", search.clone().to_lowercase()))
    .bind(page_size)
    .bind(offset)
    .fetch_all(db)
    .await
    .unwrap();

    let row: (i64,) = sqlx::query_as("select count(p.*) from posts p where p.content ilike $1")
        .bind(format!("%{}%", search.clone().to_lowercase()))
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
    println!("{}", id.to_string());
    let post = sqlx::query_as::<_, Post>(
        r#"
                SELECT p.*,
                    json_agg(u) as author,
                    json_agg(a) as attachments
                FROM posts p
                LEFT JOIN users u ON u.id = p.user_id
                LEFT JOIN attachments a ON a.post_id = p.id
                WHERE p.id = $1
                GROUP BY p.id, p.content, p.user_id;
        "#,
    )
    .bind(id)
    .fetch_one(db)
    .await;

    post.ok()
}

pub async fn create_post(
    db: &Pool<Postgres>,
    dto: CreatePostDto,
    user_id: Uuid,
    ip: String,
) -> Result<Post, LoginError> {
    if !is_dev() {
        let confirmation = confirm_turnstile_token(dto.turnstile_token.clone(), ip)
            .await
            .unwrap();

        if !confirmation.success {
            return Err(LoginError::TurnstileError);
        }
    }

    let post: (String,) = sqlx::query_as(
        r#"
            INSERT INTO posts (content, user_id) VALUES ($1, $2) RETURNING id;
        "#,
    )
    .bind(dto.content)
    .bind(user_id.to_string())
    .fetch_one(db)
    .await
    .unwrap();

    let post_id = Uuid::from_str(post.0.as_str()).unwrap();

    Ok(get_post_by_id(db, post_id).await.unwrap())
}

pub async fn get_posts_by_user_id(
    db: &Pool<Postgres>,
    user_id: Uuid,
    page_size: i64,
    page_number: i64,
) -> Pageable<Vec<Post>> {
    let offset = page_size * (page_number - 1);

    let posts = sqlx::query_as::<_, Post>(
        r#"
            SELECT p.*,
                    json_agg(u) as author,
                    json_agg(a) as attachments
            FROM posts p
            LEFT JOIN users u ON u.id = p.user_id
            LEFT JOIN attachments a ON a.post_id = p.id
            WHERE p.user_id = $1
            GROUP BY p.id, p.content, p.user_id
            ORDER BY p.id
            LIMIT $2 OFFSET $3;
        "#,
    )
    .bind(user_id)
    .bind(page_size)
    .bind(offset)
    .fetch_all(db)
    .await
    .unwrap();

    let row: (i64,) = sqlx::query_as("select count(p.*) from posts p where p.user_id = $1")
        .bind(user_id)
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
