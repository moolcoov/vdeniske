use axum::http::{request::Request, StatusCode};
use serde::{Deserialize, Serialize};
use tower_governor::{errors::GovernorError, key_extractor::KeyExtractor};
use tracing::info;

#[derive(Debug, Serialize, Deserialize, Clone, Eq, PartialEq)]
pub struct CfToken;

impl KeyExtractor for CfToken {
    type Key = String;

    fn extract<B>(&self, req: &Request<B>) -> Result<Self::Key, GovernorError> {
        let token = req
            .headers()
            .get("CF-Connecting-IP")
            .and_then(|token| {
                let token = token.to_str().ok().unwrap_or("default");
                Some(token.to_string())
            })
            .or(Some("goida".to_string()));

        token.ok_or(GovernorError::Other {
            code: StatusCode::FORBIDDEN,
            headers: None,
            msg: Some("no token".to_string()),
        })
    }
}
