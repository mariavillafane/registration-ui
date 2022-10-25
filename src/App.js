import "./App.css";
import { useEffect, useState } from "react";
import { RegistrationCanvas } from "./RegistrationCanvas";
import { useImage, useImageSize, useImageReader } from "./ImageTools";
import { UserInput } from "./UserInput";
import Button from "@mui/material/Button";
import { ImageUploader } from "./ImageUploader";

const fixedimage = {
  path: "/fixed-image.jpg",
  //width: 3521
};

const movingimage = {
  path: "/moving-image-d02.jpg",
  //width: 941
};

//https://www.geeksforgeeks.org/lodash-_-omit-method/
//https://react-dnd.github.io/react-dnd/examples/sortable/simple

function App() {
  const [canvasX, setCanvasX] = useState(450);
  const [canvasY, setCanvasY] = useState(450);

  const [worldScale, setWorldScale] = useState(0.1);

  const [movingScale, setMovingScale] = useState(1);

  const [imageMovingPath, setMovingFile] = useImageReader(movingimage.path);
  const [imageFixedPath, setFixedFile] = useImageReader(fixedimage.path);

  const [imageFixed, setImageFixed] = useImage(imageFixedPath, worldScale);
  const [imageMoving, setImageMoving] = useImage(
    imageMovingPath,
    worldScale * movingScale
  );

  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(0);
  const [workingImages, setWorkingImages] = useState([]);

  return (
    <div className="App">
      <h1 id="titleMain">
        image registration
        <br />
        CANVAS
      </h1>

      <br />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <RegistrationCanvas
          canvas_X={canvasX}
          canvas_Y={canvasY}
          // fixed={imageFixed}
          // moving={imageMoving}
          images={images}
        />
        <ImageUploader
          images={images}
          setImages={setImages}
          selectedImageId={selectedImageId}
          setSelectedImageId={setSelectedImageId}
        />

        <UserInput
          workingImages={[...images.slice(1)]} //{images}
          setWorkingImages={images}
          imageFixed={images[0]}
          // setImageFixed takes a function that receives the lastest imageFixed
          setImageFixed={(newImageFixed) => {
            setImages([newImageFixed, ...images.slice(1)]);
          }}
          imageMoving={images.find((image) => selectedImageId == image.id)}
          setImageMoving={(newImageMoving) => {
            // console.log("newImageMoving ID = " + newImageMoving.id);
            const x = images.findIndex((image) => selectedImageId == image.id);
            setImages([
              ...images.slice(0, x), // (0, x)
              newImageMoving,
              ...images.slice(x + 1),
            ]);
          }}
          //GAETANO 25/10/2022 => how to set "setWorkingImages" (instead of only 1 movingImage, so to give attributes to all moving images!)

          // setWorkingImages={(newImageMoving) => {
          //   const x = images.findIndex((image) => selectedImageId == image.id);
          //   setImages([
          //     ...images.slice(0, x), // (0, x)
          //     newImageMoving,
          //     ...images.slice(x + 1),
          //   ]);
          // }}

          {...{
            canvasX,
            setCanvasX,
            canvasY,
            setCanvasY,
            worldScale,
            setWorldScale,
            // movingScale,
            // setMovingScale,
            // setMovingFile,
            // setFixedFile,
          }}
        />
      </div>
    </div>
  );
}

export default App;

//useful links
//https://code-boxx.com/create-save-files-javascript/#:~:text=The%20possible%20ways%20to%20create,offer%20a%20%E2%80%9Csave%20as%E2%80%9D.
