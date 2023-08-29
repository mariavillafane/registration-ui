import React from "react";
import Dropzone from "react-dropzone";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import VisibilitySharpIcon from "@mui/icons-material/VisibilitySharp";
import VisibilityOffSharpIcon from "@mui/icons-material/VisibilityOffSharp";
import { readImageAsBase64 } from "./ImageTools";
import { useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import { Checkbox, Paper } from "@mui/material";
import Image from "image-js";

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

  async function onDrop2(acceptedFiles) {
    const stackId = computeNextId(stacks);
    const imageEntries = await Promise.all(
      acceptedFiles.map(async (file) => {
        const buf = await file.arrayBuffer();
        const image = await Image.load(buf);
        return {
          stackId,
          id: file.name,
          width: image.width,
          height: image.height,
          base64: await readImageAsBase64(file),
          imageUrl: await URL.createObjectURL(await image.toBlob()), //image drawn in browser, by default this converts to png - 230828
          checked: true,
        };
      })
    );

    const { width, height } = imageEntries[0];
    if (!imageEntries.every((x) => x.width == width && x.height == height)) {
      console.log(
        "some images differ in size => not all widths and heights of images of stack are the same"
      );
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

  async function onDropImageToStack(stack, index, acceptedFiles) {
    const imageEntries = await Promise.all(
      acceptedFiles.map(async (file) => {
        const buf = await file.arrayBuffer();
        const image = await Image.load(buf);
        return {
          stackId: stack.id,
          id: file.name,
          width: image.width,
          height: image.height,
          base64: await readImageAsBase64(file),
          imageUrl: await URL.createObjectURL(await image.toBlob()), //image drawn in browser, by defult this converts to png - 230828
          checked: true,
        };
      })
    );

    const { width, height } = imageEntries[0];
    if (imageEntries.length == acceptedFiles.length) {
      if (!imageEntries.every((x) => x.width == width && x.height == height)) {
        console.log(
          "some images differ in size => not all widths and heights of images of stack are the same"
        );
      }

      const stackWithMoreImages = {
        ...stack,
        imageEntries: [...stack.imageEntries, ...imageEntries],
      };

      setStacks((stacks) => [
        ...stacks.slice(0, index),
        stackWithMoreImages,
        ...stacks.slice(index + 1, stacks.length),
      ]);
    }
  }

  return (
    <Card
      sx={{
        minWidth: 200,
        maxWidth: 800,
        maxHeight: 800,
        overflowY: "scroll",
        overflowX: "scroll",
        display: "flex",
      }}
    >
      <CardContent>
        <section>
          <Dropzone onDrop={onDrop2}>
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

          {stacks.map((stack, index) => (
            <Paper
              key={index}
              style={{
                display: "flex",
                flexDirection: "row",
                padding: ".6em",
                margin: ".6em",
                gap: ".3em",
                backgroundColor: "lightgray",
              }}
            >
              {stack.imageEntries.map((imageEntry, entryIndex) => (
                <Card key={imageEntry.id}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <img
                      src={imageEntry.imageUrl}
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

                    {index == 0 ? (
                      <>
                        <span> stack ID = {stack.id} </span>
                        <span> image ID = {imageEntry.id} (fixed image) </span>
                      </>
                    ) : (
                      <>
                        <span> stack ID = {stack.id} </span>
                        <span> image ID = {imageEntry.id} (moving) </span>
                      </>
                    )}

                    <ClearIcon
                      onClick={() => {
                        const newEntries = stack.imageEntries.filter(
                          //newEntries are all the entries remaining (the ones not-deleted)
                          (x) => x.id != imageEntry.id
                        );

                        if (newEntries.length == 0) {
                          setStacks([
                            ...stacks.slice(0, index),
                            ...stacks.slice(index + 1, stack.length),
                          ]);
                        } else {
                          const newStack = {
                            ...stack,
                            imageEntries: newEntries,
                          };
                          setStacks([
                            ...stacks.slice(0, index),
                            newStack,
                            ...stacks.slice(index + 1, stack.length),
                          ]);
                        }
                      }}
                    />

                    <Checkbox
                      checked={imageEntry.checked}
                      icon={<VisibilityOffSharpIcon />}
                      checkedIcon={<VisibilitySharpIcon color="primary" />}
                      onChange={(event) => {
                        const newEntry = {
                          ...imageEntry,
                          checked: event.target.checked,
                        };
                        const newEntries = [
                          ...stack.imageEntries.slice(0, entryIndex),
                          newEntry,
                          ...stack.imageEntries.slice(
                            entryIndex + 1,
                            stack.imageEntries.length
                          ),
                        ];
                        const newStack = {
                          ...stack,
                          imageEntries: newEntries,
                        };
                        setStacks([
                          ...stacks.slice(0, index),
                          newStack,
                          ...stacks.slice(index + 1, stacks.length),
                        ]);
                      }}
                    />
                  </div>
                  <br />
                  <br />
                </Card>
              ))}

              {index != 0 ? (
                <Dropzone
                  onDrop={(acceptedFiles) =>
                    onDropImageToStack(stack, index, acceptedFiles)
                  }
                >
                  {({ getRootProps, getInputProps }) => (
                    <Button
                      {...getRootProps()}
                      color="primary"
                      sx={{ maxWidth: 25 }}
                      variant="outlined"
                    >
                      Add image to stack
                      <input
                        {...getInputProps()}
                        accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
                      />
                    </Button>
                  )}
                </Dropzone>
              ) : null}
            </Paper>
          ))}
        </section>
      </CardContent>
    </Card>
  );
}
