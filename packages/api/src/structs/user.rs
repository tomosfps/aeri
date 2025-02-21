use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Viewer {
    pub id:             Option<i32>,
    pub name:           Option<String>,
}
