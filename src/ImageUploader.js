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
//let id = 0;

// function toImageEntry(id, imageUrl, w, h) {
//   return {
//     id,
//     href: imageUrl,
//     x: 0,
//     y: 0,
//     width: w,
//     height: h,
//     opacity: 1,
//     scaling: 1,
//     rotation: 0,
//   };
// }

function computeNextId(stacks) {
  return stacks.map((x) => x.id + 1).reduce((a, b) => (a > b ? a : b), 0);
}

export function ImageUploader({
  stacks,
  setStacks,
  selectedImageId,
  setSelectedImageId,
}) {
  console.log("rerender", stacks.length, selectedImageId);

  function onDrop(acceptedFiles) {
    const imageEntries = [];
    const stackId = computeNextId(stacks);
    acceptedFiles.map((file) =>
      readImage(file, (imageUrl) =>
        getImageSize(imageUrl, ({ width, height }) => {
          const imageEntry = {
            stackId,
            id: file.name,
            width,
            height,
            imageUrl,
          };
          imageEntries.push(imageEntry);

          if (imageEntries.length == acceptedFiles.length) {
            console.log(imageEntries, width, height); //230821 check!

            if (
              !imageEntries.every((x) => x.width == width && x.heigth == height)
            ) {
              console.log(
                "some images differ in size => not all widths and heights of images of stack are the same"
              ); //230821 check!
            }

            const stack = {
              x: 0,
              y: 0,
              opacity: 1,
              scaling: 1,
              rotation: 0,
              id: stackId,
              imageEntries,
              width,
              height,
            };

            setStacks((stacks) => [...stacks, stack]);
          }
        })
      )
    );
  }

  return (
    <Card sx={{ minWidth: 250, maxHeight: 700, overflowY: "scroll" }}>
      <CardContent>
        <section>
          <Dropzone onDrop={onDrop}>
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
          {stacks.map((stack) => (
            <Card key={stack.id}>
              <img
                src={stack.imageEntries[0].imageUrl}
                style={{
                  width: 140,
                  border:
                    selectedImageId == stack.id && stack.id !== 0
                      ? "solid 10px coral"
                      : selectedImageId == stack.id && stack.id == 0
                      ? "solid 10px #321ab0"
                      : "none",
                }}
                onClick={() => setSelectedImageId(stack.id)}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              ></div>
              image ID = {stack.id}
              {stack.id == 0 ? " (fixed)" : " (moving)"}
              <ClearIcon
                onClick={() => {
                  setStacks((stacks) => {
                    // not the most efficient approach but ensures we delete the right item
                    // and create a new array
                    // using splice would mutate the same array and react will not notice it has changed
                    return stacks.filter((x) => x.id != stack.id);
                  });
                }}
              />
              <br />
              <br />
            </Card>
          ))}

          {/* <p>Drag 'n' drop some files here, or click to select files</p> */}
        </section>
      </CardContent>
    </Card>
  );
}
