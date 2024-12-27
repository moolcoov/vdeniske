use std::env;

use reqwest::multipart::Form;
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawSiteVerifyResponse {
    pub success: bool,
    #[serde(rename = "challenge_ts")]
    pub timestamp: Option<String>,
    pub hostname: Option<String>,
    pub action: Option<String>,
    pub cdata: Option<String>,
}

pub async fn confirm_turnstile_token(
    token: String,
    ip: String,
) -> Result<RawSiteVerifyResponse, ()> {
    let secret = env::var("TURNSTILE_SECRET_KEY").unwrap();
    let client = Client::new();

    let form_data = Form::new()
        .text("secret", secret)
        .text("response", token)
        .text("remoteip", ip);

    let response = client
        .post("https://challenges.cloudflare.com/turnstile/v0/siteverify")
        .multipart(form_data)
        .send()
        .await
        .unwrap();

    let value: RawSiteVerifyResponse = response.json().await.unwrap();

    Ok(value)
}
