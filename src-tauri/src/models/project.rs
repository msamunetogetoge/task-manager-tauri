// models/order.rs
use crate::models::client::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Project {
    pub id: String,
    pub title: String,
    pub description: String,
    // pub category: String, // ウェブデザイン、イラストなど
    pub order_date: String, // 実際にはより適切な日付型を使用する
    pub due_date: String,
    pub completion_date: Option<String>,
    pub client: Client,
    pub status: ProjectStatus,
    pub folder_path:String, // todo:pathをパースするライブラリなど選定
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub enum ProjectStatus {
    InProgress,
    Completed,
    OnHold,
}
