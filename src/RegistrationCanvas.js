import { useState } from "react";

function calculateViewBoxChange(event, viewBox) {
  console.log(event);
  console.log(event.target.getBoundingClientRect());

  const mouseX = -event.target.getBoundingClientRect().x + event.clientX;
  console.log(mouseX);

  const mouseY = -event.target.getBoundingClientRect().y + event.clientY;
  console.log(mouseY);

  const mouseScroll = event.deltaY > 0 ? 1 : -1; //if event bigger than 0, then 1, else -1
  console.log(mouseScroll);

  const newViewBox = [
    0,
    0,
    viewBox[2] + 1 * mouseScroll,
    viewBox[3] + 1 * mouseScroll,
  ];

  return newViewBox;
}

export function RegistrationCanvas(props) {
  //console.log(props.moving_X);
  const offsetX = 100;
  const offsetY = 40;

  const [viewBox, setViewBox] = useState([
    0,
    0,
    props.canvas_X,
    props.canvas_Y,
  ]);

  return (
    <div id="myMask">
      <svg
        id="myCanvas"
        onWheel={(event) => setViewBox(calculateViewBoxChange(event, viewBox))}
        viewBox={viewBox.join(" ")}
        //viewBox={`${offsetX} ${offsetY} ${props.canvas_X-offsetX} ${props.canvas_Y-offsetY}`}
        //viewBox={`20 20 ${props.canvas_X} ${props.canvas_Y}`}
        //viewBox={`0 0 200 200`}
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
