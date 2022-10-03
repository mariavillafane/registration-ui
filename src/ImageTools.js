import { useEffect, useState } from "react";

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

//prepare images for canvas - for moving img, note that scale = worldScale*imageScale
export function useImage(href, scale) {
  const img = useImageSize(href); // {width, height}
  const [dictionary, setDictionary] = useState({
    x: 0,
    y: 0,
    opacity: 1,
  });
  return [
    {
      href,
      x: dictionary.x,
      y: dictionary.y,
      width: img.width * scale,
      height: img.height * scale,
      opacity: dictionary.opacity,
    },
    setDictionary,
  ];
}

//useSate creates a first object and a modifier for that first object, AND re-runs the function where it is located (its parent function)

// setDictionary({
// ...dictionary,
// opacity: dictionary.opacity
//})

export function useImageReader(initialPath) {
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
    reader.readAsDataURL(selectedFile);
  }, [selectedFile]);

  return [imageAsDataURL, setSelectedFile];
}

export function saveSettingsSoFar(movingScale) {
  var a = document.createElement("a");
  a.href = window.URL.createObjectURL(
    new Blob(["SETTINGS, for example movingScale= " + movingScale], {
      type: "text/plain",
    })
  );
  a.download = "settingsSoFar.txt";
  a.click();
}
