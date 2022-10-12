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
  
  const fixedImageSize ..
*/

import { useEffect } from "react";
import { useImageSize, useImageReader } from "./ImageTools";

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
}) {
  const fixedImageSize = useImageSize(imageFixed.href);
  const movingImageSize = useImageSize(imageMoving.href);

  const [settingsUploadedByUser, setSelectedSettings] = useImageReader(
    null,
    "readAsText"
  );
  //console.log(settingsUploadedByUser);

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
      Upload (known) Image Settings:
      <input
        type="file"
        onChange={(event) => setSelectedSettings(event.target.files[0])}
      />
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
        opacity:{" "}
        <input
          value={imageMoving.opacity}
          type="range"
          min={0}
          max={1}
          step={0.1}
          onChange={(event) =>
            setImageMoving({ ...imageMoving, opacity: event.target.value })
          }
        />
      </div>
      <div>
        image original dimensions (wxh): {movingImageSize.width} x{" "}
        {movingImageSize.height} <br />
        image on canvas dimensions (scaled by {worldScale}, and by {movingScale}
        ): {(imageMoving?.width).toFixed(0)} x{" "}
        {(imageMoving?.height).toFixed(0)}{" "}
      </div>
      <br />
      <a href={settings} download="settings.json">
        {/* <a href="settings?file=path/<?=$row['file_name']?>" {...settings} download>    //GAETANO 221012 */}
        {/* <a ref="settings?file=path/<?=$row['file_name']?>" href={settings} download ="a.txt" >  */}
        {/* https://stackoverflow.com/questions/50694881/how-to-download-file-in-react-js */}

        <button>Save Settings</button>
      </a>
    </div>
  );
}
