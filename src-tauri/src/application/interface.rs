use crate::domain::models::{client::Client, project::ProjectStatus};
use serde::{Deserialize, Serialize};
/// フロントエンドのProject
/// 
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProjectFrontEnd{
        pub id: String,
        pub title: String,
        pub description: String,
        pub order_date: String, 
        pub due_date: String,
        pub completion_date: Option<String>,
        pub client: Client,
        pub status: ProjectStatus,
        pub folder_path:Option<String>, 
        pub folder_path_suffix:Option<String>
    
}