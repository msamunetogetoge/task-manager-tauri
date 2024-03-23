// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod repositories;

use std::path::Path;
use std::{fs, path::PathBuf};
use std::{env, io};

use models::client::Client;
use models::project::Project;
use repositories::{file_repository::{ClientFileRepository, ProjectFileRepository}, repository_trait::Repository};


struct AppState{
    project_repo: ProjectFileRepository,
    client_repo: ClientFileRepository
}

// projectの情報を格納するファイルのパス
fn get_project_file_path() -> PathBuf {
    // 現在の実行ファイルのパスを取得
    let mut exe_path = env::current_exe().expect("Failed to get current exe path");
    
    // 実行ファイルがあるディレクトリに移動
    exe_path.pop();
    
    // "files/projects.csv" へのパスを追加
    exe_path.push("files/projects.csv");
    
    exe_path
}

// clientの情報を格納するファイルのパス
fn get_client_file_path() -> PathBuf {
    // 現在の実行ファイルのパスを取得
    let mut exe_path = env::current_exe().expect("Failed to get current exe path");
    
    // 実行ファイルがあるディレクトリに移動
    exe_path.pop();
    
    // "files/clients.csv" へのパスを追加
    exe_path.push("files/clients.csv");
    
    exe_path
}

// アプリが作成するプロジェクトのファイルのパス
fn get_project_manage_path() -> PathBuf {
    // 現在の実行ファイルのパスを取得
    let mut exe_path = env::current_exe().expect("Failed to get current exe path");
    
    // 実行ファイルがあるディレクトリに移動
    exe_path.pop();
    
    exe_path.push("project/");
    
    exe_path
}

// ディレクトリが存在するか？
fn ensure_directory_exists(path: &Path) -> std::io::Result<()> {
    if !path.exists() {
        fs::create_dir_all(path)?;
    }
    Ok(())
}


// csvファイルが作成するかチェック。なければ作成。
fn ensure_csv_file_exists(path: &Path, headers: &[&str]) -> io::Result<()> {
    let file_exists = path.exists();
    
    if file_exists {
        // ファイルが存在する場合、ヘッダーの確認（オプション）
        let mut rdr = csv::ReaderBuilder::new().has_headers(true).from_path(path)?;
        let rdr_headers = rdr.headers()?;
        if rdr_headers != headers {
            return Err(io::Error::new(io::ErrorKind::Other, "CSV header mismatch"));
        }
    } else {
        // ファイルが存在しない場合、新規作成
        let mut wtr = csv::WriterBuilder::new().from_path(path)?;
        wtr.write_record(headers)?;
        wtr.flush()?;
    }

    Ok(())
}

/// 初期化処理
fn initialize_application() -> std::io::Result<()> {
    // プロジェクト管理フォルダの作成
    let project_manage_path = get_project_manage_path();
    ensure_directory_exists(&project_manage_path)?;

    // プロジェクトCSVファイルの作成
    let project_file_path = get_project_file_path();
    ensure_csv_file_exists(&project_file_path, &["id","title","description","order_date","due_date","completion_date","client_id","status","folder_path"])?;

    // クライアントCSVファイルの作成
    let client_file_path = get_client_file_path();
    ensure_csv_file_exists(&client_file_path, &["id","name","contact_person"])?;

    Ok(())
}


// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn fetch_projects(state: tauri::State<'_, AppState>) ->Result<Vec<Project>, String>{
    state.project_repo.fetch().map_err(|e| e.to_string())
}

#[tauri::command]
fn fetch_clients(state: tauri::State<'_, AppState>) ->Result<Vec<Client>, String>{
    state.client_repo.fetch().map_err(|e| e.to_string())
}


#[tauri::command]
fn add_project(mut new_project:Project , state: tauri::State<'_, AppState>) ->Result<(),String>{

    // プロジェクトに付随するClientが新しければ、新規作成
    if let Ok(None) =state.client_repo.get(&new_project.client.id)  {
        state.client_repo.add(new_project.client.clone()).map_err(|e| e.to_string())?;
    }
    // 新規プロジェクトのIDを生成
    let new_id = state.project_repo.new_project_id().map_err(|e| e.to_string())?;

     // プロジェクトのディレクトリ構造を作成
     let base_path = get_project_manage_path();
     let project_path = base_path.join(&new_id.to_string()); // プロジェクトIDを基にしたパス
 
     // 必要なサブディレクトリ
     let directories = vec!["documents", "deliverables", "works"];
 
     for dir in directories.iter() {
         let dir_path = project_path.join(dir);
         fs::create_dir_all(&dir_path)
             .map_err(|e| format!("Failed to create directory '{}': {}", dir_path.display(), e))?;
     }

    // プロジェクトの新規登録
    new_project.folder_path = project_path.to_str().expect("error in getting project path").to_string();
    if let Err(e) = state.project_repo.add(new_project) {
        // 失敗したら、ディレクトリも削除する
        for dir in directories.iter() {
            let dir_path = project_path.join(dir);
            fs::remove_dir_all(&dir_path)
                .map_err(|e| format!("Failed to remove directory '{}': {}", dir_path.display(), e))?;
        }
        return Err(e.to_string());
    }
  
    Ok(())
}

fn main() {
    if let Err(e) = initialize_application() {
        println!("Failed to initialize application: {}", e);
        return;
    }

    let project_file_path_buf = get_project_file_path();
    let client_file_path_buf = get_client_file_path();

    let project_file_path = project_file_path_buf.to_str().expect("can not get project file path");
    let client_file_path = client_file_path_buf.to_str().expect("can not get client file path");

    // repositoryの初期化
    let app_state = AppState {
        project_repo: ProjectFileRepository::new(project_file_path, client_file_path),
        client_repo: ClientFileRepository::new(client_file_path),

    };

    // test_reading_csv();
    tauri::Builder::default()
        .manage(app_state)  // AppStateをTauriアプリケーションに登録
        .invoke_handler(tauri::generate_handler![greet, fetch_projects, fetch_clients, add_project])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
