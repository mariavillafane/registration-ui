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

import { useEffect } from "react";
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
  movingScale,
  setMovingScale,
  setMovingFile,
  setFixedFile,
}) {
  const fixedImageSize = useImageSize(imageFixed.href);
  const movingImageSize = useImageSize(imageMoving.href);

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
    setMovingScale(parsedSettings.movingScale);
    setImageFixed(parsedSettings.imageFixed);
    setImageMoving(parsedSettings.imageMoving);
  }, [settingsUploadedByUser]);

  const settingsJson = JSON.stringify(
    { canvasX, canvasY, worldScale, movingScale, imageFixed, imageMoving },
    null,
    2
  );

  const settings = window.URL.createObjectURL(
    new Blob([settingsJson], { type: "application/json" })
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginLeft: "20px",
      }}
    >
      {/* Upload (known) Image Settings:
      <input
        type="file"
        onChange={(event) => setSelectedSettings(event.target.files[0])}
      /> */}

      <Button
        variant="contained"
        style={{ width: "350px" }}
        startIcon={<FileUploadIcon />}
      >
        Upload (known) Image Settings
        <input
          hidden
          type="file"
          onChange={(event) => setSelectedSettings(event.target.files[0])}
        />
      </Button>

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

      <br />
      <br />
      <Button
        variant="outlined"
        style={{ width: "300px" }}
        startIcon={<FileUploadIcon />}
      >
        Upload Fixed Image
        <input
          hidden
          type="file"
          onChange={(event) => setFixedFile(event.target.files[0])}
        />
      </Button>

      <div>
        <br />
        Fixed-image (position on canvas)
      </div>
      <div>
        coord_x:{" "}
        <input
          value={imageFixed.x}
          type="number"
          onChange={(event) =>
            setImageFixed({ ...imageFixed, x: event.target.value })
          }
        />
      </div>
      <div>
        coord_y:{" "}
        <input
          value={imageFixed.y}
          type="number"
          onChange={(event) =>
            setImageFixed({ ...imageFixed, y: event.target.value })
          }
        />
      </div>
      <div>
        image original dimensions (wxh): {fixedImageSize.width} x{" "}
        {fixedImageSize.height} <br />
        image on canvas dimensions (scaled by {worldScale}):{" "}
        {(imageFixed?.width).toFixed(0)} x {(imageFixed?.height).toFixed(0)}{" "}
      </div>

      <br />
      <br />
      <Button
        variant="outlined"
        style={{ width: "300px" }}
        startIcon={<FileUploadIcon />}
      >
        Upload Moving Image
        <input
          hidden
          type="file"
          onChange={(event) => setMovingFile(event.target.files[0])}
        />
      </Button>

      <div>
        <br />
        Moving-image (position on canvas)
      </div>
      <div>
        coord_x:{" "}
        <input
          value={imageMoving.x}
          type="number"
          onChange={(event) =>
            setImageMoving({ ...imageMoving, x: event.target.value })
          }
        />
      </div>
      <div>
        coord_y:{" "}
        <input
          value={imageMoving.y}
          type="number"
          onChange={(event) =>
            setImageMoving({ ...imageMoving, y: event.target.value })
          }
        />
      </div>
      <div>
        scaling (only affects moving image, as initial parameter):{" "}
        <input
          value={movingScale}
          type="number"
          min={0.8}
          max={1.2}
          step={0.01}
          onChange={(event) => setMovingScale(event.target.value)}
        />
      </div>
      <div>
        image original dimensions (wxh): {movingImageSize.width} x{" "}
        {movingImageSize.height} <br />
        image on canvas dimensions (scaled by {worldScale}, and by {movingScale}
        ): {(imageMoving?.width).toFixed(0)} x{" "}
        {(imageMoving?.height).toFixed(0)}{" "}
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
              setImageMoving({ ...imageMoving, opacity: event.target.value })
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

      {
        //here need to display all setting to add a second movign image
      }

      <br />
      <a href={settings}>
        <Button
          variant="outlined"
          style={{ width: "300px" }}
          color="success"
          startIcon={<FileUploadIcon />}
        >
          Add Moving Image
        </Button>
      </a>
    </div>
  );
}
