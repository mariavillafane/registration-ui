import { useState, useRef, memo } from "react";
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

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.x === newProps.x &&
    oldProps.y === newProps.y &&
    oldProps.width === newProps.width &&
    oldProps.height === newProps.height &&
    oldProps.scaling === newProps.scaling &&
    oldProps.rotation === newProps.rotation &&
    oldProps.opacity === newProps.opacity &&
    oldProps.id === newProps.id
  );
}

const CanvasImage = memo(
  (props) => (
    <image
      x={props.x}
      y={props.y}
      opacity={props.opacity}
      href={props.imageUrl}
      width={props.width * props.scaling}
      height={props.height * props.scaling}
      transform={`rotate(${props.rotation},${props.x},${props.y})`}
    />
  ),
  arePropsEqual
);

const CanvasGrid = ({
  inner_canvas_width,
  inner_canvas_height,
  inner_grid_start,
}) => (
  <>
    <rect
      width={inner_canvas_width + Math.abs(inner_grid_start[0])}
      height={inner_canvas_height + Math.abs(inner_grid_start[1])}
      x={inner_grid_start[0]}
      y={inner_grid_start[1]}
      fill="url(#grid)"
    ></rect>
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
    <line
      id="myWorkSpace_axis_x"
      x1={inner_grid_start[0]}
      y1={0}
      x2={inner_canvas_width}
      y2={0}
      stroke="grey"
      strokeOpacity="0.67"
      strokeWidth="1.0"
    />
    <line
      id="myWorkSpace_axis_y"
      x1={0}
      y1={inner_grid_start[1]}
      x2={0}
      y2={inner_canvas_height}
      stroke="grey"
      strokeOpacity="0.67"
      strokeWidth="1.0"
    />
    {count(
      Math.ceil((inner_canvas_height + Math.abs(inner_grid_start[1])) / 100)
    )
      .map((i) => i + Math.min(0, Math.ceil(inner_grid_start[1] / 100)))
      .map((i) => (
        <text key={i} x={-15} y={i * 100} fontSize="0.25em" fill="blck">
          {" "}
          (0,{i * 100}){" "}
        </text>
      ))}
    {count(
      Math.ceil((inner_canvas_width + Math.abs(inner_grid_start[0])) / 100)
    )
      .map((i) => i + Math.min(0, Math.ceil(inner_grid_start[0] / 100)))
      .map((i) => (
        <text key={i} x={i * 100} y={-2} fontSize="0.25em" fill="blck">
          {" "}
          ({i * 100}, 0){" "}
        </text>
      ))}
  </>
);

export function RegistrationCanvas(props) {
  const ref = useRef();
  const [viewBox, setViewBox] = useState([
    0,
    0,
    500, //props.canvas_X
    500, //props.canvas_Y
  ]);
  const [mousePosition, setMousePosition] = useState(null);
  const zoomPower = props.zoomPower || 0.01;

  //console.log("worldScale =", props.worldScale) //GAETANO 26/10/2022
  //console.log(props.images);

  //get size of inner (green) canvas
  const inner_canvas_width = props.stacks
    .map((stack) => stack.width * stack.scaling + stack.x)
    .reduce((a, b) => (a > b ? a : b), 0); //is a bigger thank? if yes keep a, else keep b, and start with 0

  const inner_canvas_height = props.stacks
    .map((stack) => stack.height * stack.scaling + stack.y)
    .reduce((a, b) => (a > b ? a : b), 0); //is a bigger thank? if yes keep a, else keep b, and start with 0

  const inner_grid_start = props.stacks.reduce(
    ([x, y], b) => [x < b.x ? x : b.x, y < b.y ? y : b.y],
    [0, 0]
  );

  return (
    <Box
      grow={1}
      display="flex"
      flexDirection="column"
      justifyContent={"stretch"}
      alignItems={"stretch"}
    >
      <svg
        style={{ grow: 1, height: "100%" }}
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
      >
        {props.stacks.flatMap((stack) =>
          stack.imageEntries
            .filter((x) => x.checked)
            .map((entry) => (
              <CanvasImage
                key={stack.id + "-" + entry.id}
                {...stack}
                {...entry}
              />
            ))
        )}

        <CanvasGrid
          inner_canvas_width={inner_canvas_width}
          inner_canvas_height={inner_canvas_height}
          inner_grid_start={inner_grid_start}
        />
      </svg>
    </Box>
  );
}
