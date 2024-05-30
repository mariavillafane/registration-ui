import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { RegistrationCanvas } from "./RegistrationCanvas";
import { UserInput } from "./UserInput";
import { ImageUploader } from "./ImageUploader";
import {
  AppBar,
  Badge,
  Box,
  ButtonGroup,
  Card,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import QueueIcon from "@mui/icons-material/Queue";
import CollectionsIcon from "@mui/icons-material/Collections";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import PanToolIcon from "@mui/icons-material/PanTool";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";

import SaveAltIcon from "@mui/icons-material/SaveAlt";
import FileOpen from "@mui/icons-material/FileOpen";
import MemoryIcon from "@mui/icons-material/Memory";
import CameraIcon from "@mui/icons-material/Camera";
import {
  downloadCanvas,
  downloadSettings,
  loadSettings,
  uploadSettingsToServer,
} from "./actions";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Dropzone from "react-dropzone";
import GetAppIcon from "@mui/icons-material/GetApp";

//https://www.geeksforgeeks.org/lodash-_-omit-method/
//https://react-dnd.github.io/react-dnd/examples/sortable/simple

function useJobQueue(pollInterval = 10000) {
  const [jobQueue, setJobQueue] = useState({
    done: 0,
    queued: 0,
    inProgress: 0,
    total: 0,
    failed: 0,
    jobs: {},
  });

  useEffect(() => {
    const h = setInterval(async () => {
      const jobs = await fetch("/api/status", {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      }).then((x) => x.json());

      const entries = Object.values(jobs);
      const done = entries.filter((x) => x.status == "success").length;
      const queued = entries.filter((x) => x.status == "queued").length;
      const inProgress = entries.filter((x) => x.status == "started").length;
      const total = entries.length;
      const failed = entries.filter((x) => x.status == "failed").length;

      const updatedQueue = { done, queued, inProgress, failed, total, jobs };

      setJobQueue(updatedQueue);
    }, pollInterval);

    return () => {
      console.log("destroy interval");
      clearInterval(h);
    };
  }, [pollInterval]);

  return jobQueue;
}

function usePersistentState(name, defaultValue) {
  const [state, setState] = useState(
    localStorage.getItem(name) || defaultValue
  );
  return [
    state,
    (value) => {
      localStorage.setItem(name, value);
      setState(value);
    },
  ];
}

function App() {
  const [worldScale, setWorldScale] = useState(1.0);
  const [stacks, setStacks] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(0);
  const [results, setResults] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(0);

  const [zoomPower, setZoomPower] = usePersistentState("zoomPower", 0.01);

  const jobQueue = useJobQueue();

  const settingsJson = { worldScale, workingImages: stacks };

  const [showDrawer, setShowDrawer] = useState(0);

  const fetchResults = async ({ id, status }) => {
    if (status != "success") return;
    console.log("feching", id, status);
    const resultingTransformedImageFiles = await fetch(`/api/results/${id}`, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
    }).then((x) => x.json());
    setResults(resultingTransformedImageFiles);
    setShowDrawer(3);
  };

  const imageMoving = stacks.find((stack) => selectedImageId == stack.id);
  const setImageMoving = (newImageMoving) => {
    setStacks((allImages) => {
      const x = allImages.findIndex((stack) => selectedImageId == stack.id);
      return [
        ...allImages.slice(0, x),
        newImageMoving,
        ...allImages.slice(x + 1),
      ];
    });
  };

  const getInputProps = (label, field, defaultValue = 0) => ({
    style: { width: "11ex" },
    size: "small",
    margin: "normal",
    type: "number",
    color: "secondary",
    label,
    defaultValue,
    value: imageMoving?.[field] || defaultValue,
    onChange: (event) => {
      if (imageMoving)
        setImageMoving({ ...imageMoving, [field]: +event.target.value });
    },
  });

  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "stretch",
        alignContent: "stretch",
        alignItems: "stretch",
        grow: 1,
      }}
    >
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex">
            {/* <ButtonGroup variant="contained" sx={{background:'white'}} aria-label="Loading button group">
            <IconButton><PanToolIcon/></IconButton>
            <IconButton><ZoomOutMapIcon/></IconButton>
          </ButtonGroup> */}

            <Box marginLeft={"1em"} display="flex">
              <TextField {...getInputProps("x-coord", "x")} />
              <TextField {...getInputProps("y-coord", "y")} />
              <TextField
                {...getInputProps("rotation", "rotation")}
                inputProps={{ maxLength: 6, step: 0.1 }}
              />
              <TextField
                {...getInputProps("scale", "scaling", 1)}
                inputProps={{ maxLength: 6, step: 0.001 }}
              />
              <TextField
                {...getInputProps("opacity", "opacity", 1)}
                inputProps={{ maxLength: 6, step: 0.1, max: 1, min: 0 }}
              />
              <Divider orientation="vertical" flexItem />
              <TextField
                value={+zoomPower}
                onChange={(e) => setZoomPower(e.target.value)}
                inputProps={{ maxLength: 6, step: 0.1, max: 1, min: 0 }}
                size="small"
                margin="normal"
                type="number"
                color="secondary"
                label="zoom speed"
              />
            </Box>
          </Box>

          <div>ImageRegistration Canvas</div>

          <ButtonGroup aria-label="Input-Output">
            <Divider orientation="vertical" flexItem />

            <IconButton
              size="large"
              aria-label="register"
              color="inherit"
              onClick={() => downloadSettings(settingsJson)}
            >
              <Box display="flex" flexDirection="column" alignItems={"center"}>
                <SaveAltIcon />
                <Typography fontSize={"small"}>SaveSettings</Typography>
              </Box>
            </IconButton>

            <Divider orientation="vertical" flexItem />

            <IconButton
              size="large"
              aria-label="register"
              color="inherit"
              onClick={downloadCanvas}
            >
              <Box display="flex" flexDirection="column" alignItems={"center"}>
                <CameraIcon />
                <Typography fontSize={"small"}>Canvas</Typography>
              </Box>
            </IconButton>

            <Divider orientation="vertical" flexItem />

            <IconButton
              size="large"
              aria-label="upload settings File"
              color="inherit"
              onClick={() => {
                setShowDrawer(5);
              }}
            >
              <Box display="flex" flexDirection="column" alignItems={"center"}>
                <Badge
                  badgeContent={
                    isLoadingFile ? (
                      <CircularProgress color="warning" />
                    ) : undefined
                  }
                >
                  <FileOpen />
                </Badge>
                <Typography fontSize={"small"}>Open</Typography>
              </Box>
            </IconButton>

            <Divider orientation="vertical" flexItem />

            <IconButton
              size="large"
              aria-label="shows completed jobs"
              color="inherit"
              onClick={() => {
                setShowDrawer(1);
              }}
            >
              <Box display="flex" flexDirection="column" alignItems={"center"}>
                <Badge badgeContent={jobQueue.done} color="success">
                  <CollectionsIcon />
                </Badge>
                <Typography fontSize={"small"}>Done</Typography>
              </Box>
            </IconButton>

            <Divider orientation="vertical" flexItem />

            <IconButton
              size="large"
              aria-label="shows all jobs"
              color="inherit"
              onClick={() => {
                setShowDrawer(2);
              }}
            >
              <Box display="flex" flexDirection="column" alignItems={"center"}>
                <Badge badgeContent={jobQueue.total} color="error">
                  <QueueIcon />
                </Badge>
                <Typography fontSize={"small"}>All</Typography>
              </Box>
            </IconButton>

            <IconButton
              disabled={inProgress}
              size="large"
              aria-label="register"
              color="inherit"
              onClick={async () => {
                setInProgress(true);
                const result = await uploadSettingsToServer(settingsJson).catch(
                  () => setInProgress(false)
                );
                setTimeout(() => setInProgress(false), 10000);

                if (!result) return;
              }}
            >
              <Box display="flex" flexDirection="column" alignItems={"center"}>
                <MemoryIcon />
                <Typography fontSize={"small"}>RunRegistration</Typography>
              </Box>
            </IconButton>
          </ButtonGroup>
        </Toolbar>
      </AppBar>

      <Drawer
        open={showDrawer > 0}
        anchor={"right"}
        onClose={() => setShowDrawer(0)}
      >
        {showDrawer == 5 && (
          <Card>
            <Dropzone
              onDrop={async (files) => {
                setIsLoadingFile(true);
                const settings = await loadSettings(stacks, files[0]).catch(
                  console.log
                );
                setIsLoadingFile(false);
                setShowDrawer(0);
                if (settings) {
                  setWorldScale(settings.worldScale);
                  setStacks(settings.workingImages);
                }
              }}
            >
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <Box
                    padding="2em"
                    display="flex"
                    flexDirection={"column"}
                    justifyContent={"stretch"}
                    alignItems={"center"}
                  >
                    <Typography variant="h2" fontSize={"large"}>
                      Load an existing settings.json file
                    </Typography>
                    <GetAppIcon sx={{ fontSize: 200 }} />
                    <Typography>Click or Drop File Here </Typography>
                  </Box>
                </div>
              )}
            </Dropzone>
          </Card>
        )}
        {showDrawer == 3 && (
          <Stack spacing={2}>
            <Box display={"flex"}>
              <IconButton onClick={() => setShowDrawer(2)}>
                <ArrowBackIcon />
              </IconButton>
              <Typography marginLeft="0.25em" variant="h3">
                Results
              </Typography>
            </Box>
            <Divider />
            {results
              ?.filter((image) => image.endsWith("png"))
              ?.map((image) => (
                <Card key={image}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    maxWidth={"400px"}
                    padding="1em"
                  >
                    <img src={`http://localhost:4000${image}`} />

                    <a
                      target="_blank"
                      download={image.split("/").at(-1)}
                      href={`http://localhost:4000${image}`}
                      title="image"
                    >
                      <span>{image.split("/").at(-1)}</span>
                    </a>
                  </Box>
                </Card>
              ))}
          </Stack>
        )}
        {showDrawer < 3 && (
          <>
            <Box display="flex">
              <IconButton
                size="large"
                aria-label="shows completed jobs"
                color="inherit"
                onClick={() => {
                  setShowDrawer(1);
                }}
              >
                <Badge badgeContent={jobQueue.done} color="success">
                  <CollectionsIcon />
                </Badge>
              </IconButton>
              <IconButton
                size="large"
                aria-label="shows all jobs"
                color="inherit"
                onClick={() => {
                  setShowDrawer(2);
                }}
              >
                <Badge badgeContent={jobQueue.total} color="error">
                  <QueueIcon />
                </Badge>
              </IconButton>
              <Typography marginLeft="0.25em" variant="h3">
                {showDrawer == 2 ? "All Jobs" : "Completed Jobs"}
              </Typography>
            </Box>
            <Divider />

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {Object.values(jobQueue.jobs)
                    .filter((x) => showDrawer == 2 || x.status == "success")
                    .map((x) => (
                      <TableRow key={x.id} onClick={() => fetchResults(x)}>
                        <TableCell>{x.id}</TableCell>
                        <TableCell>
                          {x.startTime &&
                            new Date(x.startTime).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {x.endTime && new Date(x.endTime).toLocaleString()}
                        </TableCell>
                        <TableCell>{x.status}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Drawer>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
          grow: 1,
          justifyContent: "stretch",
          alignItems: "stretch",
          alignContent: "stretch",
        }}
      >
        <RegistrationCanvas
          stacks={stacks}
          worldScale={worldScale}
          zoomPower={zoomPower}
        />

        <ImageUploader
          stacks={stacks}
          setStacks={setStacks}
          selectedImageId={selectedImageId}
          setSelectedImageId={setSelectedImageId}
        />

        {/* <UserInput
          workingImages={stacks}
          imageMoving={stacks.find((stack) => selectedImageId == stack.id)}
          setImageMoving={(newImageMoving) => {
            setStacks((allImages) => {
              const x = allImages.findIndex(
                (stack) => selectedImageId == stack.id
              );
              return [
                ...allImages.slice(0, x),
                newImageMoving,
                ...allImages.slice(x + 1),
              ];
            });
          }}
          // setWorkingImages={(newWorkingImages) => {
          //   setStacks((allImages) => [allImages[0], ...newWorkingImages]);
          // }}
          setWorkingImages={setStacks}
          {...{
            worldScale,
            setWorldScale,
          }}
        /> */}
      </div>
    </div>
  );
}

export default App;

//useful links
//https://code-boxx.com/create-save-files-javascript/#:~:text=The%20possible%20ways%20to%20create,offer%20a%20%E2%80%9Csave%20as%E2%80%9D.
