import { useEffect, useState } from "react";
import { Client } from "./Clients.type";

import { invoke } from "@tauri-apps/api";

import { Box, Button, TextField } from "@mui/material";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";

import { TableCell, TableRow } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";

const NewClient: Client = {
  id: "",
  name: "",
  contact_person: "",
};

export default function ClientsListModal() {
  const Columns = ["会社名", "担当者", "操作"];

  const [tableData, setTableData] = useState<Client[]>([]);
  const [client, setClient] = useState<Client>(NewClient);

  const [open, setOpen] = useState(false);
  const [updatingIndex, setUpdatingIndex] = useState(-1);

  const fetchClienet = async () => {
    let fetchedClient = (await invoke("fetch_clients")) as Client[];

    setTableData(fetchedClient);
  };

  useEffect(() => {
    fetchClienet();
    setUpdatingIndex(-1);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setClient(NewClient);
    setUpdatingIndex(-1);
    setOpen(false);
  };

  const handleClientChange = (e: any) => {
    const { name, value } = e.target;
    setClient((client) => ({
      ...client,
      [name]: value,
    }));
  };
  const handleClickTableRow = (data: Client, index: number) => {
    setUpdatingIndex(index);
    setClient(data);
  };

  // const addClient = async () => {
  //   try {
  //     await invoke("add_client", { newClient: client });
  //     await fetchClienet();
  //   } catch (e: any) {
  //     alert("登録に失敗しました。");
  //     console.error(e);
  //   } finally {
  //   }
  // };

  const updateClient = async () => {
    try {
      await invoke("update_client", { client: client });
      await fetchClienet();
    } catch (e: any) {
      alert("登録に失敗しました。");
      console.error(e);
    } finally {
    }
  };

  // const handleCreateClient = () => {
  //   addClient();
  //   handleClose();
  // };
  const handleUpdateClient = () => {
    updateClient();
    handleClose();
  };
  return (
    <>
      <Button variant="outlined" onClick={handleOpen}>
        {"client"}
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
        <DialogTitle id="scroll-dialog-title">クライアント</DialogTitle>
        <DialogContent id="scroll-dialog-description"></DialogContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>会社名</TableCell>
                <TableCell>担当者</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((data, index) =>
                updatingIndex === index ? (
                  <TableRow key={index}>
                    <TableCell key={0}>
                      <TextField
                        value={client.name}
                        name="name"
                        onChange={handleClientChange}
                      ></TextField>
                    </TableCell>
                    <TableCell key={1}>
                      <Box display={"flex"} flexDirection={"row"}>
                        <TextField
                          value={client.contact_person}
                          name="contact_person"
                          onChange={handleClientChange}
                        ></TextField>
                        <Button
                          variant="outlined"
                          onClick={() => handleUpdateClient()}
                        >
                          {"登録"}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow
                    key={index}
                    onClick={() => handleClickTableRow(data, index)}
                  >
                    <TableCell key={0}>{data.name}</TableCell>
                    <TableCell key={1}>{data.contact_person}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Dialog>
    </>
  );
}
