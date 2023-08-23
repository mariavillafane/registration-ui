import { useEffect, useState } from "react";
import {
  ChannelOrder,
  decodeTiff,
  encodeJpg,
  encodePng,
} from "image-in-browser";

export function getImageSize(imageUrl, onComplete) {
  const image = new Image();
  image.onload = () =>
    //future loaded image
    onComplete({
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
  image.src = imageUrl; //start loading the image, after it has been stated to get natural width and height of the (future) loaded image
}

export function useImageSize(path) {
  const [size, setSize] = useState({
    height: 0,
    width: 0,
  });

  useEffect(() => {
    const image = new Image();
    image.onload = () =>
      setSize({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    image.src = path;
  }, [path]); //useEffect(()=>{ .. }); ..}, [path]); only runs if the path changes

  return size;
}

//useImageReader = not only for images, but for all type of data
export function useImageReader(initialPath, method = "readAsDataURL") {
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

//readImage = takes a file and a function,
//readImage = only for images, calls function "onComplete (as placeholder for lambda or anyotherfunction" with images when complete
export function readImage(file, onComplete, method = "readAsDataURL") {
  const reader = new FileReader();

  console.log(file.type);
  if (file.type == "image/tiff") {
    reader.addEventListener("load", () => {
      const imageAsArray = new Uint8Array(reader.result); //Uint8Array
      const memoryImage = decodeTiff({ data: imageAsArray });

      console.log(memoryImage.numChannels);
      if (memoryImage.numChannels == 1) {
        console.log("hola");
        memoryImage.remapChannels(ChannelOrder.grayAlpha); //(ChannelOrder.bgr) //(ChannelOrder.red)
        console.log(memoryImage.numChannels);
      }

      window.memoryImage = memoryImage;

      const pngImageForBrowser = encodePng({ image: memoryImage });
      const blob = new Blob([pngImageForBrowser], { type: "image/png" });

      const url = URL.createObjectURL(blob);
      onComplete(url);
    });
    reader.readAsArrayBuffer(file);
    return;
  }

  reader.addEventListener("load", () => {
    onComplete(reader.result);
  });
  reader[method](file); //reader.readAsDataURL(selectedFile);
}
