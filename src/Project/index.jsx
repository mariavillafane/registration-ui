import {
  Paper,
  Card,
  Box,
  Button,
  Tooltip,
  AppBar,
  Toolbar,
  Chip,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Accordion,
} from "@mui/material";

import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import InfoIcon from "@mui/icons-material/Info";
import { useCallback, useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import CameraIcon from "@mui/icons-material/Camera";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CropOriginalIcon from "@mui/icons-material/CropOriginal";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import UploadIcon from "@mui/icons-material/Upload";
import { Link } from "react-router";
import { v4 as uuidV4 } from "uuid";
import { useNavigate } from "react-router";
import { useDropzone } from "react-dropzone";

function ProjectCard({ refresh, ...p }) {
  const navigate = useNavigate();
  return (
    <Card
      className="project-card"
      sx={{
        position: "relative",
        p: 1,
        paddingBottom: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        flexWrap: "wrap",
        "& .actions": {
          opacity: 0,
          transition: "0.3s ease-in opacity",
        },
        "&:hover .actions": {
          opacity: 1,
        },
      }}
    >
      <Box sx={{ display: "flex", fontSize: "small", gap: 1 }}>
        <Tooltip title="last modified">
          <Chip
            avatar={<ScheduleIcon />}
            label={new Date(p.uploaded).toUTCString()}
          />
        </Tooltip>
        <Tooltip title="images">
          <Chip avatar={<CropOriginalIcon />} label={p.workingImages.length} />
        </Tooltip>
        <Tooltip title="datacubes">
          <Chip
            avatar={<ViewInArIcon />}
            label={p.workingImages.flatMap((x) => x.imageEntries).length}
          />
        </Tooltip>
      </Box>

      <Button>
        <Link to={`/${p.id}`}>
          <img
            src={p.thumbnail}
            style={{ maxWidth: "384px", maxHeight: "384px" }}
          />
        </Link>
      </Button>

      <SpeedDial
        className="actions"
        FabProps={{ size: "small" }}
        ariaLabel="SpeedDial basic example"
        direction="left"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        icon={<SpeedDialIcon fontSize="small" />}
      >
        <SpeedDialAction
          onClick={() => navigate(`/${p.id}`)}
          icon={<EditIcon color="success" />}
          tooltipTitle={"Edit"}
        />

        <SpeedDialAction
          onClick={() => window.open(p.thumbnail, "_blank")}
          icon={<CameraIcon color="info" />}
          tooltipTitle={"Download Preview"}
        />

        <SpeedDialAction
          onClick={() => window.open(`/api/export/${p.id}`, "_blank")}
          icon={<FileDownloadIcon color="info" />}
          tooltipTitle={"Export"}
        />

        <SpeedDialAction
          onClick={() => {
            fetch(`/api/delete/${p.id}`, { method: "POST" })
              .then(console.log)
              .then(refresh);
          }}
          icon={<DeleteForeverIcon color="warning" />}
          tooltipTitle={"Delete"}
        />
      </SpeedDial>
    </Card>
  );
}

export default function ProjectView() {
  const [time, setTime] = useState(0);
  const refresh = () => setTime(Date.now());
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    fetch("/api/projects")
      .then((x) => x.json())
      .then((x) => x.sort((a, b) => b.uploaded - a.uploaded))
      .then(setProjects);
  }, [time]);

  const onDrop = useCallback((files) => {
    const data = new FormData();
    data.append("project", files[0]);

    fetch("/api/import", {
      method: "POST",
      body: data,
    }).then(refresh);
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <>
      <AppBar position="static" sx={{ marginBottom: 2 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box> Image Registration </Box>

          <Box>
            <a href="https://github.com/mariavillafane/registration-ui">
              About{" "}
            </a>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        display={"flex"}
        flexDirection={"column"}
        gap={2}
        maxWidth={"xl"}
        sx={{ m: "auto" }}
      >
        <h1>Actions</h1>

        <Box display={"flex"} gap={2} maxWidth={"xl"} sx={{ m: "auto" }}>
          <input {...getInputProps()} />
          <Button>
            <Link to={`/${uuidV4()}`}>
              <Card sx={{ p: 4 }}>
                <AddCircleOutlineIcon />
                <Box> New Project</Box>
              </Card>
            </Link>
          </Button>

          <Button {...getRootProps()}>
            <Card sx={{ p: 4 }}>
              <UploadIcon />
              <Box> Import Project </Box>
            </Card>
          </Button>
        </Box>

        <h1>Projects</h1>

        <Box
          display={"flex"}
          flexDirection={"row"}
          gap={2}
          maxWidth="xl"
          sx={{
            alignItems: "stretch",
            justifyContent: "stretch",
            flexWrap: "wrap",
            m: "auto",
          }}
        >
          {projects.map((p) => (
            <ProjectCard key={p.id} {...p} refresh={refresh} />
          ))}
        </Box>
      </Box>
    </>
  );
}
