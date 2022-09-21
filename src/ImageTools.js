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

//useSate creates a first object and a modifier for that first object

// setDictionary({
// ...dictionary,
// opacity: dictionary.opacity
//})