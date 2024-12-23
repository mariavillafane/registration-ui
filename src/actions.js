import ImageJs from "image-js";

import { readImageAsBase64, svgToPng } from "./ImageTools";

export function download(url, name) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export const blobToBase64 = function (blobUrl) {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = blobUrl;
  })
    .then((img) => {
      // URL.revokeObjectURL(blobUrl);
      // Limit to 256x256px while preserving aspect ratio
      let [w, h] = [img.width, img.height];

      let canvas = document.createElement("canvas");
      console.log(canvas);
      canvas.width = w;
      canvas.height = h;
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      return canvas.toDataURL();
    })
    .catch(console.log);
};

export async function downloadCanvas() {
  await Promise.all(
    [...document.querySelectorAll(".myCanvas image")].map(async (img) => {
      img.href.baseVal = await blobToBase64(img.href.baseVal);
    })
  );

  const svgAsString = document.querySelector(".myCanvas svg").outerHTML; //this is a string representative of myCanvas
  const png = await svgToPng(svgAsString, 0, "white");
  const name = "canvas-" + new Date().toISOString().split("T")[0] + ".png";

  download(png, name);
}

export async function createSettingsDotJson(data) {
  const workingImages = await Promise.all(
    data.workingImages.map(async (workingImage) => ({
      ...workingImage,
      imageEntries: await Promise.all(
        workingImage.imageEntries.map(async (imageEntry) => ({
          base64:
            imageEntry.base64 || (await readImageAsBase64(imageEntry.file)),
          ...imageEntry,
        }))
      ),
    }))
  );
  console.log({
    ...data,
    imageFixed: workingImages[0],
    workingImages: workingImages.slice(1),
  });
  return JSON.stringify(
    {
      ...data,
      imageFixed: workingImages[0],
      workingImages: workingImages.slice(1),
    },
    null,
    2
  );
}

export async function downloadSettings(data) {
  const settingsJson = await createSettingsDotJson(data);

  const settings = window.URL.createObjectURL(
    new Blob([settingsJson], { type: "application/json" })
  );
  download(settings, "settings.json");
  window.URL.revokeObjectURL(settings); //delete object after creating it
}

export async function uploadSettingsToServer(data) {
  const settingsJson = await createSettingsDotJson(data);

  const response = await fetch("/api/start", {
    //"http://localhost:4000/start" => "/start"
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: new Blob([settingsJson], { type: "application/json" }), // body data type must match "Content-Type" header
  });

  const statusOfResult = await response.json();
  console.log(statusOfResult);
  return statusOfResult;
}

export async function loadSettings(oldWorkingImages, settingsUploadedByUser) {
  if (settingsUploadedByUser == null) return;

  const reader = new FileReader();
  const fileContent = await new Promise((done) => {
    reader.addEventListener("load", () => {
      done(reader.result);
    });
    reader.readAsText(settingsUploadedByUser);
  });

  const parsedSettings = JSON.parse(fileContent);

  const urlsToDelete = oldWorkingImages.flatMap((workingImage) =>
    workingImage.imageEntries.map((imageEntry) => imageEntry.imageUrl)
  );
  urlsToDelete.forEach((url) => {
    window.URL.revokeObjectURL(url); //take away the memory that is linked to urls (they are now empty pointers, just to have memory available for something else / 2 GB limit)
  });

  const workingImages = await Promise.all(
    [parsedSettings.imageFixed, ...parsedSettings.workingImages].map(
      async (workingImage) => ({
        ...workingImage,
        imageEntries: await Promise.all(
          workingImage.imageEntries.map(async (imageEntry) => {
            const image = await ImageJs.load(imageEntry.base64);
            return {
              ...imageEntry,
              imageUrl: await URL.createObjectURL(await image.toBlob()), //image drawn in browser, by default this converts to png - 230828
            };
          })
        ),
      })
    )
  );

  return {
    worldScale: parsedSettings.worldScale,
    workingImages,
  };
}
