/*
export function UserInput(props) {
  const {
    canvasX,
    setCanvasX,
    canvasY,
    setCanvasY,
    worldScale,
    setWorldScale,
    imageFixed,
    setImageFixed,
    imageMoving,
    setImageMoving,
    movingScale,
    setMovingScale,
  } = props;
  
*/

import { useEffect, useState } from "react";
import { useImageSize, useImageReader } from "./ImageTools";
import { useImage } from "./ImageTools";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";

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
  imageFixed,
  setImageFixed,
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
      fontSize: "0.01em", //GAETANO 221014
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
    setImageFixed(parsedSettings.imageFixed);
    setWorkingImages(parsedSettings.workingImages);
  }, [settingsUploadedByUser]);

  const settingsJson = JSON.stringify(
    { canvasX, canvasY, worldScale, imageFixed, workingImages }, //workingImages (instead of imageMoving)
    null,
    2
  );

  const settings = window.URL.createObjectURL(
    new Blob([settingsJson], { type: "application/json" })
  );

  if (!imageFixed) {
    return null;
  }

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
        <br />
        <div>Virtual-canvas (bigger than "scaled" Fixed image)</div>
        <div>
          width (pixels along x):{" "}
          <input
            value={canvasX}
            type="number"
            onChange={(event) => setCanvasX(event.target.value)}
          />
        </div>
        <div>
          height (pixels along y):{" "}
          <input
            value={canvasY}
            type="number"
            onChange={(event) => setCanvasY(event.target.value)}
          />
        </div>
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
        <div>
          <br />
          <br />
          <br />
          Fixed-image ID={imageFixed.id} (position on canvas)
        </div>
        <div>
          coord_x:{" "}
          <input
            value={imageFixed.x}
            type="number"
            onChange={(event) =>
              setImageFixed({ ...imageFixed, x: +event.target.value })
            }
          />
        </div>
        <div>
          coord_y:{" "}
          <input
            value={imageFixed.y}
            type="number"
            onChange={(event) =>
              setImageFixed({ ...imageFixed, y: +event.target.value })
            }
          />
        </div>
        <div>
          scaling (affects fixed image only):{" "}
          <input
            value={imageFixed.scaling}
            type="number"
            min={0.1}
            max={10.0}
            step={0.01}
            onChange={(event) =>
              //setImageFixed({ ...imageFixed, scaling: ((+event.target.value)*worldScale) })  //Gaetano 26/10/2022
              setImageFixed({ ...imageFixed, scaling: +event.target.value })
            }
          />
        </div>

        <div>
          image original dimensions (wxh): {imageFixed.width} x{" "}
          {imageFixed.height} <br />
          image on canvas dimensions (scaled by {worldScale}, and by{" "}
          {imageFixed.scaling}):{" "}
          {(imageFixed?.width * worldScale * imageFixed.scaling).toFixed(0)} x{" "}
          {(imageFixed?.height * worldScale * imageFixed.scaling).toFixed(0)}{" "}
        </div>

        <div
          style={{ paddingBottom: "20px", paddingLeft: "0px", width: "200px" }}
        >
          <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
            <span>opacity: </span>
            <Slider
              size="small"
              variant="contained"
              value={imageFixed.opacity}
              type="range"
              min={0}
              max={1}
              step={0.1}
              marks={marks}
              valueLabelDisplay="auto"
              onChange={(event) =>
                setImageFixed({ ...imageFixed, opacity: +event.target.value })
              }
            />
          </Stack>
        </div>
        <br />
        <br />
      </div>

      <div>
        <br />
        Moving-image ID={imageMoving.id} (position on canvas)
      </div>
      <div>
        coord_x:{" "}
        <input
          value={imageMoving.x}
          type="number"
          onChange={(event) =>
            setImageMoving({ ...imageMoving, x: +event.target.value })
          }
        />
      </div>
      <div>
        coord_y:{" "}
        <input
          value={imageMoving.y}
          type="number"
          onChange={(event) =>
            setImageMoving({ ...imageMoving, y: +event.target.value })
          }
        />
      </div>
      <div>
        scaling (affects moving image only):{" "}
        <input
          value={imageMoving.scaling}
          type="number"
          min={0.1}
          max={10.0}
          step={0.01}
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
          Save Moving Image Settings
        </Button>
      </a>
    </div>
  );
}
