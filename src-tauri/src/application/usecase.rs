use crate::{domain::{businesslogic::project_file::get_project_directory_path, models::project::Project}, repositories::file_repository::ProjectFileRepository};

use super::interface::ProjectFrontEnd;

pub fn convert_ifrontend_to_project(input:ProjectFrontEnd)-> Project{

    Project{
        id:input.id,
        title:input.title,
        description:input.description,
        order_date:input.order_date,
        due_date:input.due_date,
        completion_date:input.completion_date,
        client:input.client,
        status:input.status,
        folder_path_suffix:input.folder_path_suffix
    }
}


pub fn convert_project_to_frontend(input: Project) -> ProjectFrontEnd {

    let folder_path_suffix = input.folder_path_suffix.as_deref().unwrap_or(&input.id);
    let folder_path = Some(get_project_directory_path(folder_path_suffix).to_string_lossy().into());

    // プロジェクトフロントエンドのインスタンスを作成
    ProjectFrontEnd {
        id: input.id,
        title: input.title,
        description: input.description,
        order_date: input.order_date,
        due_date: input.due_date,
        completion_date: input.completion_date,
        client: input.client,
        status: input.status,
        folder_path,
        folder_path_suffix: input.folder_path_suffix,
    }
}


// pub fn fetch_projects(repository:ProjectFileRepository)->Result<Vec<ProjectFrontEnd>,String>{
//     let projects = repository.fetch().map_err(|e| e.to_string())?;
//     let project_frontends = projects.into_iter().map(convert_project_to_frontend).collect::<Vec<ProjectFrontEnd>>();

//     return Ok(project_frontends)

// }