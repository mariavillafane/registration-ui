import { useEffect, useState } from "react";

export function useJsonReader(initialPath, method = "readAsDataURL") {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageAsDataURL, setImageAsDataURL] = useState(initialPath);
  useEffect(() => {
    if (!selectedFile) {
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageAsDataURL(reader.result);
    });
    reader[method](selectedFile); //reader.readAsDataURL(selectedFile);
  }, [selectedFile]);
  return [imageAsDataURL, setSelectedFile];
}

export function readImageAsBase64(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onerror = () => reject("error reading file");
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file); //this line is reading the file as Base64 - 230828
  });
}

export function svgToPng(svgText, margin, fill) {
  // convert an svg text to png using the browser
  return new Promise(function (resolve, reject) {
    try {
      // can use the domUrl function from the browser
      var domUrl = window.URL || window.webkitURL || window;
      if (!domUrl) {
        throw new Error("(browser doesnt support this)");
      }

      // figure out the height and width from svg text
      var match = svgText.match(/height=\"(\d+)/m);
      var height = match && match[1] ? parseInt(match[1], 10) : 200;
      var match = svgText.match(/width=\"(\d+)/m);
      var width = match && match[1] ? parseInt(match[1], 10) : 200;
      margin = margin || 0;

      // it needs a namespace
      if (!svgText.match(/xmlns=\"/im)) {
        svgText = svgText.replace(
          "<svg ",
          '<svg xmlns="http://www.w3.org/2000/svg" '
        );
      }

      // create a canvas element to pass through
      var canvas = document.createElement("canvas");
      canvas.width = width + margin * 1.2;
      canvas.height = height + margin * 1.2;
      var ctx = canvas.getContext("2d");

      // make a blob from the svg
      console.log(svgText);
      var svg = new Blob([svgText], {
        type: "image/svg+xml;charset=utf-8",
      });

      // create a dom object for that image
      var url = domUrl.createObjectURL(svg);

      // create a new image to hold it the converted type
      var img = new Image();

      // when the image is loaded we can get it as base64 url
      img.onload = function () {
        // draw it to the canvas
        ctx.drawImage(this, margin, margin);

        // if it needs some styling, we need a new canvas
        if (fill) {
          var styled = document.createElement("canvas");
          styled.width = canvas.width;
          styled.height = canvas.height;
          var styledCtx = styled.getContext("2d");
          styledCtx.save();
          styledCtx.fillStyle = fill;
          styledCtx.fillRect(0, 0, canvas.width, canvas.height);
          styledCtx.strokeRect(0, 0, canvas.width, canvas.height);
          styledCtx.restore();
          styledCtx.drawImage(canvas, 0, 0);
          canvas = styled;
        }
        // we don't need the original any more
        domUrl.revokeObjectURL(url);
        // now we can resolve the promise, passing the base64 url
        resolve(canvas.toDataURL());
      };

      // load the image
      img.src = url;
    } catch (err) {
      reject("failed to convert svg to png " + err);
    }
  });
}
