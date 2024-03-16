// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod repositories;

use repositories::file_repository::{ProjectFileRepository};
use models::project::Project;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn fetch_projects() ->Result<Vec<Project>, ()>{
    return test_reading_csv()
}

fn test_reading_csv() -> Result<Vec<Project>, ()>{
    let project_file_path ="C:/Users/kenji/code/rust/task-manager-tauri/files/projects.csv";
    let client_file_path ="C:/Users/kenji/code/rust/task-manager-tauri/files/clients.csv";

    let project_repo = ProjectFileRepository::new(project_file_path, client_file_path);
    let projects = project_repo.fetch().map_err(|e| e.to_string());
    match  projects {
        Ok(p) =>{
            Ok(p)
        },
        Err(e)=>{
            Err(println!("cannot read csv, or something wrong: {}",e))
        }
        
    }
   
        
}

fn main() {
    // test_reading_csv();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, fetch_projects])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
