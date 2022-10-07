import { useState, useRef } from "react";

function calculateViewBoxChange(event, viewBox, ref) {
  //console.log(event);
  //console.log(event.target.getBoundingClientRect());

  const mouseX = -event.target.getBoundingClientRect().x + event.clientX;
  console.log(mouseX);

  const mouseY = -event.target.getBoundingClientRect().y + event.clientY;
  //console.log(mouseY);

  const canvasWidth = +ref.current.clientWidth;
  const canvasHeight = +ref.current.clientHeight;
  // const canvasWidth = event.target.getBoundingClientRect().width
  // const canvasHeight = event.target.getBoundingClientRect().height
  console.log(ref.current);
  console.log(canvasWidth, canvasHeight);
  console.log(mouseX / canvasWidth);

  const mouseScroll = event.deltaY > 0 ? 1 : -1; //if event bigger than 0, then 1, else -1
  console.log(mouseScroll);
  /*
  const newViewBox = [
    viewBox[0] - (1 * mouseScroll),
    viewBox[1] - (1 * mouseScroll),
    viewBox[2] + (2 * mouseScroll),
    viewBox[3] + (2 * mouseScroll),
  ];
*/
  //PROBLEMS (221006 => the client seems to be the image at the back of the mouse (either the moving, the fixed or the canvas,))
  // hence the canvasWidth and canvasHeight changes depending on where the mouse is located
  //also, re-sizing the canvas (red-square) seems to disarrange the
  // fixed & moving images (they dont stay at the (0,0) cords of red-square)

  const newViewBox = [
    viewBox[0] - 1 * mouseScroll * (mouseX / canvasWidth),
    viewBox[1] - 1 * mouseScroll * (mouseY / canvasHeight),
    viewBox[2] + 2 * mouseScroll * ((-mouseX+canvasWidth) / canvasWidth),
    viewBox[3] + 2 * mouseScroll * ((-mouseY+canvasHeight) / canvasHeight),
  ];

  //  const newViewBox = [0, 0, viewBox[2] + 1 * mouseScroll, viewBox[3] + 1 * mouseScroll ];
  // problem is that viewBox size changes when zoom takes place (mouseScroll), but not refreshing values when changing the canvas size from screen/web 

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
    <div id="myMask">
      <svg
        ref={ref}
        id="myCanvas"
        //xmlns="http://www.w3.org/2000/svg"

        onWheel={(event) =>
          setViewBox(calculateViewBoxChange(event, viewBox, ref))
        }
        viewBox={viewBox.join(" ")}
        //viewBox={`0 0 200 200`}   //ZOOM
        preserveAspectRatio="xMinYMin meet"    //"none"//xMinYMin slice" //https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox

        style={{
          width: props.canvas_X + "px", //props.fixed.width * 0.15,  // dim canvas //LOOK HERE 221007
          height: props.canvas_Y + "px", //"500px",                  // dim canvas
        }}
        
        //width= {props.canvas_X}
        //height= {props.canvas_Y} 
      >
        <image id="myFixedImage" {...props.fixed}/>
        <image id="myMovingImage" {...props.moving}/>
      
      </svg>
    </div>
  );
}
