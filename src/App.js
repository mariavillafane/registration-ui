import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import { useRef } from "react";

const fixedimage = {
  path: "/fixed-image.jpg",
  //width: 3521
};

const movingimage = {
  path: "/moving-image-d02.jpg",
  //width: 941
};

function RegistrationCanvas(props) {
  //console.log(props.moving_X);
  return (
    <div id="myMask">
      <svg
        id="myCanvas"
        style={{
          width: props.canvas_X + "px", //props.fixed.width * 0.15,  // dim canvas
          height: props.canvas_Y + "px", //"500px",                  // dim canvas
        }}
      >
        <image id="myFixedImage" {...props.fixed} />
        <image id="myMovingImage" {...props.moving} />
      </svg>
    </div>
  );
}

//new
function useImageSize(path) {
  const [size, setSize] = useState({
    height: 0,
    width: 0,
  });

  useEffect(() => {
    const image = new Image();
    image.onload = () =>
      setSize({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });

    image.src = path;
  }, [path]); //useEffect(()=>{ .. }); ..}, [path]); only runs if the path changes

  return size;
}

//prepare images for canvas - for moving img, note that scale = worldScale*imageScale
function useImage(href, scale) {
  const img = useImageSize(href); // {width, height}
  const [dictionary, setDictionary] = useState({
    x: 0,
    y: 0,
    opacity: 1,
  });
  return [
    {
      href,
      x: dictionary.x,
      y: dictionary.y,
      width: img.width * scale,
      height: img.height * scale,
      opacity: dictionary.opacity,
    },
    setDictionary,
  ];
}

// setDictionary({
// ...dictionary,
// opacity: dictionary.opacity
//})

function App() {
  const [canvasX, setCanvasX] = useState(500);
  const [canvasY, setCanvasY] = useState(500);
  const [worldScale, setWorldScale] = useState(0.1);
  const [movingScale, setMovingScale] = useState(1); //0

  const fixedImageSize = useImageSize(fixedimage.path);
  const movingImageSize = useImageSize(movingimage.path);

  const [imageFixed, setImageFixed] = useImage(fixedimage.path, worldScale);
  const [imageMoving, setImageMoving] = useImage(
    movingimage.path,
    worldScale * movingScale
  );

  return (
    <div className="App">
      <h1
        style={{
          marginLeft: "40px", //"0em"
          color: "grey",
          fontSize: "40px",
          //fontFamily: "Lucida Console, Courier New, monospace",
          //lineHeight: "40px",
          marginBottom: "-8px",
        }}
      >
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
            image dimensions (original wxh): {fixedImageSize.width} x{" "}
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
            image dimensions (original wxh): {movingImageSize.width} x{" "}
            {movingImageSize.height} <br />
            image on canvas dimensions (scaled by {worldScale}, and by{" "}
            {movingScale}): {(imageMoving?.width).toFixed(0)} x{" "}
            {(imageMoving?.height).toFixed(0)}{" "}
          </div>
        </div>
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
