import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

const fixedimage = {
  path: "/fixed-image.jpg",
  width: 3521
};

const movingimage = {
  path: "/moving-image-d02.jpg",
  width: 941
};

function RegistrationCanvas(props) {
  console.log(props.moving_X);
  return (

    <div style={{
      width: props.fixed.width * 0.15,  // dim canvas
      height: "500px",                  // dim canvas
      border: "1px solid red"           //canvas
    }}>

      <div style={{position: "absolute"}}> 

        <img src={props.fixed.path} 
          style={{
            position: "absolute",   //FIXED IMAGE
            left: props.fixed_X +"px",           //x-position inside canvas,"20px"
            top: props.fixed_Y +"px",            //y-position inside canvas,"20px"
            width: props.fixed.width * 0.1
        }}/>

        <img src={props.moving.path} 
          style={{
            position: "absolute",       //MOVING IMAGE
            left: props.moving_X +"px", //"100px",
            top: props.moving_Y+"px", 
            width: props.moving.width * 0.1 + 0 + "px",
            opacity: props.opacity_Moving //0.5
        }}/>

      </div>
    </div>
  )
}

function App() {
  const [movingX, setMovingX] = useState(0);
  const [movingY, setMovingY] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [fixedX, setFixedX] = useState(0);
  const [fixedY, setFixedY] = useState(0);


  return (
    <div className="App">
      <h1 style={{
        marginLeft: "3em"
      }}> CANVAS</h1>
       
      <div style={{
        display: "flex",
        flexDirection: "row"
      }}>

        {// RegistrationCanvas + PROPS (fixed, moving, moving_X, moving_Y)
        // input = box for values, with type=number to limit input to numbers
        // onChange gets called everytime the value changes, and calls the provided function (event)

        }

        <RegistrationCanvas fixed={fixedimage} moving={movingimage} moving_X={movingX} moving_Y={movingY} opacity_Moving={opacity} fixed_X={fixedX} fixed_Y={fixedY} />
      
        <div style={{
          display:"flex",
          flexDirection: "column"
        }}>
          <div>
            x-moving: <input value={movingX} type="number" onChange={event=>setMovingX(event.target.value)} />
          </div>

          <div>
            y-moving: <input value={movingY} type="number" onChange={event=>setMovingY(event.target.value)} />
          </div>

          <div>
            opacity-moving: <input value={opacity} type="range" min={0} max={1} step={0.1} onChange={event=>setOpacity(event.target.value)} />
          </div>

          <div>
            x-fixed: <input value={fixedX} type="number" onChange={event=>setFixedX(event.target.value)} />
          </div>

          <div>
            y-fixed: <input value={fixedY} type="number" onChange={event=>setFixedY(event.target.value)} />
          </div>


        </div>
      </div>
    </div>
  );
}

export default App;
