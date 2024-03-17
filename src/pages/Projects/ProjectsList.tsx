import { invoke } from "@tauri-apps/api/tauri";

import { TableCell, TableRow } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { useEffect, useState } from "react";
import { Project, ProjectStatus, TableData } from "./ProjectsList.type";

export default function ProjectLists() {
  const Columns = [
    "受注日",
    "プロジェクト名",
    "ステータス",
    "会社名",
    "担当者名",
    "プロジェクトフォルダパス",
  ];

  const [tableData, setTableData] = useState<TableData[]>([]);

  const fetchData = async () => {
    let projects = (await invoke("fetch_projects")) as Project[];
    console.log("fetch projects...", projects);
    let tableData = convertProjectsToTableData(projects);
    setTableData(tableData);
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
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
                <TableCell key={1}>{data.ProjectName}</TableCell>
                <TableCell key={2}>{data.Status}</TableCell>
                <TableCell key={3}>{data.CompanyName}</TableCell>
                <TableCell key={4}>{data.ContactName}</TableCell>
                <TableCell key={5}>{data.ProjectFolderPath}</TableCell>
              </TableRow>
            </>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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
    ProjectName: project.title,
    Status: projectStatusToString(project.status),
    CompanyName: project.client.name,
    ContactName: project.client.contact_person,
    ProjectFolderPath: project.folder_path,
  }));
}
