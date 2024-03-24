import { useEffect, useState } from "react";

import { invoke } from "@tauri-apps/api/tauri";

import { TableCell, TableRow } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import Tooltip from "@mui/material/Tooltip";

import CircularProgress from "@mui/material/CircularProgress";

import { Project, ProjectStatus, TableData } from "./Projects.type";

import ProjectModal from "./ProjectModal";

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
    console.log("fetch projects...", projects);
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

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      {loading && <CircularProgress />}
      <ProjectModal buttonTitle={"新規作成"} onSave={saveNewProject} />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {Columns.map((col, index) => (
                <TableCell key={index}>{col}</TableCell>
              ))}
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

// この関数は、Rustから送られてくるProjectの配列をTableData型の配列に変換します。
export function convertProjectsToTableData(projects: Project[]): TableData[] {
  return projects.map((project) => ({
    OrderDate: project.order_date,
    DueDate: project.due_date,
    ProjectName: project.title,
    Description: project.description,
    Status: projectStatusToString(project.status),
    CompanyName: project.client.name,
    ContactName: project.client.contact_person,
    ProjectFolderPath: project.folder_path,
  }));
}
