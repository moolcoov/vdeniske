use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct UpdateUserReq {
    pub name: String,
}
