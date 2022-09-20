export function RegistrationCanvas(props) {
  //console.log(props.moving_X);
  return (
    <div id="myMask">
      <svg
        id="myCanvas"
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
