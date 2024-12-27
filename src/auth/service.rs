use std::{
    env, fmt,
    time::{SystemTime, UNIX_EPOCH},
};

use bcrypt::verify;
use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
use sqlx::{Pool, Postgres};

use crate::{
    user::{
        entity::User,
        service::{create_user, get_user_by_username},
    },
    utils::{is_dev, turnstile::confirm_turnstile_token},
};

use super::dto::{Claims, LoginReqDto, LoginResDto, RegisterReqDto};

#[derive(Debug)]
pub(crate) enum LoginError {
    UserNotFound,
    InvalidPassword,
    TurnstileError,
}

impl fmt::Display for LoginError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            LoginError::UserNotFound => write!(f, "User not found"),
            LoginError::InvalidPassword => write!(f, "Password is invalid"),
            LoginError::TurnstileError => write!(f, "Turnstile confirmation error"),
        }
    }
}

impl std::error::Error for LoginError {}

pub async fn login(
    db: &Pool<Postgres>,
    dto: LoginReqDto,
    ip: String,
) -> Result<LoginResDto, LoginError> {
    let secret = env::var("JWT_SECRET").unwrap_or("POMODORO".to_string());

    if !is_dev() {
        let confirmation = confirm_turnstile_token(dto.turnstile_token, ip)
            .await
            .unwrap();

        if !confirmation.success {
            return Err(LoginError::TurnstileError);
        }
    }

    let user = get_user_by_username(db, dto.username).await;

    if user.is_none() {
        return Err(LoginError::UserNotFound);
    }

    let user = user.unwrap();

    let is_valid_password = verify(dto.password, user.password.as_str()).unwrap();
    if !is_valid_password {
        return Err(LoginError::InvalidPassword);
    }

    let expiration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        + 60 * 60 * 24; // one day

    let claims = Claims {
        id: user.id.to_string(),
        avatar: user.avatar.clone(),
        username: user.username.clone(),
        name: user.name.clone(),
        exp: expiration as usize,
    };

    let header = Header::new(Algorithm::HS256);
    let token = encode(&header, &claims, &EncodingKey::from_secret(secret.as_ref())).unwrap();

    return Ok(LoginResDto {
        access_token: token,
        user,
    });
}

pub async fn register(
    db: &Pool<Postgres>,
    dto: RegisterReqDto,
    ip: String,
) -> Result<User, LoginError> {
    if !is_dev() {
        let confirmation = confirm_turnstile_token(dto.turnstile_token.clone(), ip)
            .await
            .unwrap();

        if !confirmation.success {
            return Err(LoginError::TurnstileError);
        }
    }

    let user = create_user(db, dto).await;

    Ok(user)
}
