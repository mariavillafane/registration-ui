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

import { useImageSize } from "./ImageTools";

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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginLeft: "20px",
      }}
    >
      <div>virtual-canvas (bigger than "scaled" Fixed image)</div>

      <div>
        size_x:{" "}
        <input
          value={canvasX}
          type="number"
          onChange={(event) => setCanvasX(event.target.value)}
        />
      </div>

      <div>
        size_y:{" "}
        <input
          value={canvasY}
          type="number"
          onChange={(event) => setCanvasY(event.target.value)}
        />
      </div>

      <div>
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
        fixed-image
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
        moving-image
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
    </div>
  );
}
