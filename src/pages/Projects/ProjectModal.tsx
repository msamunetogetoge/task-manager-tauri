import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import { useState, useEffect } from "react";
import { Client, Project, ProjectStatus } from "./Projects.type";
import LocalizedDatePicker from "../../components/LocalizedDatePicker";
import Calendar from "../../components/Calendar";
import { invoke } from "@tauri-apps/api";
import { YAxisSpacer } from "../../components/Spacer";

type ButtonTitle = "新規作成" | "更新";

interface ProjectModalProps {
  buttonTitle: ButtonTitle;
  updateProject?: Project;
  onSave: (project: Project) => void;
}

const NewClient: Client = {
  id: "",
  name: "",
  contact_person: "",
};

const NewProject: Project = {
  id: "",
  title: "",
  description: "",
  order_date: "",
  due_date: "",
  completion_date: "",
  client: NewClient,
  status: ProjectStatus.OnHold,
  folder_path: "",
};

export default function ProjectModal(prop: ProjectModalProps) {
  const { buttonTitle, updateProject, onSave } = prop;

  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [newClient, setNewClient] = useState<Client>(NewClient);
  const [createNewClient, setCreateNewClient] = useState(false);
  const [project, setProject] = useState<Project>(updateProject ?? NewProject);

  const fetchClienet = async () => {
    let fetchedClient = (await invoke("fetch_clients")) as Client[];

    setClients(fetchedClient);
  };

  useEffect(() => {
    fetchClienet();
    if (prop.buttonTitle === "新規作成") setProject(NewProject);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setProject((prevProject) => ({
      ...prevProject,
      [name]: value,
    }));
  };

  const handleNewClientChange = (e: any) => {
    const { name, value } = e.target;
    setNewClient((client) => ({
      ...client,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(project);
    handleClose();
  };

  useEffect(() => {
    if (createNewClient) {
      setProject((prevProject) => ({
        ...prevProject,
        client: newClient,
      }));
    }
  }, [createNewClient, newClient]);

  const changeOrderDate = (newDate: Date | null) => {
    const orderDate = newDate ?? new Date();
    const orderDateStr = orderDate.toLocaleDateString();
    setProject((prevProject) => ({
      ...prevProject,
      order_date: orderDateStr,
    }));
  };

  const changeDueDate = (newDate: Date | null) => {
    const dueDate = newDate ?? new Date();
    const dueDateStr = dueDate.toLocaleDateString();
    setProject((prevProject) => ({
      ...prevProject,
      due_date: dueDateStr,
    }));
  };

  const changeCompletionDate = (newDate: Date | null) => {
    const dueDate = newDate ?? new Date();
    const dueDateStr = dueDate.toLocaleDateString();
    setProject((prevProject) => ({
      ...prevProject,
      completion_date: dueDateStr,
    }));
  };

  const handleClientChange = (e: any) => {
    const clientId = e.target.value;
    const selectedClient = clients.find((client) => client.id === clientId);
    if (selectedClient) {
      setProject((prevProject) => ({
        ...prevProject,
        client: selectedClient,
      }));
    } else {
      console.error("Selected client not found with id:", clientId);
    }
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
        {buttonTitle}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth={"md"}
        scroll={"paper"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">プロジェクト登録</DialogTitle>
        <DialogContent id="scroll-dialog-description">
          <Box sx={{ display: "flex", flexFlow: "column" }}>
            <TextField
              fullWidth
              margin="normal"
              variant="outlined"
              name="title"
              label="title"
              value={project.title}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              variant="outlined"
              name="description"
              label="description"
              value={project.description}
              onChange={handleChange}
            />
            <YAxisSpacer />
            <LocalizedDatePicker
              label={"受注日"}
              value={project.order_date}
              onChange={changeOrderDate}
            />
            <YAxisSpacer />
            <LocalizedDatePicker
              label={"締切日"}
              value={project.due_date}
              onChange={changeDueDate}
            />
            {buttonTitle === "更新" && (
              <>
                <YAxisSpacer />
                <LocalizedDatePicker
                  label={"完了日"}
                  value={project.completion_date}
                  onChange={changeCompletionDate}
                />
              </>
            )}
            <YAxisSpacer />
            <Box
              display={"flex"}
              alignItems={"center"}
              width="100%"
              margin={"normal"}
            >
              <Box flexGrow={1} marginRight={1}>
                {clients.length > 0 && (
                  <FormControl fullWidth>
                    <InputLabel id="client-select-label">Client</InputLabel>
                    <Select
                      disabled={createNewClient}
                      labelId="client-select-label"
                      value={project.client.id}
                      label="Client"
                      onChange={handleClientChange}
                      name="client_id"
                    >
                      {clients.map((client, index) => (
                        <MenuItem key={index} value={client.id}>
                          {client.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
              <Button
                variant="outlined"
                onClick={() => {
                  setCreateNewClient(!createNewClient);
                }}
              >
                {createNewClient ? "select client" : "create client"}
              </Button>
            </Box>

            {createNewClient && (
              <>
                <YAxisSpacer />
                <TextField
                  label="Client Name"
                  name="name"
                  value={newClient.name}
                  onChange={handleNewClientChange}
                ></TextField>
                <YAxisSpacer />
                <TextField
                  name="contact_person"
                  label="Contact Person Name"
                  value={newClient.contact_person}
                  onChange={handleNewClientChange}
                ></TextField>
              </>
            )}
            <YAxisSpacer />
            <TextField
              fullWidth
              margin="normal"
              variant="outlined"
              name="folder_path_suffix"
              label="フォルダ名"
              value={project.folder_path_suffix}
              onChange={handleChange}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={project.status}
                label="Status"
                onChange={handleChange}
                name="status"
              >
                {Object.values(ProjectStatus).map((status, index) => (
                  <MenuItem key={index} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" onClick={handleSubmit}>
            登録
          </Button>
          <Button variant="outlined" onClick={handleClose}>
            キャンセル
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
