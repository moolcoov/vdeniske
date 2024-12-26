use bcrypt::{hash, DEFAULT_COST};
use sqlx::{Pool, Postgres};
use uuid::Uuid;

use crate::auth::dto::RegisterReqDto;

use super::entity::User;

pub async fn get_users(db: &Pool<Postgres>) -> Vec<User> {
    let users = sqlx::query_as::<_, User>("select * from users")
        .fetch_all(db)
        .await
        .unwrap();

    users
}

pub async fn get_user_by_id(db: &Pool<Postgres>, id: Uuid) -> Option<User> {
    let user = sqlx::query_as::<_, User>("select * from users where id = ?")
        .bind(id.to_string())
        .fetch_one(db)
        .await;

    user.ok()
}

pub async fn get_user_by_username(db: &Pool<Postgres>, username: String) -> Option<User> {
    let user = sqlx::query_as::<_, User>("select * from users where username = $1")
        .bind(username)
        .fetch_one(db)
        .await;

    user.ok()
}

pub async fn create_user(db: &Pool<Postgres>, user: RegisterReqDto) -> User {
    let saved_user = sqlx::query_as::<_, User>(
        "insert into users (name, username, email, password) values ($1, $2, $3, $4) returning *",
    )
    .bind(user.name)
    .bind(user.username)
    .bind(user.email)
    .bind(hash(user.password, DEFAULT_COST).unwrap())
    .fetch_one(db)
    .await
    .unwrap();

    saved_user
}
