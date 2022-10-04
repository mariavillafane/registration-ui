import "./App.css";
import { useEffect, useState } from "react";
import { RegistrationCanvas } from "./RegistrationCanvas";
import { useImage, useImageSize, useImageReader } from "./ImageTools";
import { UserInput } from "./UserInput";

const fixedimage = {
  path: "/fixed-image.jpg",
  //width: 3521
};

const movingimage = {
  path: "/moving-image-d02.jpg",
  //width: 941
};

function App() {
  const [canvasX, setCanvasX] = useState(500);
  const [canvasY, setCanvasY] = useState(500);

  const [worldScale, setWorldScale] = useState(0.1);

  const [movingScale, setMovingScale] = useState(1);

  const [imageMovingPath, setMovingFile] = useImageReader(movingimage.path);
  const [imageFixedPath, setFixedFile] = useImageReader(fixedimage.path);

  const [imageFixed, setImageFixed] = useImage(imageFixedPath, worldScale);
  const [imageMoving, setImageMoving] = useImage(imageMovingPath, worldScale * movingScale);

  return (
    <div className="App">
      <h1 id="titleMain">
        image registration
        <br />
        CANVAS
      </h1>
      
      
      <br />
      Fixed Image => 
      <input
        type="file"
        label="Fixed Image"
        id="button_image_fixed"
        onChange={(event) => setFixedFile(event.target.files[0])}
      />

      <br />  
      Moving Image =>
      <input
        type="file"
        id="button_image_input"
        onChange={(event) => setMovingFile(event.target.files[0])}
      />



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

/*
var a = document.createElement("a");
a.href = window.URL.createObjectURL(new Blob(["CONTENT , for example movingScale= " + App.movingScale], {type: "text/plain"}));
a.download = "demo.txt";
a.click();
*/

//https://code-boxx.com/create-save-files-javascript/#:~:text=The%20possible%20ways%20to%20create,offer%20a%20%E2%80%9Csave%20as%E2%80%9D.
