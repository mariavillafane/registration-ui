import { useEffect, useState } from "react";
import { useImageSize, useImageReader } from "./ImageTools";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

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

export function UserInput({
  canvasX,
  setCanvasX,
  canvasY,
  setCanvasY,
  worldScale,
  setWorldScale,
  imageMoving,
  setImageMoving,
  workingImages,
  setWorkingImages,
}) {
  const [settingsUploadedByUser, setSelectedSettings] = useImageReader(
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
    setCanvasX(parsedSettings.canvasX);
    setCanvasY(parsedSettings.canvasY);
    setWorldScale(parsedSettings.worldScale);
    setWorkingImages(parsedSettings.workingImages);
  }, [settingsUploadedByUser]);

  const settingsJson = JSON.stringify(
    {
      canvasX,
      canvasY,
      worldScale,
      imageFixed: workingImages[0],
      workingImages: workingImages.slice(1),
    },
    null,
    2
  );

  const settings = window.URL.createObjectURL(
    new Blob([settingsJson], { type: "application/json" })
  );

  if (!imageMoving) {
    return null;
  }

  const svgAsString = document.querySelector("#myCanvas").outerHTML; //this is a string representative of myCanvas
  const preface = '<?xml version="1.0" standalone="no"?>\r\n';
  const svgBlob = new Blob([preface, svgAsString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgUrl = URL.createObjectURL(svgBlob);

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

      <br />
      <a href={settings} download="settings.json">
        <Button
          variant="contained"
          style={{ width: "300px" }}
          startIcon={<DownloadIcon />}
        >
          Save Settings (Fixed and Moving Images)
        </Button>
      </a>
      <br />
      <a href={svgUrl} download="canvas.svg">
        <Button
          variant="contained"
          style={{ width: "300px" }}
          startIcon={<DownloadIcon />}
        >
          Save Canvas (working images as per settings)
        </Button>
      </a>
    </div>
  );
}
