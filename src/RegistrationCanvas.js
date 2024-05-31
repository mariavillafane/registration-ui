import { useState, useRef, memo, useMemo } from "react";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { Button } from "@mui/material";
import { Box } from "@mui/system";
import { ReactSVGPanZoom, TOOL_NONE, INITIAL_VALUE } from "react-svg-pan-zoom";
import { useWindowSize } from "@react-hook/window-size";

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

const CanvasImage = (props) => (
  <image
    data-stack-id={props.stackId}
    data-entry-id={props.entryId}
    x={props.x}
    y={props.y}
    opacity={props.opacity}
    href={props.imageUrl}
    width={props.width * props.scaling}
    height={props.height * props.scaling}
    transform={`rotate(${props.rotation},${props.x},${props.y})`}
  />
);

export function RegistrationCanvas(props) {
  const ref = useRef();
  const Viewer = useRef(null);
  const [tool, onChangeTool] = useState(TOOL_NONE);
  const [value, onChangeValue] = useState(INITIAL_VALUE);
  const [dragStart, setDragStart] = useState(null);
  // const [width, height] = useWindowSize({initialWidth: 400, initialHeight: 400})

  const w = (props.stacks?.[0]?.x || 0) + (props.stacks?.[0]?.width || 0);
  const h = (props.stacks?.[0]?.y || 0) + (props.stacks?.[0]?.height || 0);

  return (
    <Box
      onMouseLeave={() => setDragStart(null)}
      ref={ref}
      width="100%"
      grow={1}
      display="flex"
      flexDirection="column"
      justifyContent={"stretch"}
      alignItems={"stretch"}
    >
      <ReactSVGPanZoom
        background="transparent"
        SVGBackground="transparent"
        width={ref.current?.clientWidth || 1000}
        height={ref.current?.clientHeight || 500}
        ref={Viewer}
        value={value}
        onChangeValue={onChangeValue}
        tool={tool}
        onChangeTool={onChangeTool}
        onMouseDown={(e) => {
          if (e.originalEvent?.target?.dataset?.stackId === undefined) return;

          const id = +e.originalEvent.target.dataset.stackId;
          const { clientX, clientY } = e.originalEvent;
          const { x, y } = props.stacks[id];
          setDragStart([clientX / e.value.a, clientY / e.value.d, x, y, id]);
          console.log(e);
          console.log([clientX, clientY, x, y, id]);
          props.setSelectedImageId(id);
        }}
        onMouseMove={(e) => {
          if (!dragStart) return;
          console.log(e);

          const id = dragStart[4];
          const { clientX, clientY } = e.originalEvent;
          const [x, y] = [
            clientX / e.value.a - dragStart[0] + dragStart[2],
            clientY / e.value.d - dragStart[1] + dragStart[3],
          ];

          const stacks = [
            ...props.stacks.slice(0, id),
            { ...props.stacks[id], x, y },
            ...props.stacks.slice(id + 1, props.stacks.length),
          ];

          console.log({ dragStart }, { x, y });
          props.setStacks(stacks);
        }}
        onMouseUp={(e) => {
          if (!dragStart) return;
          const id = dragStart[4];

          const { clientX, clientY } = e.originalEvent;
          const [x, y] = [
            clientX / e.value.a - dragStart[0] + dragStart[2],
            clientY / e.value.d - dragStart[1] + dragStart[3],
          ];

          const stacks = [
            ...props.stacks.slice(0, id),
            { ...props.stacks[id], x, y },
            ...props.stacks.slice(id + 1, props.stacks.length),
          ];

          props.setStacks(stacks);
          setDragStart(null);
        }}
      >
        <svg width={w} height={h}>
          <defs>
            <pattern
              id="smallGrid"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="gray"
                stroke-width="0.5"
              />
            </pattern>
            <pattern
              id="grid"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <rect width="100" height="100" fill="url(#smallGrid)" />
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="gray"
                stroke-width="1"
              />
            </pattern>
          </defs>

          <rect
            x={-1000}
            y={-1000}
            width="200%"
            height="200%"
            fill="url(#grid)"
          />

          {props.stacks.flatMap((stack) =>
            stack.imageEntries
              .filter((x) => x.checked)
              .map((entry) => (
                <CanvasImage
                  key={stack.id + "-" + entry.id}
                  stackId={stack.id}
                  entryId={entry.id}
                  {...stack}
                  {...entry}
                />
              ))
          )}

          {/* <CanvasGrid
          inner_canvas_width={inner_canvas_width}
          inner_canvas_height={inner_canvas_height}
          inner_grid_start={inner_grid_start}
        /> */}
        </svg>
      </ReactSVGPanZoom>
    </Box>
  );
}
