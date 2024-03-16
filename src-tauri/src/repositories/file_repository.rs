use crate::models::client::{self, Client};
use crate::models::project::{Project, ProjectStatus};
use csv;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fs::File;

use super::repository_trait::Repository;

pub struct ClientFileRepository {
    file_path: String,
}

impl ClientFileRepository {
    pub fn new(file_path: &str) -> Self {
        Self {
            file_path: file_path.to_string(),
        }
    }

    pub fn fetch(&self) -> Result<Vec<Client>, Box<dyn Error>> {
        let file = File::open(&self.file_path)?;
        let mut rdr = csv::Reader::from_reader(file);
        let mut clients = Vec::new();

        for result in rdr.deserialize() {
            let client: Client = result?;
            clients.push(client);
        }

        Ok(clients)
    }
}

impl Repository<Client> for ClientFileRepository {
    fn get(&self, id: &str) -> Result<Option<Client>, String> {
        let clients = self.fetch().map_err(|e| e.to_string())?;
        for client in clients {
            if client.id == id {
                return Ok(Some(client));
            }
        }
        Ok(None)
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProjectCSV {
    pub id: String,
    pub title: String,
    pub description: String,
    // pub category: String, // ウェブデザイン、イラストなど
    pub order_date: String, // 実際にはより適切な日付型を使用する
    pub due_date: String,
    pub completion_date: Option<String>,
    pub client_id: String,
    pub status: ProjectStatus,
    pub folder_path:String, // todo:pathをパースするライブラリなど選定
}

pub struct ProjectFileRepository {
    project_file_path: String,
    client_file_path: String,
}

impl ProjectFileRepository {
    pub fn new(project_file_path: &str, client_file_path:&str) -> Self {
        Self {
            project_file_path: project_file_path.to_string(),
            client_file_path:client_file_path.to_string()
        }
    }

    pub fn fetch(&self) -> Result<Vec<Project>, Box<dyn Error>> {
        let file = File::open(&self.project_file_path)?;
        let mut rdr = csv::Reader::from_reader(file);
        let mut projects = Vec::new();

        let clients_repostiroy = ClientFileRepository::new(&self.client_file_path);


        for result in rdr.deserialize() {
            let project_csv: ProjectCSV = result?;
            let client = clients_repostiroy.get(&project_csv.client_id)?.expect(&format!("projectに紐づけられたClientがないよ, id={}", &project_csv.client_id));
            let project = convert_csv_to_project(project_csv, client);
            projects.push(project);
        }

        Ok(projects)
    }
}

impl Repository<Project> for ProjectFileRepository {
    fn get(&self, id: &str) -> Result<Option<Project>, String> {
        let projects = self.fetch().map_err(|e| e.to_string())?;
        for project in projects {
            if project.id == id {
                return Ok(Some(project));
            }
        }
        Ok(None)
    }
}

fn convert_csv_to_project(csv: ProjectCSV, client: Client) -> Project {
    Project {
        id: csv.id,
        title: csv.title,
        description: csv.description,
        order_date: csv.order_date, // 実際のアプリケーションでは日付の変換が必要かもしれません
        due_date: csv.due_date, // 実際のアプリケーションでは日付の変換が必要かもしれません
        completion_date: csv.completion_date, // 実際のアプリケーションでは日付の変換が必要かもしれません
        client: client, // 仮定により、この関数の呼び出し時にはすでに取得しています
        status: csv.status,
        folder_path: csv.folder_path,
    }
}