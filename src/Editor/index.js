import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { RegistrationCanvas } from "./RegistrationCanvas";
import { ImageUploader } from "./ImageUploader";
import { v4 as uuidv4 } from "uuid";

import {
  AppBar,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
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
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import MemoryIcon from "@mui/icons-material/Memory";
import CameraIcon from "@mui/icons-material/Camera";
import {
  downloadCanvas,
  fetchJobs,
  loadSettings,
  runRegistration,
  saveSettings,
  uploadImage,
} from "../utils/actions";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Dropzone from "react-dropzone";
import GetAppIcon from "@mui/icons-material/GetApp";
import { useParams } from "react-router";
import { useJobQueue } from "../utils/hooks";

function TransformationData({ id, transformation }) {
  const [data, setData] = useState({});
  useEffect(() => {
    fetch(transformation, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
    })
      .then((x) => x.json())
      .then((data) => setData(data));
  }, [transformation]);

  return (
    <Box>
      <h2>{transformation.split("/").at(-1).replace(".json", "")} </h2>
      <Box>
        <Chip label={`tx: ${data?.transformation_obtained_s3?.tx}`} />
        <Chip label={`ty: ${data?.transformation_obtained_s3?.ty}`} />
        <Chip
          label={`mi: ${data?.transformation_obtained_s4?.mi_average.toFixed(
            3
          )}`}
        />
      </Box>
      <Dropzone
        onDrop={async (files) => {
          for (const file of files) {
            const data = await uploadImage(id, file);
            console.log(data);

            await fetch("/api/transform", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                transformation,
                image: data.url,
              }),
            }).catch((e) => e);
          }
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <Button> Apply Transformation to More Images</Button>
          </div>
        )}
      </Dropzone>
    </Box>
  );
}

function Results({ id, files }) {
  const transformed = files
    .filter((image) => image.endsWith("transformations.json"))
    .map((t) => {
      const prefix = t.replace("_transformations.json", "");
      return {
        transformation: t,
        images: files
          .filter((x) => x.startsWith(prefix))
          .filter((x) => x.endsWith(".png")),
      };
    });

  return (
    <>
      {transformed.map((t) => (
        <Box key={t.transformation}>
          <TransformationData id={id} {...t} />
          <h2>Transformed Images</h2>
          {t.images.map((image) => (
            <>
              <Card key={image}>
                <Box
                  display="flex"
                  flexDirection="column"
                  maxWidth={"400px"}
                  padding="1em"
                >
                  <img src={`${image}`} />

                  <a
                    target="_blank"
                    download={image.split("/").at(-1)}
                    href={image}
                    title="image"
                  >
                    <span>{image.split("/").at(-1)}</span>
                  </a>
                </Box>
              </Card>
            </>
          ))}
        </Box>
      ))}{" "}
    </>
  );
}

function JobQueueViewer({ id }) {
  const [results, setResults] = useState(null);
  const jobQueue = useJobQueue();
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

  return (
    <>
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
      <Drawer
        open={showDrawer > 0}
        anchor={"right"}
        onClose={() => setShowDrawer(0)}
      >
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
            {<Results id={id} files={results} />}
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
                    <TableCell>Job ID</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {Object.values(jobQueue.jobs).map((x) => (
                    <TableRow key={x.id} onClick={() => fetchResults(x)}>
                      <TableCell>{x.id}</TableCell>
                      <TableCell>
                        {x.startTime && new Date(x.startTime).toLocaleString()}
                      </TableCell>

                      <TableCell>
                        {x.endTime && new Date(x.endTime).toLocaleString()}
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                        >
                          <Box>{x.status}</Box>
                          {x.status != "queued" && (
                            <LinearProgress
                              color={
                                ["success", "error"].includes(x.status)
                                  ? x.status
                                  : "primary"
                              }
                              label={`${x.progress[0]} / ${x.progress[1]}`}
                              variant={
                                +x.progress[1] ? "determinate" : "indeterminate"
                              }
                              value={(+x.progress[0] / +x.progress[1]) * 100}
                            />
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Drawer>
    </>
  );
}

function usePersistentState(name, defaultValue) {
  const [state, setState] = useState(
    () => localStorage.getItem(name) || defaultValue
  );
  return [
    state,
    (value) => {
      localStorage.setItem(name, value);
      setState(value);
    },
  ];
}

const isFunction = (x) => typeof x == "function";

const invokeOrGet = (data, valueOrFunc) =>
  isFunction(valueOrFunc) ? valueOrFunc(data) : valueOrFunc;

function App() {
  const { id } = useParams();
  const [settingsJson, setSettingsJson] = useState({
    loading: true,
    id,
    worldScale: 1.0,
    workingImages: [],
  });

  useEffect(() => {
    fetch(`/api/uploads/${id}/settings.json`)
      .then((res) => res.json())
      .then(setSettingsJson)
      .catch(() => setSettingsJson((x) => ({ ...x, loading: false })));
  }, [id]);

  const setWorldScale = (x) =>
    setSettingsJson((json) => ({
      ...json,
      worldScale: invokeOrGet(json.worldScale, x),
    }));
  const setStacks = (x) =>
    setSettingsJson((json) => ({
      ...json,
      workingImages: invokeOrGet(json.workingImages, x),
    }));
  const stacks = settingsJson.workingImages;
  const worldScale = settingsJson.worldScale;

  const [selectedImageId, setSelectedImageId] = useState(0);
  const [inProgress, setInProgress] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(0);

  const [zoomPower, setZoomPower] = usePersistentState("zoomPower", 0.01);

  const jobQueue = useJobQueue();

  useEffect(() => {
    if (settingsJson.loading) return;
    const h = setTimeout(() => {
      saveSettings(settingsJson)
        .catch((e) => e)
        .then(console.log);
    }, 3 * 1000);
    return () => clearTimeout(h);
  }, [settingsJson]);

  const imageMoving = stacks.find((stack) => selectedImageId == stack.id);
  const setImageMoving = (newImageMoving) => {
    setStacks((allImages) => {
      const x = allImages.findIndex((stack) => selectedImageId == stack.id);
      return allImages.with(x, newImageMoving);
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

  if (settingsJson.loading) return null;

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
            <Box marginLeft={"1em"} display="flex">
              <TextField
                {...getInputProps("x-coord", "x")}
                inputProps={{ maxLength: 8, step: 1 }}
              />
              <TextField
                {...getInputProps("y-coord", "y")}
                inputProps={{ maxLength: 8, step: 1 }}
              />
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
                fontSize="5"
                margin="normal"
                type="number"
                color="secondary"
                label="zoom speed"
              />
            </Box>
          </Box>

          <TextField
            size="small"
            margin="normal"
            variant="outlined"
            fullWidth
            label="project name"
            color="secondary"
            value={settingsJson.title || settingsJson.id}
            onChange={(e) =>
              setSettingsJson((x) => ({ ...x, title: e.target.value }))
            }
          />
          <ButtonGroup aria-label="Input-Output">
            <Divider orientation="vertical" flexItem />

            <IconButton
              size="large"
              aria-label="register"
              color="inherit"
              onClick={() => window.open(`/api/export/${settingsJson.id}`)}
            >
              <Box display="flex" flexDirection="column" alignItems={"center"}>
                <SaveAltIcon />
                <Typography fontSize={"small"}>Export</Typography>
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

            <JobQueueViewer id={settingsJson.id} />

            <IconButton
              disabled={inProgress || stacks.length < 2}
              size="large"
              aria-label="register"
              color="inherit"
              onClick={async () => {
                setInProgress(true);
                const result = await runRegistration(settingsJson).catch(() =>
                  setInProgress(false)
                );
                setTimeout(() => setInProgress(false), 10000);
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
          selectedImageId={selectedImageId}
          setSelectedImageId={setSelectedImageId}
          setStacks={setStacks}
          stacks={stacks}
          worldScale={worldScale}
          zoomPower={zoomPower}
        />

        <ImageUploader
          projectId={settingsJson.id}
          stacks={stacks}
          setStacks={setStacks}
          selectedImageId={selectedImageId}
          setSelectedImageId={setSelectedImageId}
        />
      </div>
    </div>
  );
}

export default App;
