import { useEffect, useState } from "react";

import { invoke } from "@tauri-apps/api/tauri";

import { TableCell, TableRow } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import Tooltip from "@mui/material/Tooltip";

import CircularProgress from "@mui/material/CircularProgress";

import { Box } from "@mui/material";

import { Client, Project, ProjectStatus, TableData } from "./Projects.type";

import ProjectModal from "./ProjectModal";
import ClientsListModal from "../Clients/ClientsListModal";

export default function ProjectLists() {
  const Columns = [
    "受注日",
    "締切日",
    "プロジェクト名",
    "説明",
    "ステータス",
    "会社名",
    "プロジェクトフォルダパス",
  ];

  const [tableData, setTableData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    let projects = (await invoke("fetch_projects")) as Project[];
    console.log(projects);
    let tableData = convertProjectsToTableData(projects);
    setTableData(tableData);
  };

  const saveNewProject = async (project: Project) => {
    try {
      setLoading(true);
      await invoke("add_project", { newProject: project });
      await fetchData();
    } catch (e: any) {
      alert("登録に失敗しました。");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (project: Project) => {
    try {
      setLoading(true);
      await invoke("update_project", { project: project });
      await fetchData();
    } catch (e: any) {
      alert("登録に失敗しました。");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      {loading && <CircularProgress />}
      <Box display={"flex"} flexDirection={"row"} marginBottom={"1rem"}>
        <ProjectModal buttonTitle={"新規作成"} onSave={saveNewProject} />
        <ClientsListModal />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {Columns.map((col, index) => (
                <TableCell key={index}>{col}</TableCell>
              ))}
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((data, index) => (
              <>
                <TableRow key={index}>
                  <TableCell key={0}>{data.OrderDate}</TableCell>
                  <TableCell key={1}>{data.DueDate}</TableCell>
                  <TableCell key={2}>{data.ProjectName}</TableCell>
                  <TableCell key={3}>{data.Description}</TableCell>
                  <TableCell key={4}>{data.Status}</TableCell>
                  <Tooltip
                    placement="right"
                    title={data.CompanyName + " " + data.ContactName + " "}
                  >
                    <TableCell key={5}>{data.CompanyName}</TableCell>
                  </Tooltip>
                  <TableCell key={6}>{data.ProjectFolderPath}</TableCell>
                  <TableCell key={7}>
                    <ProjectModal
                      buttonTitle={"更新"}
                      onSave={updateProject}
                      updateProject={convertTableDataToProject(data)}
                    />
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

// ProjectStatus enumを文字列に変換するヘルパー関数
function projectStatusToString(status: ProjectStatus): string {
  switch (status) {
    case ProjectStatus.InProgress:
      return "進行中";
    case ProjectStatus.Completed:
      return "完了";
    case ProjectStatus.OnHold:
      return "待機中";
    default:
      return "謎";
  }
}

// 文字列を ProjectStatus enumに変換するヘルパー関数
function stringToProjectStatus(statusString: string): ProjectStatus {
  switch (statusString) {
    case "進行中":
      return ProjectStatus.InProgress;
    case "完了":
      return ProjectStatus.Completed;
    case "待機中":
      return ProjectStatus.OnHold;
    default:
      console.error(new Error(`Unknown ProjectStatus string: ${statusString}`));
      return ProjectStatus.OnHold;
  }
}

// この関数は、Rustから送られてくるProjectの配列をTableData型の配列に変換します。
export function convertProjectsToTableData(projects: Project[]): TableData[] {
  return projects.map((project) => ({
    Id: project.id,
    OrderDate: project.order_date,
    DueDate: project.due_date,
    ProjectName: project.title,
    Description: project.description,
    Status: projectStatusToString(project.status),
    ClientId: project.client.id,
    CompanyName: project.client.name,
    ContactName: project.client.contact_person,
    ProjectFolderPath: project.folder_path,
  }));
}

function convertTableDataToProject(tableData: TableData): Project {
  // Clientオブジェクトの構築
  const client: Client = {
    id: tableData.ClientId,
    name: tableData.CompanyName,
    contact_person: tableData.ContactName,
  };

  // ProjectStatusの変換（この部分はアプリのロジックによって調整する必要があります）
  const status: ProjectStatus = stringToProjectStatus(tableData.Status);

  // Projectオブジェクトの構築
  const project: Project = {
    id: tableData.Id,
    title: tableData.ProjectName,
    description: tableData.Description,
    order_date: tableData.OrderDate,
    due_date: tableData.DueDate,
    // completion_dateはオプショナルなので、存在する場合のみ設定
    completion_date: tableData.DueDate,
    client: client,
    status: status,
    folder_path: tableData.ProjectFolderPath,
  };
  return project;
}
