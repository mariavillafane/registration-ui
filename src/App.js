import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
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
  console.log(props.moving_X);
  return (
    <div id="myMask">
      <svg id="myCanvas" style={{
        width: props.canvas_X+"px",              //props.fixed.width * 0.15,  // dim canvas
        height:  props.canvas_Y+"px",           //"500px",                  // dim canvas
      }}>
          <image id="myFixedImage" href={props.fixed.path} 
            width = {props.fixed_width * props.world_Scale} 
            height = {props.fixed_height * props.world_Scale} 
            x = {props.fixed_X}           //x-position inside canvas,"20px"
            y = {props.fixed_Y}            //y-position inside canvas,"20px"
          />  
          <image id="myMovingImage" href={props.moving.path} 
            x = {props.moving_X} //"100px",
            y = {props.moving_Y} 
            width = {props.moving_width * props.world_Scale * props.moving_Scale}
            height = {props.moving_height * props.world_Scale * props.moving_Scale}
            style={{
              opacity: props.opacity_Moving //0.5
            }}
          />
      </svg>
    </div>
  )
}

function App() {
  const [canvasX, setCanvasX] = useState(500);
  const [canvasY, setCanvasY] = useState(500);
  const [worldScale, setWorldScale] = useState(0.1); 

  const [fixedX, setFixedX] = useState(0);
  const [fixedY, setFixedY] = useState(0);
  const [movingX, setMovingX] = useState(220); //0
  const [movingY, setMovingY] = useState(143); //0
  const [movingScale, setMovingScale] = useState(1); //0
  const [opacity, setOpacity] = useState(1);

  const [imageRefFixed, setImageRefFixed] = useState(null);
  const [imageRefMoving, setImageRefMoving] = useState(null);
  
  return (
    <div className="App">
      <h1 style={{
        marginLeft: "40px", //"0em"
        color: "grey",
        fontSize: "40px",
        //fontFamily: "Lucida Console, Courier New, monospace",
        //lineHeight: "40px",
        marginBottom: "-8px",
      }}>image registration<br/>CANVAS</h1>    

      <div style={{
        display: "flex",
        flexDirection: "row"
      }}>

        {// RegistrationCanvas + PROPS (fixed, moving, moving_X, moving_Y)
        // input = box for values, with type=number to limit input to numbers
        // onChange gets called everytime the value changes, and calls the provided function (event)
        }

        <img src={fixedimage.path} onLoad={event=>setImageRefFixed(event.target)} style={{display:"none"}} />
        <img src={movingimage.path} onLoad={event=>setImageRefMoving(event.target)} style={{display:"none"}}/>

        <RegistrationCanvas 
          fixed = {fixedimage}         
          moving = {movingimage}

          fixed_width = {imageRefFixed?.naturalWidth}
          fixed_height = {imageRefFixed?.naturalHeight}

          moving_width = {imageRefMoving?.naturalWidth}
          moving_height = {imageRefMoving?.naturalHeight}
          
          canvas_X={canvasX} 
          canvas_Y={canvasY} 
          world_Scale={worldScale}         
          fixed_X={fixedX} 
          fixed_Y={fixedY}        
          moving_X={movingX} 
          moving_Y={movingY} 
          moving_Scale={movingScale} 
          opacity_Moving={opacity}         
          imageRef_Fixed = {imageRefFixed} setImageRef_Fixed = {setImageRefFixed} 
          imageRef_Moving = {imageRefMoving} setImageRef_Moving ={setImageRefMoving}
        />

        <div style={{
          display:"flex",
          flexDirection: "column",
          marginLeft: "20px" 
        }}>
          <div>
          {/*<br/> <br/> <br/><br/> <br/><br/> <br/><br/> <br/><br/> <br/><br/> <br/><br/> <br/><br/> <br/><br/> <br/><br/> <br/><br/><br/> <br/> */}         
          virtual-canvas (bigger than "scaled" Fixed image)
          </div>

          <div>
          size_x: <input value={canvasX} type="number" onChange={event=>setCanvasX(event.target.value)} />
          </div>

          <div>
          size_y: <input value={canvasY} type="number" onChange={event=>setCanvasY(event.target.value)} />
          </div>

          <div>
          world-scale (affects both working images): <input value={worldScale} type="number" min={0.1} max={1.2} step={0.01} onChange={event=>setWorldScale(event.target.value)} />
          </div>

          <div>
          <br/>
          fixed-image
          </div>

          <div>
          coord_x: <input value={fixedX} type="number" onChange={event=>setFixedX(event.target.value)} />
          </div>

          <div>
          coord_y: <input value={fixedY} type="number" onChange={event=>setFixedY(event.target.value)} />
          </div>
          <div>
            image dimensions (original): {imageRefFixed?.naturalWidth} x {imageRefFixed?.naturalHeight}{" "} 
            <br/>
            image dimensions (scaled by {worldScale}): {(imageRefFixed?.naturalWidth * worldScale).toFixed(0)} x {(imageRefFixed?.naturalHeight * worldScale).toFixed(0)}{" "} 
          </div>

          <div>
          <br/>
          moving-image
          </div>

          <div>          
          coord_x: <input value={movingX} type="number" onChange={event=>setMovingX(event.target.value)} />
          </div>

          <div>
          coord_y: <input value={movingY} type="number" onChange={event=>setMovingY(event.target.value)} />
          </div>         

          <div>
            scaling (only affects moving image, as initial parameter): <input value={movingScale} type="number" min={0.8} max={1.2} step={0.01} onChange={event=>setMovingScale(event.target.value)} />
          </div>          

          <div>
            opacity: <input value={opacity} type="range" min={0} max={1} step={0.1} onChange={event=>setOpacity(event.target.value)} />
          </div>

          <div>
            image dimensions (original): {imageRefMoving?.naturalWidth} x {imageRefMoving?.naturalHeight}{" "} 
            <br/>
            image dimensions (scaled by {worldScale}, and by {movingScale}): {(imageRefMoving?.naturalWidth * movingScale * worldScale).toFixed(0)} x {(imageRefMoving?.naturalHeight * movingScale * worldScale).toFixed(0)}{" "} 
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