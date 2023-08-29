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
