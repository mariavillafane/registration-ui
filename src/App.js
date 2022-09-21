import "./App.css";
import { useEffect, useState } from "react";
import { RegistrationCanvas } from "./RegistrationCanvas";
import { useImage, useImageSize } from "./ImageTools";
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

  const [imageMovingPath, setImageMovingPath] = useState(movingimage.path);

  const [imageFixed, setImageFixed] = useImage(fixedimage.path, worldScale);

  const [imageMoving, setImageMoving] = useImage(
    imageMovingPath,
    worldScale * movingScale
  );

  const [selectedFile, setSelectedFile] = useState(null);
  console.log("m = ", selectedFile);

  useEffect(() => {
    if (!selectedFile) {
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageMovingPath(reader.result);
    });
    reader.readAsDataURL(selectedFile);
  }, [selectedFile]);

  return (
    <div className="App">
      <h1 id="titleMain">
        image registration
        <br />
        CANVAS
      </h1>

      <input
        type="file"
        id="button_image_input"
        //value ={}

        onChange={(event) => setSelectedFile(event.target.files[0])}
      ></input>
      <div id="display_image"></div>

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
