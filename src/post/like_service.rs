use crate::utils::Status;
use sqlx::{Executor, Pool, Postgres};
use uuid::Uuid;

pub async fn like_post(db: &Pool<Postgres>, user_id: Uuid, post_id: Uuid) -> Status {
    let (is_liked, is_disliked) = check_like_post(db, &user_id, &post_id).await;

    if is_disliked {
        remove_dislike(db, &user_id, &post_id).await;
    }

    if is_liked {
        remove_like(db, &user_id, &post_id).await;
    } else {
        create_like(db, &user_id, &post_id).await;
    }

    Status { success: true }
}

pub async fn dislike_post(db: &Pool<Postgres>, user_id: Uuid, post_id: Uuid) {
    let (is_liked, is_disliked) = check_like_post(db, &user_id, &post_id).await;

    if is_liked {
        remove_like(db, &user_id, &post_id).await;
    }

    if is_disliked {
        remove_dislike(db, &user_id, &post_id).await;
    } else {
        create_dislike(db, &user_id, &post_id).await;
    }
}

async fn check_like_post(db: &Pool<Postgres>, user_id: &Uuid, post_id: &Uuid) -> (bool, bool) {
    let result: (bool, bool) = sqlx::query_as(
        r#"
            SELECT
              EXISTS (
                SELECT 1
                FROM post_likes
                WHERE user_id = $1 AND post_id = $2
              ) AS liked,
              EXISTS (
                SELECT 1
                FROM post_dislikes
                WHERE user_id = $1 AND post_id = $2
              ) AS disliked;
        "#,
    )
    .bind(user_id)
    .bind(post_id)
    .fetch_one(db)
    .await
    .unwrap();

    result
}

async fn remove_dislike(db: &Pool<Postgres>, user_id: &Uuid, post_id: &Uuid) {
    sqlx::query(
        r#"
            DELETE FROM post_dislikes
            WHERE user_id = $1 AND post_id = $2
        "#,
    )
    .bind(user_id)
    .bind(post_id)
    .execute(db)
    .await
    .expect("error delete remove dislike");
}

async fn remove_like(db: &Pool<Postgres>, user_id: &Uuid, post_id: &Uuid) {
    sqlx::query(
        r#"
            DELETE FROM post_likes
            WHERE user_id = $1 AND post_id = $2
        "#,
    )
    .bind(user_id)
    .bind(post_id)
    .execute(db)
    .await
    .expect("error delete remove like");
}

async fn create_like(db: &Pool<Postgres>, user_id: &Uuid, post_id: &Uuid) {
    sqlx::query(
        r#"
            INSERT INTO post_likes (user_id, post_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, post_id) DO NOTHING;
        "#,
    )
    .bind(user_id)
    .bind(post_id)
    .execute(db)
    .await
    .expect("error create like");
}

async fn create_dislike(db: &Pool<Postgres>, user_id: &Uuid, post_id: &Uuid) {
    sqlx::query(
        r#"
            INSERT INTO post_dislikes (user_id, post_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, post_id) DO NOTHING;
        "#,
    )
    .bind(user_id)
    .bind(post_id)
    .execute(db)
    .await
    .expect("error create dislike");
}
