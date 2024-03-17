import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

import ProjectLists from "./pages/Projects/ProjectsList";

function App() {
  return (
    <div className="container">
      <ProjectLists />
    </div>
  );
}

export default App;
