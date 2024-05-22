import { useEffect, useState } from "react";
import { readImageAsBase64, svgToPng, useJsonReader } from "./ImageTools";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ImageJs from "image-js";
import { Box, CircularProgress } from "@mui/material";

//opacity marks
const marks = [
  {
    fontSize: "0.01em", //GAETANO 221014
    value: 0.0,
    label: "transparent",
  },
  {
    value: 1.0,
    label: "solid",
  },
];

function download(url, name) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const blobToBase64 = function (blobUrl) {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = blobUrl;
  })
    .then((img) => {
      // URL.revokeObjectURL(blobUrl);
      // Limit to 256x256px while preserving aspect ratio
      let [w, h] = [img.width, img.height];

      let canvas = document.createElement("canvas");
      console.log(canvas);
      canvas.width = w;
      canvas.height = h;
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      return canvas.toDataURL();
    })
    .catch(console.log);
};

async function downloadCanvas() {
  await Promise.all(
    [...document.querySelectorAll("#myCanvas image")].map(async (img) => {
      img.href.baseVal = await blobToBase64(img.href.baseVal);
    })
  );

  const svgAsString = document.querySelector("#myCanvas").outerHTML; //this is a string representative of myCanvas
  const png = await svgToPng(svgAsString, 0, "white");
  const name = "canvas-" + new Date().toISOString().split("T")[0] + ".png";

  download(png, name);
}

async function createSettingsDotJson(data) {
  const workingImages = await Promise.all(
    data.workingImages.map(async (workingImage) => ({
      ...workingImage,
      imageEntries: await Promise.all(
        workingImage.imageEntries.map(async (imageEntry) => ({
          base64:
            imageEntry.base64 || (await readImageAsBase64(imageEntry.file)),
          ...imageEntry,
        }))
      ),
    }))
  );
  console.log({
    ...data,
    imageFixed: workingImages[0],
    workingImages: workingImages.slice(1),
  });
  return JSON.stringify(
    {
      ...data,
      imageFixed: workingImages[0],
      workingImages: workingImages.slice(1),
    },
    null,
    2
  );
}

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

  console.log(await response.json());
}

async function downloadSettings(data) {
  const settingsJson = await createSettingsDotJson(data);

  const settings = window.URL.createObjectURL(
    new Blob([settingsJson], { type: "application/json" })
  );
  download(settings, "settings.json");
  window.URL.revokeObjectURL(settings); //delete object after creating it
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
  const [settingsUploadedByUser, setSelectedSettings] = useJsonReader(
    null,
    "readAsText"
  );
  //console.log(settingsUploadedByUser);

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

      {state == "noRegistrationIsRunning" ? (
        <Button
          variant="contained"
          style={{ width: "300px" }}
          startIcon={<FileUploadIcon />}
          onClick={() => {
            uploadSettingsToServer({
              worldScale,
              workingImages,
            });
            setState("runningRegistration");
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

      {state == "finishedRegistration" ? (
        <Button
          color="success"
          variant="contained"
          style={{ width: "300px" }}
          startIcon={<DownloadIcon />}
          onClick={() =>
            uploadSettingsToServer({
              worldScale,
              workingImages,
            })
          }
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
    </div>
  );
}
