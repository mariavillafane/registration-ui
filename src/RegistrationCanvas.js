import { useState, useRef } from "react";

//ZOOM
function calculateViewBoxChange(event, viewBox, ref) {
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

  const newViewBoxWidth = viewBox[2] + 0.01 * mouseScroll * viewBox[2];
  const newViewBoxHeight = viewBox[3] + 0.01 * mouseScroll * viewBox[3];

  const offsetX = (mouseX / canvasWidth) * (viewBox[2] - newViewBoxWidth);
  const offsetY = (mouseY / canvasHeight) * (viewBox[3] - newViewBoxHeight);

  //console.log({ offsetX, offsetY, mx: mouseX / canvasWidth });

  const newViewBox = [
    viewBox[0] + offsetX,
    viewBox[1] + offsetY,
    newViewBoxWidth, //the smaller this value, the bigger the image
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

export function RegistrationCanvas(props) {
  const ref = useRef();
  const [viewBox, setViewBox] = useState([
    0,
    0,
    props.canvas_X,
    props.canvas_Y,
  ]);
  const [mousePosition, setMousePosition] = useState(null);

  return (
    //<div id="myMask">
    <svg
      ref={ref}
      id="myCanvas"
      onWheel={(event) =>
        setViewBox(calculateViewBoxChange(event, viewBox, ref))
      }
      
      {...handleDrag(ref, mousePosition, setMousePosition, setViewBox, viewBox)}

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
    <rect //https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath
      id="myWorkSpace"
      x={0}
      y={0}
      width={props.canvas_X}
      height={props.canvas_Y}
      fill="none"
      stroke="green"
    />
    <text x={0} y={0} fill="green"> 0 </text>

    
      {/*  
      <clipPath id="myClip" >
        <rect //https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath
          id="myWorkSpace"
          x={0}
          y={0}
          width={props.canvas_X}
          height={props.canvas_Y}
          fill="none"
          stroke="green"
        />
      </clipPath>
      
      <image id="myFixedImage" {...props.fixed} clip-path="url(#myClip)" />
      <image id="myMovingImage" {...props.moving} clip-path="url(#myClip)" />

    
      https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path
      https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/clip-path
      https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath

*/
    }

    
      
      
    </svg>
    //</div>
  );
}
