// models/client.rs
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Client {
    pub id:String,
    pub name: String,
    pub contact_person: String,
}
