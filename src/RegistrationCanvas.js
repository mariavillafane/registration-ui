import { useState, useRef } from "react";

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

// //<p id="demo"></p>
// function numbersOnGrid(){
//   //let text = "";
//   for (let i = 0; i < 3; i=i+100) {
//     <text x={-2+i} y={-2} font-size="25em" fill="blck">
//     {" "}
//     (i,0){" "}
//   </text>
//   }
// }

// //document.getElementsBId("demo").innerHTML = text  //GAETANO 221012

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

  return (
    <div>
      <div>
        zoomPower:{" "}
        <input
          value={zoomPower}
          type="range"
          min={0}
          max={1}
          step={0.1}
          onChange={(event) => setZoomPower(event.target.value)}
        />
      </div>

      <svg
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
          width: "600px",
          height: "600px", // pixels on the screen
        }}
      >
        <image id="myFixedImage" {...props.fixed} />
        <image id="myMovingImage" {...props.moving} />
        <rect                                              //https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath
          id="myWorkSpace"
          x={0}
          y={0}
          width={props.canvas_X}
          height={props.canvas_Y}
          fill="none"
          stroke="green"
        />


        <text x={-2} y={-2} font-size="0.25em" fill="blck">
          {" "}
          (0,0){" "}
        </text>
        <text x={-2+100} y={-2} font-size="0.25em" fill="blck">
          {" "}
          (100,0){" "}
        </text>
        <text x={-2+200} y={-2} font-size="0.25em" fill="blck">
          {" "}
          (200,0){" "}
        </text>
        <text x={-2+300} y={-2} font-size="0.25em" fill="blck">
          {" "}
          (300,0){" "}
        </text>


        <text x={-2} y={-2} font-size="0.25em" fill="blck">
          {" "}
          (0,0){" "}
        </text>
        <text x={-15} y={-0+100} font-size="0.25em" fill="blck">
          {" "}
          (0,100){" "}
        </text>
        <text x={-15} y={-0+200} font-size="0.25em" fill="blck">
          {" "}
          (0,200){" "}
        </text>
        <text x={-15} y={-0+300} font-size="0.25em" fill="blck">
          {" "}
          (0,300){" "}
        </text>


        {/* <text {...numbersOnGrid()}></text>     //GAETANO 221012 */ } 

        
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
              stroke-opacity="0.67"
              stroke-width="0.5"
            />
            <line
              x1="0"
              y1="0"
              x2="10"
              y2="0"
              stroke="grey"
              stroke-opacity="0.5"
              stroke-width="0.5"
            />
            {/* <polygon points="0,0 2,5 0,10 5,8 10,10 8,5 10,0 5,2" /> */}
          </pattern>
        </defs>

        {/*}
    <g transform="scale(1) rotate(0) translate(0 0) skewX(0) skewY(0)" transform-origin="711 400">
      <rect width="2844" height="1600" x="-711" y="-400" fill="url(#rrreplicate-pattern1)"/>
      <rect width="2844" height="1600" x="-711" y="-400" fill="url(#rrreplicate-pattern2)"/>
      <rect width="2844" height="1600" x="-711" y="-400" fill="url(#rrreplicate-pattern3)"/></g>
      
      <defs xmlns="http://www.w3.org/2000/svg"><pattern id="rrreplicate-pattern1" width="260" height="260" patternUnits="userSpaceOnUse" patternTransform="rotate(30)" stroke-width="4" fill="none" stroke="#7c8cce" stroke-opacity="0.48">
      <line x1="18.571428571428573" y1="0" x2="18.571428571428573" y2="260"/><line x1="55.71428571428572" y1="0" x2="55.71428571428572" y2="260"/><line x1="92.85714285714286" y1="0" x2="92.85714285714286" y2="260"/><line x1="130.00000000000003" y1="0" x2="130.00000000000003" y2="260"/><line x1="167.14285714285717" y1="0" x2="167.14285714285717" y2="260"/><line x1="204.2857142857143" y1="0" x2="204.2857142857143" y2="260"/><line x1="241.42857142857147" y1="0" x2="241.42857142857147" y2="260"/>
      </pattern><pattern id="rrreplicate-pattern2" width="260" height="260" patternUnits="userSpaceOnUse" patternTransform="rotate(30)" stroke-opacity="0.67" stroke-width="2.2" fill="none" stroke="#238968">
      <line x1="65" y1="0" x2="65" y2="260"/><line x1="195" y1="0" x2="195" y2="260"/>
      </pattern><pattern id="rrreplicate-pattern3" width="260" height="260" patternUnits="userSpaceOnUse" patternTransform="rotate(115)" stroke-opacity="1" stroke-width="1.2" fill="none" stroke="#ffcb00">
      <line x1="32.5" y1="0" x2="32.5" y2="260"/><line x1="97.5" y1="0" x2="97.5" y2="260"/><line x1="162.5" y1="0" x2="162.5" y2="260"/><line x1="227.5" y1="0" x2="227.5" y2="260"/>
      </pattern></defs>
      */}

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

*/}
      </svg>
    </div>
  );
}
