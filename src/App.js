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

  const [imageFixed, setImageFixed] = useImage(fixedimage.path, worldScale);
  const [imageMoving, setImageMoving] = useImage(
    movingimage.path,
    worldScale * movingScale
  );

  //css selector that finds the DOM(or html) element with the id "button_image_input" (# = id)
  const button_image_input = document.querySelector("#button_image_input");

  //if something changes (i.e. user chooses the file), execute the function..
  button_image_input?.addEventListener("change", function () {
    //console.log(image_input.value);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      //console.log(reader.result)
      var uploaded_image = reader.result;
      document.querySelector(
        "#display_image"
      ).style.backgroundImage = `url(${uploaded_image})`;
    });
    reader.readAsDataURL(this.files[0]); //this. = button_image_input.
  });

  return (
    <div className="App">
      <h1 id="titleMain">
        image registration
        <br />
        CANVAS
      </h1>

      <input type="file" id="button_image_input"></input>
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
