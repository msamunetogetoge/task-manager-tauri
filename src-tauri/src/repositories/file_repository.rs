use crate::domain::models::client::Client;
use crate::domain::models::project::{Project, ProjectStatus};

use crate::domain::businesslogic::project_file::{create_project_directories, delete_project_directories, get_folder_path_suffix, get_project_directory_path, get_project_manage_path, rename_project_directory};

use csv;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fmt::Debug;
use std::fs::{File};

use std::fs::OpenOptions;
use std::{io};
use std::path::{Path, PathBuf};

use tempfile::NamedTempFile;

use super::repository_trait::Repository;

trait FileRepository {
    fn get_file_path(&self) -> &Path;
    /// 初期化処理
    fn initialize_file_repository() -> std::io::Result<(String,String)> {
        // プロジェクト管理フォルダの作成
        let project_manage_path = get_project_manage_path();
        let csv_file_directory_path = Self::get_csv_file_directory_path();
        Self::ensure_directory_exists(&project_manage_path)?;
        Self::ensure_directory_exists(&csv_file_directory_path)?;

        // プロジェクトのファイルフォルダ作成

        // プロジェクトCSVファイルの作成
        let project_file_path_buf = Self::get_project_file_path();
        Self::ensure_csv_file_exists(&project_file_path_buf, &["id","title","description","order_date","due_date","completion_date","client_id","status","folder_path"])?;

        // クライアントCSVファイルの作成
        let client_file_path_buf = Self::get_client_file_path();
        Self::ensure_csv_file_exists(&client_file_path_buf, &["id","name","contact_person"])?;

        let project_file_path = project_file_path_buf.to_str().expect("can not get project file path").to_string();
        let client_file_path = client_file_path_buf.to_str().expect("can not get client file path").to_string();

        Ok((project_file_path,client_file_path) )
    }

    // projectの情報を格納するファイルのパス
    fn get_project_file_path() -> PathBuf {
        // 現在の実行ファイルのパスを取得
        let mut exe_path = std::env::current_exe().expect("Failed to get current exe path");
        
        // 実行ファイルがあるディレクトリに移動
        exe_path.pop();
        
        // "files/projects.csv" へのパスを追加
        exe_path.push("files/projects.csv");
        
        exe_path
    }

    // clientの情報を格納するファイルのパス
    fn get_client_file_path() -> PathBuf {
        // 現在の実行ファイルのパスを取得
        let mut exe_path = std::env::current_exe().expect("Failed to get current exe path");
        
        // 実行ファイルがあるディレクトリに移動
        exe_path.pop();
        
        // "files/clients.csv" へのパスを追加
        exe_path.push("files/clients.csv");
        
        exe_path
    }


    // アプリが作成するファイルのディレクトリのパス
    fn get_csv_file_directory_path() -> PathBuf {
        // 現在の実行ファイルのパスを取得
        let mut exe_path = std::env::current_exe().expect("Failed to get current exe path");
        
        // 実行ファイルがあるディレクトリに移動
        exe_path.pop();
        
        exe_path.push("files/");
        
        exe_path
    }

   

    // ディレクトリが存在するか？
    fn ensure_directory_exists(path: &Path) -> std::io::Result<()> {
        if !path.exists() {
            std::fs::create_dir_all(path)?;
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
    // 他の共通のメソッドもここに追加
}


pub struct ClientFileRepository {
    file_path: String,
}

impl FileRepository for ClientFileRepository{
    fn get_file_path(&self) -> &Path {
        Path::new(&self.file_path)
    }
}

impl ClientFileRepository {
    pub fn new(file_path: &str) -> Self {
        Self {
            file_path: file_path.to_string(),
        }
    }

    pub fn new_client_id(&self) -> Result<i32, String> {
        let file = File::open(&self.file_path).map_err(|e| e.to_string())?;
        let mut rdr = csv::Reader::from_reader(file);
        let mut max_id = 0;
    
        for result in rdr.deserialize() {
            let csv: Result<Client, csv::Error> = result;
            let csv = csv.map_err(|e| e.to_string())?;
            let id = csv.id.parse::<i32>().map_err(|e| e.to_string())?;
            if id > max_id {
                max_id = id;
            }
        }
    
        Ok(max_id + 1)
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
    fn add(&self, mut new_client: Client) -> Result<String, String>{
        // 新しいクライアントIDの生成
        let new_id = self.new_client_id()?;
        new_client.id = new_id.to_string();

        let file_path = Path::new(&self.file_path);
        let file_exists = file_path.exists();

        let file = OpenOptions::new()
            .write(true)
            .append(true)
            .open(file_path)
            .map_err(|err| err.to_string())?;

        let mut wtr = if file_exists {
            // ファイルが存在する場合、ヘッダーを書き込まずにWriterを生成
            csv::WriterBuilder::new().has_headers(false).from_writer(file)
        } else {
            // ファイルが新規作成された場合、ヘッダーを書き込むようにWriterを生成
            csv::WriterBuilder::new().has_headers(true).from_writer(file)
        };
        wtr.serialize(new_client).map_err(|err| err.to_string())?;
        wtr.flush().map_err(|err| err.to_string())?;

        Ok(new_id.to_string())
    }
    fn update(&self,  updated_client:Client) ->Result<(),String>{
        // 一時ファイルを作成します。
        let mut temp_file = NamedTempFile::new().expect("tempfiles作成失敗");

        {
            // 元のファイルを開きます。
            let file = File::open(&self.file_path).map_err(|e| e.to_string())?;
            let mut rdr = csv::Reader::from_reader(file);
            let mut wtr = csv::Writer::from_writer(&mut temp_file);

            // CSVリーダーを使用して、クライアントを1つずつ処理します。
            for result in rdr.deserialize() {
                let mut client: Client = result.map_err(|e| e.to_string())?;
                
                // 見つけたクライアントが更新すべきものであれば、更新します。
                if client.id == updated_client.id {
                    client = updated_client.clone();
                }

                // 一時ファイルに書き込みます。
                wtr.serialize(&client).map_err(|e| e.to_string())?;
            }
            // 一時ファイルを元のファイル名にリネームする前に、元のファイルを閉じることを確認します。
            drop(wtr);
            drop(rdr);
        }
        // 元のファイルと一時ファイルを入れ替えます。
        std::fs::rename(temp_file.path(), &self.file_path).map_err(|e| e.to_string())?;
        
        Ok(())
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
    pub folder_path:String, 
}

pub struct ProjectFileRepository {
    project_file_path: String,
    client_file_path: String,
}

impl FileRepository for ProjectFileRepository{
    fn get_file_path(&self) -> &Path {
        Path::new(&self.project_file_path)
    }
}

impl ProjectFileRepository {
    pub fn new() -> Self {

        let (project_file_path,client_file_path ) = Self::initialize_file_repository().expect("Failed to initialize file repository");        
        Self {
            project_file_path: project_file_path,
            client_file_path:client_file_path
        }
    }

    /// Returns the get self client file path of this [`ProjectFileRepository`].
    pub fn get_self_client_file_path(&self)->String{
        self.client_file_path.to_string()
    }

    pub fn new_project_id(&self) -> Result<i32, String> {
        let file = File::open(self.get_file_path()).map_err(|e| e.to_string())?;
        let mut rdr = csv::Reader::from_reader(file);
        let mut max_id = 0;
    
        for result in rdr.deserialize() {
            let project_csv: Result<ProjectCSV, csv::Error> = result;
            let project_csv = project_csv.map_err(|e| e.to_string())?;
            let id = project_csv.id.parse::<i32>().unwrap_or(0);
            if id > max_id {
                max_id = id;
            }
        }
    
        Ok(max_id + 1)
    }

    pub fn fetch(&self) -> Result<Vec<Project>, Box<dyn Error>> {
        let file = File::open(self.get_file_path())?;
        let mut rdr = csv::Reader::from_reader(file);
        let mut projects = Vec::new();

        let clients_repostiroy = ClientFileRepository::new(&self.get_self_client_file_path());


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
    fn add(&self, mut new_project: Project) -> Result<String,String>{

        // 新しいプロジェクトIDの生成
        let new_id = self.new_project_id()?;
        new_project.id = new_id.to_string();

        let client_repository = ClientFileRepository::new(&self.client_file_path);

        // 指定されたクライアントが新規の時はクライアントのcsvに追記する。
        if let Ok(None) = client_repository.get(&new_project.client.id)  {
            let new_client_id= client_repository.add(new_project.client.clone()).map_err(|e| e.to_string())?;
            new_project.client.id=new_client_id;
        }

        // プロジェクトディレクトリの作成
        let project_folder_suffix = get_folder_path_suffix(&new_project);
        let project_path = get_project_directory_path(&project_folder_suffix);
        
        if project_path.exists(){
            return Err("既に存在するプロジェクト名です。".to_string())
        }
        
        let _ = create_project_directories(project_path.clone())?;


        // csvファイルへ書き込み
        let file_path = Path::new(&self.project_file_path);
        let file_exists = file_path.exists();

        let file = OpenOptions::new().write(true).append(true).open(file_path).map_err(|err| err.to_string())?;

        let new_project_csv:ProjectCSV =convert_project_to_csv(new_project)?;

        let mut wtr = if file_exists {
            // ファイルが存在する場合、ヘッダーを書き込まずにWriterを生成
            csv::WriterBuilder::new().has_headers(false).from_writer(file)
        } else {
            // ファイルが新規作成された場合、ヘッダーを書き込むようにWriterを生成
            csv::WriterBuilder::new().has_headers(true).from_writer(file)
        };
        if let Err(_) = wtr.serialize(new_project_csv){delete_project_directories(project_path.clone())?};
        if let Err(_) = wtr.flush().map_err(|err| err.to_string()){delete_project_directories( project_path.clone())?};
        Ok(new_id.to_string())
    }

    fn get(&self, id: &str) -> Result<Option<Project>, String> {
        let projects = self.fetch().map_err(|e| e.to_string())?;
        for project in projects {
            if project.id == id {
                return Ok(Some(project));
            }
        }
        Ok(None)
    }

    fn update(&self, mut updated_project:Project) ->Result<(),String>{
        // 一時ファイルを作成します。
        let mut temp_file = NamedTempFile::new().expect("tempfiles作成失敗");
        let new_suffix = get_folder_path_suffix(&updated_project);

        let new_folder_path = get_project_directory_path(&new_suffix);
        if let Ok(Some(old_project)) = self.get(&updated_project.id){
            if get_folder_path_suffix(&old_project ) != new_suffix &&  new_folder_path.exists() {
                return Err("既に存在するプロジェクト名です。".to_string())
            }
        }
       

        let client_repository = ClientFileRepository::new(&self.client_file_path);
        // 指定されたクライアントが新規の時はクライアントのcsvに追記する。
        if let Ok(None) = client_repository.get(&updated_project.client.id)  {
            let new_client_id= client_repository.add(updated_project.client.clone()).map_err(|e| e.to_string())?;
            updated_project.client.id=new_client_id;
        }

        let updated_project_csv = convert_project_to_csv(updated_project)?;
        {
            // 元のファイルを開きます。
            let file = File::open(&self.project_file_path).map_err(|e| e.to_string())?;
            let mut rdr = csv::Reader::from_reader(file);
            let mut wtr = csv::Writer::from_writer(&mut temp_file);

            // もしもsuffixが変更されていたらフォルダ構成を変更する

            // CSVリーダーを使用して、プロジェクトを1つずつ処理します。
            for result in rdr.deserialize() {
                let mut project: ProjectCSV = result.map_err(|e| e.to_string())?;
                
                // 見つけたプロジェクトが更新すべきものであれば、更新します。
                if project.id == updated_project_csv.id {
                    let old_folder_path = PathBuf::from(project.folder_path);
                    let old_suffix =  old_folder_path.file_name().unwrap().to_string_lossy().to_string();
                    
                    // もしもsuffixが更新されていたら、フォルダ構造を更新
                    if old_suffix != new_suffix{
                        rename_project_directory(old_folder_path, &new_suffix)?
                    }
                    project = updated_project_csv.clone();
                
                }

                // 一時ファイルに書き込みます。
                wtr.serialize(&project).map_err(|e| e.to_string())?;
            }
            // 一時ファイルを元のファイル名にリネームする前に、元のファイルを閉じることを確認します。
            drop(wtr);
            drop(rdr);
        }
        // 元のファイルと一時ファイルを入れ替えます。
        std::fs::rename(temp_file.path(), &self.project_file_path).map_err(|e| e.to_string())?;
        
        // todo: フォルダ名変更チェック
        Ok(())
    }
}


fn convert_csv_to_project(csv: ProjectCSV, client: Client) -> Project {
    let csv_folder_path = PathBuf::from(csv.folder_path);
    let folder_path_suffix = csv_folder_path.file_name().unwrap().to_string_lossy().to_string();
    Project {
        id: csv.id,
        title: csv.title,
        description: csv.description,
        order_date: csv.order_date, // 実際のアプリケーションでは日付の変換が必要かもしれません
        due_date: csv.due_date, // 実際のアプリケーションでは日付の変換が必要かもしれません
        completion_date: csv.completion_date, // 実際のアプリケーションでは日付の変換が必要かもしれません
        client: client, // 仮定により、この関数の呼び出し時にはすでに取得しています
        status: csv.status,
        folder_path_suffix: Some(folder_path_suffix),
    }
}


fn convert_project_to_csv(project:Project) -> Result<ProjectCSV,String>{
    if project.id =="".to_string() && project.folder_path_suffix == None{
        return  Err("不正なプロジェクトをcsvに渡そうとしています".to_string())
    }
    let folder_path = match project.folder_path_suffix  {
        Some(suffix) =>
        get_project_directory_path(&suffix).to_string_lossy().to_string(),  
        None =>
                get_project_directory_path(&project.id).to_string_lossy().to_string(),
            
    };
    Ok(ProjectCSV{
        id: project.id.clone(),
        title: project.title.clone(),
        description: project.description.clone(),
        order_date: project.order_date.clone(), // 実際のアプリケーションでは日付の変換が必要かもしれません
        due_date: project.due_date.clone(), // 実際のアプリケーションでは日付の変換が必要かもしれません
        completion_date: project.completion_date.clone(), // 実際のアプリケーションでは日付の変換が必要かもしれません
        client_id: project.client.id.clone(), // 仮定により、この関数の呼び出し時にはすでに取得しています
        status: project.status.clone(),
        folder_path: folder_path
    
})
   
}


