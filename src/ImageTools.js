import { useEffect, useState } from "react";
import { Canvg } from "canvg";
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

export async function svgToPng(svgText, margin) {
  // convert an svg text to png using the browser
  // can use the domUrl function from the browser
  const domUrl = window.URL || window.webkitURL || window;
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
  const canvas = document.createElement("canvas");
  canvas.width = width + margin * 1.2;
  canvas.height = height + margin * 1.2;
  const ctx = canvas.getContext("2d");

  // make a blob from the svg
  const svg = new Blob([svgText], {
    type: "image/svg+xml;charset=utf-8",
  });

  const v = Canvg.fromString(ctx, svgText);
  await v.render();
  return canvas.toDataURL();
}
