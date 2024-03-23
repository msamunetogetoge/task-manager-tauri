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
import { useState } from "react";
import { Client, Project, ProjectStatus } from "./Projects.type";
import LocalizedDatePicker from "../../components/LocalizedDatePicker";
import Calendar from "../../components/Calendar";

type ButtonTitle = "新規作成" | "更新";

interface ProjectModalProps {
  buttonTitle: ButtonTitle;
  updateProject?: Project;
  onSave: (project: Project) => void;
}

const testClient: Client = {
  contact_person: "Alice",
  id: "1",
  name: "Alpha Inc.",
};

// todo:fetchして取得できるようにする
const testClients: Client[] = [
  {
    contact_person: "Alice",
    id: "1",
    name: "Alpha Inc.",
  },
  { contact_person: "Bob", id: "2", name: "Beta LLC" },
  {
    contact_person: "Carol",
    id: "3",
    name: "Gamma Corp",
  },
];

export default function ProjectModal(prop: ProjectModalProps) {
  const { buttonTitle, updateProject, onSave } = prop;

  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>(testClients);
  const [project, setProject] = useState<Project>(
    updateProject ?? {
      id: "",
      title: "",
      description: "",
      order_date: "",
      due_date: "",
      completion_date: "",
      client: testClient,
      status: ProjectStatus.OnHold,
      folder_path: "",
    }
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setProject((prevProject) => ({
      ...prevProject,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(project);
    handleClose();
  };

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
    const selectedClient = clients.find((client) => (client.id = clientId))!;
    setProject((prevProject) => ({
      ...prevProject,
      client: selectedClient,
    }));
  };

  return (
    <>
      <Button variant="outlined" onClick={handleOpen}>
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
            <Box
              sx={{
                height: "1rem",
              }}
            />
            <LocalizedDatePicker
              label={"受注日"}
              value={project.order_date}
              onChange={changeOrderDate}
            />
            <Box
              sx={{
                height: "1rem",
              }}
            />
            <LocalizedDatePicker
              label={"締切日"}
              value={project.due_date}
              onChange={changeDueDate}
            />
            {buttonTitle === "更新" && (
              <>
                <Box
                  sx={{
                    height: "1rem",
                  }}
                />
                <LocalizedDatePicker
                  label={"完了日"}
                  value={project.completion_date}
                  onChange={changeCompletionDate}
                />
              </>
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel id="client-select-label">Client</InputLabel>
              <Select
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
