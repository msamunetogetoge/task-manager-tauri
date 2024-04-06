// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod domain;
mod repositories;
mod application;

use std::env;

use application::{interface::ProjectFrontEnd, usecase::convert_project_to_frontend};
use domain::models::client::Client;
use domain::models::project::Project;
use repositories::{file_repository::{ClientFileRepository, ProjectFileRepository}, repository_trait::Repository};


struct AppState{
    project_repo: ProjectFileRepository,
    client_repo: ClientFileRepository
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command]
fn fetch_projects(state: tauri::State<'_, AppState>) ->Result<Vec<ProjectFrontEnd>, String>{
    let projects = state.project_repo.fetch().map_err(|e| e.to_string())?;
    let project_frontends = projects.into_iter().map(convert_project_to_frontend).collect::<Vec<ProjectFrontEnd>>();

    Ok(project_frontends)
}

#[tauri::command]
fn fetch_clients(state: tauri::State<'_, AppState>) ->Result<Vec<Client>, String>{
    state.client_repo.fetch().map_err(|e| e.to_string())
}


#[tauri::command]
fn add_project(new_project:Project , state: tauri::State<'_, AppState>) ->Result<(),String>{

    if let Err(e) = state.project_repo.add(new_project) {
        return Err(e.to_string());
    }
  
    Ok(())
}

#[tauri::command]
fn update_project(mut project:Project, state: tauri::State<'_, AppState>) ->Result<(),String>{
     // プロジェクトに付随するClientが新しければ、新規作成
     if let Ok(None) =state.client_repo.get(&project.client.id)  {
        let new_client_id= state.client_repo.add(project.client.clone()).map_err(|e| e.to_string())?;
        project.client.id=new_client_id;
    }
    if let Err(e) = state.project_repo.update(project){
        println!("{:?}", e.to_string());
        return  Err(e.to_string());
    }
    Ok(())
}

#[tauri::command]
fn update_client(client:Client , state: tauri::State<'_, AppState>) ->Result<(),String>{
    if let Err(e) = state.client_repo.update(client){
        return  Err(e.to_string());
    }
    Ok(())
}

fn main() {
   
   let project_repository = ProjectFileRepository::new();
   let client_repository = ClientFileRepository::new(&project_repository.get_self_client_file_path());

    
    // repositoryの初期化
    let app_state = AppState {
        project_repo: project_repository,
        client_repo: client_repository,
        };

    // test_reading_csv();
    tauri::Builder::default()
        .manage(app_state)  // AppStateをTauriアプリケーションに登録
        .invoke_handler(tauri::generate_handler![fetch_projects, fetch_clients, add_project,update_project, update_client])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

        
}
