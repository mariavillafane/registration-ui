import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import { RegistrationCanvas } from "./RegistrationCanvas";
import { useImage, useImageSize } from "./ImageTools";

const fixedimage = {
  path: "/fixed-image.jpg",
  //width: 3521
};

const movingimage = {
  path: "/moving-image-d02.jpg",
  //width: 941
};

//function UserInput({canvasX, setCanvasX, canvasY, setCanvasY, worldScale, setWorldScale, imageFixed, setImageFixed, imageMoving, setImageMoving, movingScale, setMovingScale}) {..}
function UserInput(props) {
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

function App() {
  const [canvasX, setCanvasX] = useState(500);
  const [canvasY, setCanvasY] = useState(500);
  const [worldScale, setWorldScale] = useState(0.1);
  const [movingScale, setMovingScale] = useState(1);

  const [imageFixed, setImageFixed] = useImage(fixedimage.path, worldScale);
  const [imageMoving, setImageMoving] = useImage(
    movingimage.path,
    worldScale * movingScale
  );

  return (
    <div className="App">
      <h1 id="titleMain">
        image registration
        <br />
        CANVAS
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <RegistrationCanvas
          canvas_X={canvasX}
          canvas_Y={canvasY}
          fixed={imageFixed}
          moving={imageMoving}
        />
        <UserInput
          {...{
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
          }}
        />
      </div>
    </div>
  );
}

export default App;

//var a = document.createElement("a");
//a.href = window.URL.createObjectURL(new Blob(["CONTENT , for example movingScale= " + {movingScale}], {type: "text/plain"}));
//a.download = "demo.txt";
//a.click();

//https://code-boxx.com/create-save-files-javascript/#:~:text=The%20possible%20ways%20to%20create,offer%20a%20%E2%80%9Csave%20as%E2%80%9D.
