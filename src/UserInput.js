import { useEffect, useState } from "react";
import { readImageAsBase64, useJsonReader } from "./ImageTools";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ImageJs from "image-js";
import { Box, Card, CircularProgress, Dialog, Drawer } from "@mui/material";
import {
  createSettingsDotJson,
  download,
  downloadCanvas,
  downloadSettings,
} from "./actions";

async function uploadSettingsToServer(data) {
  const settingsJson = await createSettingsDotJson(data);

  const response = await fetch("http://localhost:4000/start", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: settingsJson, // body data type must match "Content-Type" header
  });

  const statusOfResult = await response.json();
  console.log(statusOfResult);
  return statusOfResult;
}

export function UserInput({
  // canvasX,
  // canvasY,
  worldScale,
  setWorldScale,
  imageMoving,
  setImageMoving,
  workingImages,
  setWorkingImages,
}) {
  const [state, setState] = useState("noRegistrationIsRunning");
  const [showResults, setShowResults] = useState(false);
  const [settingsUploadedByUser, setSelectedSettings] = useJsonReader(
    null,
    "readAsText"
  );
  const [resultingImages, setResultingImages] = useState(null); //as there are no resultingImages prior to running registration

  //opacity marks
  const marks = [
    {
      fontSize: "0.01em",
      value: 0.0,
      label: "transparent",
    },
    {
      value: 1.0,
      label: "solid",
    },
  ];

  useEffect(() => {
    if (settingsUploadedByUser == null) return;

    const parsedSettings = JSON.parse(settingsUploadedByUser);

    const urlsToDelete = workingImages.flatMap((workingImage) =>
      workingImage.imageEntries.map((imageEntry) => imageEntry.imageUrl)
    );
    urlsToDelete.forEach((url) => {
      window.URL.revokeObjectURL(url); //take away the memory that is linked to urls (they are now empty pointers, just to have memory available for something else / 2 GB limit)
    });

    const workingImagesPromise = Promise.all(
      [parsedSettings.imageFixed, ...parsedSettings.workingImages].map(
        async (workingImage) => ({
          ...workingImage,
          imageEntries: await Promise.all(
            workingImage.imageEntries.map(async (imageEntry) => {
              const image = await ImageJs.load(imageEntry.base64);
              return {
                ...imageEntry,
                imageUrl: await URL.createObjectURL(await image.toBlob()), //image drawn in browser, by default this converts to png - 230828
              };
            })
          ),
        })
      )
    );

    workingImagesPromise.then((workingImages) => {
      setWorldScale(parsedSettings.worldScale);
      setWorkingImages(workingImages);
    });
  }, [settingsUploadedByUser]);

  if (!imageMoving) {
    return null;
  }

  const imageType = imageMoving.id == 0 ? "Fixed-image" : "Moving-image"; //280821

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginLeft: "20px",
      }}
    >
      <Button
        variant="contained"
        style={{ width: "350px" }}
        starticon={<FileUploadIcon />}
      >
        Upload (known) Image Settings
        <input
          type="file"
          onChange={(event) => setSelectedSettings(event.target.files[0])}
        />
      </Button>

      <div>
        <div>
          <br />
          WORKING IMAGES
          <br />
          world-scale (affects both working images):{" "}
          <input
            value={worldScale}
            type="number"
            min={0.1}
            max={1.2}
            step={0.01}
            onChange={(event) => setWorldScale(event.target.value)}
          />
        </div>
      </div>

      <div>
        <br />
        {imageType} ID={imageMoving.id} (position on canvas)
      </div>
      <div>
        coord_x:{" "}
        <input
          value={imageMoving.x} //230821 G
          type="number"
          onChange={(event) =>
            setImageMoving({ ...imageMoving, x: +event.target.value })
          }
        />
      </div>
      <div>
        coord_y:{" "}
        <input
          value={imageMoving.y} //  imageMoving is a stack (which is a dictionary containing all images of the stack, but only one x and one y as these values are ok for all images in the one stack)
          type="number"
          onChange={
            (event) =>
              setImageMoving({ ...imageMoving, y: +event.target.value })
            //setImageMoving(imageMoving.map( entry => ({...entry, y: +event.target.value })))
          }
        />
      </div>
      <div>
        rotation:{" "}
        <input
          value={imageMoving.rotation}
          type="number"
          min={-180}
          max={180}
          step={0.01}
          onChange={(event) =>
            setImageMoving({ ...imageMoving, rotation: +event.target.value })
          }
        />
      </div>
      <div>
        scaling:{" "}
        <input
          value={imageMoving.scaling}
          type="number"
          min={0.1}
          max={10.0}
          step={0.001}
          onChange={(event) =>
            setImageMoving({ ...imageMoving, scaling: +event.target.value })
          }
        />
      </div>
      <div>
        image original dimensions (wxh): {imageMoving?.width} x{" "}
        {imageMoving?.height} <br />
        image on canvas dimensions (scaled by {worldScale}, and by{" "}
        {imageMoving.scaling}
        ):{" "}
        {imageMoving
          ? (imageMoving?.width * worldScale * imageMoving.scaling).toFixed(0)
          : 0}{" "}
        x{" "}
        {imageMoving
          ? (imageMoving?.height * worldScale * imageMoving.scaling).toFixed(0)
          : 0}{" "}
      </div>

      <div
        style={{ paddingBottom: "20px", paddingLeft: "0px", width: "200px" }}
      >
        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
          <span>opacity: </span>
          <Slider
            size="small"
            variant="contained"
            value={imageMoving.opacity}
            type="range"
            min={0}
            max={1}
            step={0.1}
            marks={marks}
            valueLabelDisplay="auto"
            onChange={(event) =>
              setImageMoving({ ...imageMoving, opacity: +event.target.value })
            }
          />
        </Stack>
      </div>

      {state == "finishedRegistration" || state == "noRegistrationIsRunning" ? (
        <Button
          variant="contained"
          style={{ width: "300px" }}
          startIcon={<FileUploadIcon />}
          onClick={async () => {
            const { id } = await uploadSettingsToServer({
              worldScale,
              workingImages,
            });
            setState("runningRegistration");
            setTimeout(async function checkIfRegistrationCompletes() {
              const statuses = await fetch("http://localhost:4000/status", {
                method: "GET", // *GET, POST, PUT, DELETE, etc.
                mode: "cors", // no-cors, *cors, same-origin
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
              }).then((x) => x.json());

              if (statuses[id].status == "success") {
                setState("finishedRegistration");
                const resultingTransformedImageFiles = await fetch(
                  `http://localhost:4000/results/${id}`,
                  {
                    method: "GET", // *GET, POST, PUT, DELETE, etc.
                    mode: "cors", // no-cors, *cors, same-origin
                  }
                ).then((x) => x.json());
                setResultingImages(resultingTransformedImageFiles);
              } else {
                setTimeout(checkIfRegistrationCompletes, 5000);
              }
            }, 5000);
          }}
        >
          Run Registration
        </Button>
      ) : null}

      {state == "runningRegistration" ? (
        <Button
          disabled
          variant="contained"
          style={{ width: "300px" }}
          startIcon={<CircularProgress />}
        >
          Registration in progress
        </Button>
      ) : null}

      {state == "finishedRegistration" || resultingImages ? (
        <Button
          color="success"
          variant="contained"
          style={{ width: "300px" }}
          startIcon={<DownloadIcon />}
          onClick={() => {
            setShowResults(true);
          }}
        >
          Get Results of registration
        </Button>
      ) : null}

      <br />

      <br />
      <Button
        variant="contained"
        style={{ width: "300px" }}
        startIcon={<DownloadIcon />}
        onClick={() =>
          downloadSettings({
            // canvasX,
            // canvasY,
            worldScale,
            workingImages,
          })
        }
      >
        Save Settings (Fixed and Moving Images)
      </Button>

      <br />
      <Button
        variant="contained"
        style={{ width: "300px" }}
        startIcon={<DownloadIcon />}
        onClick={downloadCanvas}
      >
        Save Canvas (working images as per settings)
      </Button>

      <Drawer
        anchor={"right"}
        open={showResults}
        onClose={() => setShowResults(false)}
      >
        <Stack spacing={2}>
          {resultingImages
            ?.filter((image) => image.endsWith("png"))
            ?.map((image) => (
              <Card key={image}>
                <a
                  target="_blank"
                  download={image.split("/").at(-1)}
                  href={`http://localhost:4000${image}`}
                  title="image"
                >
                  <img src={`http://localhost:4000${image}`} />
                  <span>{image}</span>
                </a>
              </Card>
            ))}
        </Stack>
      </Drawer>
    </div>
  );
}
