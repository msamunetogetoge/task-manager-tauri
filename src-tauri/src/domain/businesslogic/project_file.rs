use std::{fs, path::PathBuf};

use crate::domain::models::project::Project;

// アプリが作成するプロジェクトのファイルのパス
pub fn get_project_manage_path() -> PathBuf {
    // 現在の実行ファイルのパスを取得
    let mut exe_path = std::env::current_exe().expect("Failed to get current exe path");
    
    // 実行ファイルがあるディレクトリに移動
    exe_path.pop();
    
    exe_path.push("project/");
    
    exe_path
}

// project用のディレクトリ作成
pub fn create_project_directories(project_directory_path:PathBuf)-> Result<(), String> {
    let directories = vec!["documents", "deliverables", "works"];

    for dir in &directories {
        let dir_path = project_directory_path.join(dir);
        fs::create_dir_all(&dir_path).map_err(|e| format!("Failed to create directory '{}': {}", dir_path.display(), e))?;
    }

    Ok(())
}


// project用のディレクトリ名を変更
pub fn rename_project_directory(
    old_project_directory_path: PathBuf,
    new_project_suffix: &str,
) -> Result<(), String> {
    // 古いディレクトリの親パスを取得
    if let Some(parent_path) = old_project_directory_path.parent() {
        // 新しいプロジェクトディレクトリのパスを作成
        let new_project_directory_path = parent_path.join(new_project_suffix);
        
        // ディレクトリ名の変更（移動）
        fs::rename(&old_project_directory_path, &new_project_directory_path)
            .map_err(|e| format!("Failed to rename directory from '{}' to '{}': {}", old_project_directory_path.display(), new_project_directory_path.display(), e))?;
    } else {
        return Err("Failed to get parent directory of the old project directory".to_string());
    }

    Ok(())
}

pub fn get_project_directory_path(project_folder_path_suffix:&str) -> PathBuf{
    let base_path = get_project_manage_path(); // 適切なパス取得関数を使用してください
    base_path.join(project_folder_path_suffix)
}


// project用のディレクトリ削除
pub fn delete_project_directories(project_directory_path:PathBuf) ->Result<(),String>{

    let directories = vec!["documents", "deliverables", "works"];
    for dir in directories.iter() {
        let dir_path = project_directory_path.join(dir);
        fs::remove_dir_all(&dir_path)
            .map_err(|e| format!("Failed to remove directory '{}': {}", dir_path.display(), e))?;
    }
    Ok(())
}

///  プロジェクトにすでにsuffixが登録されて入れば、それを返し、登録されていなければidを返す
pub fn get_folder_path_suffix(project:&Project)->String{
    match  project.folder_path_suffix{
        Some(ref suffix)   => return suffix.clone(),
        None => return project.id.clone()  
    };
}