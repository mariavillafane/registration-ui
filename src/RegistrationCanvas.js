import { useState, useRef } from "react";

function calculateViewBoxChange(event, viewBox, ref) {
  //console.log(event);  //console.log(event.target.getBoundingClientRect());
  console.log(ref.current.getBoundingClientRect()); //the svg

  const mouseX = -ref.current.getBoundingClientRect().x + event.clientX;
  console.log(mouseX);

  const mouseY = -ref.current.getBoundingClientRect().y + event.clientY;
  console.log(mouseY);

  const canvasWidth = +ref.current.clientWidth;
  const canvasHeight = +ref.current.clientHeight;

  console.log(ref.current);

  const mouseScroll = event.deltaY > 0 ? 1 : -1; //if event bigger than 0, then 1, else -1

  const newViewBoxWidth = viewBox[2] + 0.01 * mouseScroll * viewBox[2];
  const newViewBoxHeight = viewBox[3] + 0.01 * mouseScroll * viewBox[3];

  const offsetX = (mouseX / canvasWidth) * (viewBox[2] - newViewBoxWidth);
  const offsetY = (mouseY / canvasHeight) * (viewBox[3] - newViewBoxHeight);

  console.log({ offsetX, offsetY, mx: mouseX / canvasWidth });

  const newViewBox = [
    viewBox[0] + offsetX,
    viewBox[1] + offsetY,
    newViewBoxWidth, //the smaller this value, the bigger the image
    newViewBoxHeight,
  ];

  return newViewBox;
}

export function RegistrationCanvas(props) {
  const ref = useRef();
  const [viewBox, setViewBox] = useState([
    0,
    0,
    props.canvas_X,
    props.canvas_Y,
  ]);

  return (
    //<div id="myMask">
    <svg
      ref={ref}
      id="myCanvas"
      onWheel={(event) =>
        setViewBox(calculateViewBoxChange(event, viewBox, ref))
      }
      viewBox={viewBox.join(" ")}
      //viewBox={`0 0 200 200`}   //ZOOM
      //preserveAspectRatio="xMinYMin meet" //"none"//xMinYMin slice" //https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox
      style={{
        width: "600px",
        height: "600px", // pixels on the screen
      }}
    >
      <image id="myFixedImage" {...props.fixed} />
      <image id="myMovingImage" {...props.moving} />
      <rect
        id="myWorkSpace"
        x={0}
        y={0}
        width={props.canvas_X}
        height={props.canvas_Y}
        fill="none"
        stroke="green"
      />
    </svg>
    //</div>
  );
}
