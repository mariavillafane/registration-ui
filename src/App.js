import logo from './logo.svg';
import './App.css';

const fixedimage = {
  path: "/fixed-image.jpg",
  width: 3521
};

const movingimage = {
  path: "/moving-image-d02.jpg",
  width: 941
};

function RegistrationCanvas(props) {
  return (
    <div style={{position: "absolute"}}> 
      <img src={props.fixed.path} 
        style={{
          position: "absolute",
          left: "20px",//10,
          top: "20px", //10,
          width: props.fixed.width * 0.1
      }}/>

      <img src={props.moving.path} 
        style={{
          position: "absolute",
          left: "100px",
          top: "100px",
          width: props.moving.width * 0.1,
          opacity: 0.5
      }}/>
    </div>
  )
}

function App() {
  return (
    <div className="App">
      <h1 style={{
        marginLeft: "3em"
      }}> CANVAS</h1>
       
      <RegistrationCanvas fixed={fixedimage} moving={movingimage} />

    </div>
  );
}

export default App;
