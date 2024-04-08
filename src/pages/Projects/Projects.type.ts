export type TableData = {
  Id: string;
  OrderDate: string;
  DueDate: string;
  ProjectName: string;
  Description: string;
  Status: string;
  ClientId: string;
  CompanyName: string;
  ContactName: string;
  ProjectFolderPath: string;
};

/**
 * rustから受け取るProjectデータ
 */
export type Project = {
  id: string;
  title: string;
  description: string;
  // category: string; // Web design, Illustration, etc.
  order_date: string; // 実際にはより適切な日付型を使用する
  due_date: string;
  completion_date?: string; // Option<String> in Rust is equivalent to an optional field in TypeScript
  client: Client;
  status: ProjectStatus;
  folder_path?: string; // todo: Select a library for parsing paths
  folder_path_suffix?: string;
};

/**
 * rustから受け取るStatusデータ
 */
export enum ProjectStatus {
  InProgress = "InProgress",
  Completed = "Completed",
  OnHold = "OnHold",
}

/**
 * rustから受け取るClientデータ
 */
export type Client = {
  id: string;
  name: string;
  contact_person: string;
};
