import React from "react";
import Dropzone from "react-dropzone";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { readImage, getImageSize } from "./ImageTools";
import { useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";

// we use this to generate an unique id, so we can find images by id
// using href only works if you never upload the same image
let id = 0;
function toImageEntry(imageUrl, w, h) {
  return {
    id: id++,
    href: imageUrl,
    x: 0,
    y: 0,
    width: w,
    height: h,
    opacity: 1,
    scaling: 1,
  };
}

export function ImageUploader({
  images,
  setImages,
  selectedImageId,
  setSelectedImageId,
}) {
  //images, setImages
  //const [images, setImages] = useState([]);
  console.log("rerender", images.length, selectedImageId);

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        {/* <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}> */}

        <section>
          <Dropzone
            onDrop={(acceptedFiles) =>
              acceptedFiles.map((file) =>
                readImage(file, (imageUrl) =>
                  getImageSize(
                    imageUrl,
                    (
                      { width, height } //the onComplete (of ImageSize)takes arguments "width" and "height"
                    ) =>
                      setImages((uploadedImages) => [
                        ...uploadedImages,
                        toImageEntry(imageUrl, width, height),
                      ])
                  )
                )
              )
            }
          >
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Typography
                  sx={{ fontSize: 14 }}
                  color="text.secondary"
                  backgroundColor="#eeeeee"
                  gutterBottom
                >
                  Upload Working Images
                </Typography>
              </div>
            )}
          </Dropzone>
          {images.map(
            (
              image // we can't rely in index since it will refer to the wrong entry as soon as one deletes an entry
            ) => (
              <Card key={image.id}>
                <img
                  src={image.href}
                  style={{
                    width: 140,
                    border:
                      selectedImageId == image.id && image.id !== 0
                        ? "solid 10px coral"
                        : selectedImageId == image.id && image.id == 0
                        ? "solid 10px #321ab0"
                        : "none", // OK!!
                    //selectedImageId == image.id && image.id !== 0? "solid 10px coral" : "none",
                  }}
                  onClick={() => setSelectedImageId(image.id)}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                ></div>
                image ID = {image.id}
                {image.id == 0 ? " (fixed)" : " (moving)"}
                <ClearIcon
                  onClick={() => {
                    setImages((uploadedImages) => {
                      // not the most efficient approach but ensures we delete the right item
                      // and create a new array
                      // using splice would mutate the same array and react will not notice it has changed
                      return uploadedImages.filter((x) => x.id != image.id);
                    });
                  }}
                />
                <br />
                <br />
              </Card>
            )
          )}

          {/* <p>Drag 'n' drop some files here, or click to select files</p> */}
        </section>
      </CardContent>
    </Card>
  );
}
