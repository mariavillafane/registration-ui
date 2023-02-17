import { useState, useRef } from "react";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { Button } from "@mui/material";
import { Box } from "@mui/system";

//zoom speed marks
const marks = [
  {
    fontSize: "0.01em", //GAETANO 221014
    value: 0.1,
    label: "slowZoom",
  },
  {
    value: 0.9,
    label: "fastZoom",
  },
];

//ZOOM
function calculateViewBoxChange(event, viewBox, ref, zoomPower) {
  ////console.log(event);  //console.log(event.target.getBoundingClientRect());
  //console.log(ref.current.getBoundingClientRect()); //the svg
  //console.log(event.clientX)
  const mouseX = -ref.current.getBoundingClientRect().x + event.clientX;
  //console.log(mouseX);

  const mouseY = -ref.current.getBoundingClientRect().y + event.clientY;
  //console.log(mouseY);

  const canvasWidth = +ref.current.clientWidth;
  const canvasHeight = +ref.current.clientHeight;

  //console.log(ref.current);

  const mouseScroll = event.deltaY > 0 ? 1 : -1; //if event bigger than 0, then 1, else -1

  const newViewBoxWidth = viewBox[2] + zoomPower * mouseScroll * viewBox[2];
  const newViewBoxHeight = viewBox[3] + zoomPower * mouseScroll * viewBox[3];

  const offsetX = (mouseX / canvasWidth) * (viewBox[2] - newViewBoxWidth);
  const offsetY = (mouseY / canvasHeight) * (viewBox[3] - newViewBoxHeight);

  //console.log({ offsetX, offsetY, mx: mouseX / canvasWidth });

  const newViewBox = [
    viewBox[0] + offsetX,
    viewBox[1] + offsetY,
    newViewBoxWidth, //the smaller this value, the bigger the image (ZOOM)
    newViewBoxHeight,
  ];

  return newViewBox;
}

function handleDrag(ref, mousePosition, setMousePosition, setViewBox, viewBox) {
  //DRAG
  const onMouseDown = (event) =>
    setMousePosition({
      x: event.clientX,
      y: event.clientY,
      viewBox,
    });

  const onMouseUp = () => setMousePosition(null);

  const onMouseMove = (event) => {
    if (!mousePosition) return;
    const movement = {
      x: event.clientX - mousePosition.x,
      y: event.clientY - mousePosition.y,
    };
    console.log(movement);

    const canvasWidth = +ref.current.clientWidth;
    const canvasHeight = +ref.current.clientHeight;

    setViewBox([
      mousePosition.viewBox[0] - (movement.x / canvasWidth) * viewBox[2],
      mousePosition.viewBox[1] - (movement.y / canvasHeight) * viewBox[3],
      viewBox[2],
      viewBox[3],
    ]);
  };
  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
  };
}

function count(n) {
  return Array.from({ length: n }, (_, i) => i);
}

export function RegistrationCanvas(props) {
  const ref = useRef();
  const [viewBox, setViewBox] = useState([
    0,
    0,
    props.canvas_X,
    props.canvas_Y,
  ]);
  const [mousePosition, setMousePosition] = useState(null);
  const [zoomPower, setZoomPower] = useState(0.01);

  //new 230217
  const [outercanvasX, setOutercanvasX] = useState(1000);
  const [outercanvasY, setOutercanvasY] = useState(950);

  //console.log("worldScale =", props.worldScale) //GAETANO 26/10/2022
  console.log(props.images);
  return (
    <div>
      <div
        style={{ paddingBottom: "20px", paddingLeft: "40px", width: "350px" }}
      >
        <div>
          canvas width:{" "}
          <input
            value={outercanvasX}
            type="number"
            style={{ width: "50px" }}
            onChange={(event) => setOutercanvasX(event.target.value)}
          />{" "}
          x height:{" "}
          <input
            value={outercanvasY}
            type="number"
            style={{ width: "50px" }}
            onChange={(event) => setOutercanvasY(event.target.value)}
          />{" "}
          (pixels)
        </div>

        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
          <span>zoomSpeed </span>
          <span>
            <ZoomInIcon />
          </span>
          <Slider
            size="small"
            value={zoomPower}
            startIcon={<ZoomInIcon />}
            type="range"
            min={0.1}
            max={0.9}
            step={0.1}
            valueLabelDisplay="auto"
            //style={{fontSize: "0.01em"}}
            marks={marks}
            onChange={(event) => setZoomPower(event.target.value)}
          />
        </Stack>
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        ref={ref}
        id="myCanvas"
        onWheel={(event) =>
          setViewBox(calculateViewBoxChange(event, viewBox, ref, zoomPower))
        }
        {...handleDrag(
          ref,
          mousePosition,
          setMousePosition,
          setViewBox,
          viewBox
        )}
        viewBox={viewBox.join(" ")}
        //viewBox={`0 0 200 200`}   //ZOOM

        style={{
          width: outercanvasX, //"1000px",
          height: outercanvasY, //"800px", // pixels on the screen
        }}
      >
        {props.images.map((imageUploaded) => (
          <image
            key={imageUploaded.id}
            {...imageUploaded}
            width={imageUploaded.width * imageUploaded.scaling} //GAETANO 26/10/2022
            height={imageUploaded.height * imageUploaded.scaling}
            transform={`rotate(${imageUploaded.rotation},${imageUploaded.x},${imageUploaded.y})`}
          />
        ))}

        <rect
          id="myWorkSpace"
          x={0}
          y={0}
          width={props.canvas_X}
          height={props.canvas_Y}
          fill="none"
          stroke="green"
        />

        {
          //grid of numbers
          count(4).map((i) => (
            <text key={i} x={-15} y={i * 100} fontSize="0.25em" fill="blck">
              {" "}
              (0,{i * 100}){" "}
            </text>
          ))
        }

        {count(4).map((i) => (
          <text key={i} x={i * 100} y={-2} fontSize="0.25em" fill="blck">
            {" "}
            ({i * 100},0){" "}
          </text>
        ))}

        <rect width="450" height="450" x={0} y={0} fill="url(#grid)"></rect>

        <defs>
          <pattern
            id="grid"
            // viewBox = "0,0,10,10"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="10"
              stroke="black"
              strokeOpacity="0.67"
              strokeWidth="0.5"
            />
            <line
              x1="0"
              y1="0"
              x2="10"
              y2="0"
              stroke="grey"
              strokeOpacity="0.5"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
      </svg>
    </div>
  );
}
