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

import { useImageSize, saveSettingsSoFar } from "./ImageTools";

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


  const settingsJson = JSON.stringify({ canvasX, canvasY, worldScale, movingScale, imageFixed, imageMoving}, null, 2);
  //console.log(settingsJson);

  const settings = window.URL.createObjectURL(new Blob([settingsJson], {type: "text/plain"}));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginLeft: "20px",
      }}
    >      
      <a href={settings} download="settings2.txt">
        <button>Upload (known) Settings!! => probably everything but the images themselves</button>
      </a>
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
      <a href={settings} download="settings1.txt">
        <button>Save Settings</button>
      </a>

    </div>
  );
}
