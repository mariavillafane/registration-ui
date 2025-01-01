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
import {
  Alert,
  Box,
  Checkbox,
  Chip,
  LinearProgress,
  Paper,
  Snackbar,
  Tooltip,
} from "@mui/material";
import Image from "image-js";
import ReplayIcon from "@mui/icons-material/Replay"; //rotation
import LocationOnIcon from "@mui/icons-material/LocationOn"; //position
import PhotoSizeSelectLargeIcon from "@mui/icons-material/PhotoSizeSelectLarge"; //scaling
import PhotoSizeSelectActualIcon from "@mui/icons-material/PhotoSizeSelectActual"; //size
import { uploadImage } from "./actions";

function computeNextId(stacks) {
  return stacks.map((x) => x.id + 1).reduce((a, b) => (a > b ? a : b), 0);
}

let counter = 0;

function makefilename(file, stackId) {
  const filename = file.name.split(".");
  console.log(filename);
  const filename_ok = filename.slice(0, -1);
  const filename_ok_joined = filename_ok.join("."); //all the parts of the filename now concatenated, still missing the extension (-1)
  const filename_ok_joined_ok = `${stackId}-${filename_ok_joined}_${counter++}.${filename.at(
    -1
  )}`; //here putting again the extension with . (ie .jpg)
  return filename_ok_joined_ok;
}

export function ImageUploader({
  projectId,
  stacks,
  setStacks,
  selectedImageId,
  setSelectedImageId,
}) {
  const [uploads, setUploads] = useState([0, 0]);
  console.log("rerender", stacks.length, selectedImageId);

  async function onDrop2(acceptedFiles) {
    const stackId = computeNextId(stacks);
    const imageEntries = await Promise.all(
      acceptedFiles.map(async (file, i, all) => {
        setUploads([i, all.length]);
        const data = await uploadImage(projectId, file);
        setUploads([i + 1, all.length]);
        console.log(data);

        return {
          stackId,
          id: makefilename(file, stackId), //`${stackId}-${counter++}-${file.name}`,
          ...data.metadata,
          file: {
            name: file.name,
            lastModified: file.lastModified,
            relativePath: file.webkitRelativePath,
          },
          path: data.path,
          imageUrl: data.webUrl, //image drawn in browser, by default this converts to png - 230828
          thumbnailUrl: data.smallUrl,
          galleryUrl: data.mediumUrl,
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

  async function onDropImageToStack(
    stack,
    index,
    acceptedFiles,
    allowMultiple = true
  ) {
    const imageEntries = await Promise.all(
      (allowMultiple ? acceptedFiles : acceptedFiles.slice(0, 1)).map(
        async (file, i, all) => {
          setUploads([i, all.length]);
          const data = await uploadImage(projectId, file);
          setUploads([i + 1, all.length]);
          return {
            stackId: stack.id,
            id: makefilename(file, stack.id), //`${stack.id}-${filename_ok_joined}_${counter++}.${filename.at(-1)}`,
            ...data.metadata,
            path: data.path,
            //base64: await readImageAsBase64(file),
            imageUrl: data.webUrl, //await URL.createObjectURL(await image.toBlob()), //image drawn in browser, by defult this converts to png - 230828
            thumbnailUrl: data.smallUrl, //await URL.createObjectURL(await image.toBlob()), //image drawn in browser, by
            galleryUrl: data.mediumUrl,
            checked: true,
          };
        }
      )
    );

    const { width, height } = imageEntries[0];
    if (!imageEntries.every((x) => x.width == width && x.height == height)) {
      console.log(
        "some images differ in size => not all widths and heights of images of stack are the same"
      );
    }

    if (allowMultiple) {
      setStacks((stacks) =>
        stacks.with(index, {
          ...stack,
          imageEntries: [...stack.imageEntries, ...imageEntries], //stackWithMoreImages
        })
      );
    } else {
      setStacks((stacks) =>
        stacks.with(index, {
          ...stack,
          width,
          height,
          imageEntries,
        })
      );
    }
  }

  //console.log(stacks);
  return (
    <Box
      sx={{
        minWidth: 300, //200
        height: "800px",
        grow: 1,
        overflowY: "scroll",
        overflowX: "scroll",
        display: "flex",
      }}
    >
      <Snackbar
        autoHideDuration={5000}
        open={uploads[1] > 0 && uploads[0] < uploads[1]}
      >
        <Alert severity="info">
          Uploading {uploads[0]} / {uploads[1]} <LinearProgress />{" "}
        </Alert>
      </Snackbar>
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
                flexDirection: "column",
                padding: ".6em",
                margin: ".6em",
                gap: ".3em",
                backgroundColor: "lightgray",
                border:
                  selectedImageId == stack.id && stack.id !== 0
                    ? "solid 3px coral"
                    : selectedImageId == stack.id && stack.id == 0
                    ? "solid 3px #321ab0"
                    : "solid 3px transparent",
              }}
            >
              <Box display="flex" flexDirection={"row"} gap="0.3em">
                {stack.imageEntries.map((imageEntry, entryIndex) => (
                  <Card key={imageEntry.id}>
                    <Box
                      display="flex"
                      flexDirection="row"
                      position="relative"
                      overflow="hidden"
                      sx={{
                        "& > .controls": {
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          right: "-1em",
                          width: 0,
                          background: "rgba(200,200,200,0.6)",
                          transition: "all 0.2s",
                        },
                        "&:hover > .controls": { right: 0, width: "2em" },
                      }}
                    >
                      <Box display="flex" flexDirection={"column"}>
                        <img
                          width="100px"
                          src={imageEntry.thumbnailUrl}
                          onClick={() => setSelectedImageId(stack.id)}
                        />
                        <Typography fontSize={"0.5rem"}>
                          {imageEntry.id}
                        </Typography>
                      </Box>

                      <Box
                        className="controls"
                        display="flex"
                        flexDirection="column"
                        alignItems={"center"}
                      >
                        <ClearIcon
                          onClick={() => {
                            const newEntries = stack.imageEntries.filter(
                              //newEntries are all the entries remaining (the ones not-deleted)
                              (x) => x.id != imageEntry.id
                            );

                            //window.URL.revokeObjectURL(imageEntry.imageUrl); //delete image

                            if (newEntries.length == 0) {
                              setStacks([
                                ...stacks.slice(0, index),
                                ...stacks.slice(index + 1, stack.length),
                              ]);
                            } else {
                              setStacks(
                                stacks.with(index, {
                                  ...stack,
                                  imageEntries: newEntries,
                                })
                              );
                            }
                          }}
                        />

                        <Checkbox
                          checked={imageEntry.checked}
                          icon={<VisibilityOffSharpIcon />}
                          checkedIcon={<VisibilitySharpIcon color="primary" />}
                          onChange={(event) => {
                            const newEntries = stack.imageEntries.with(
                              entryIndex,
                              {
                                ...imageEntry,
                                checked: event.target.checked,
                              }
                            );
                            setStacks(
                              stacks.with(index, {
                                ...stack,
                                imageEntries: newEntries,
                              })
                            );
                          }}
                        />
                      </Box>
                    </Box>
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
                ) : (
                  <Dropzone
                    onDrop={(acceptedFiles) =>
                      onDropImageToStack(stack, index, acceptedFiles, false)
                    }
                  >
                    {({ getRootProps, getInputProps }) => (
                      <Button
                        {...getRootProps()}
                        color="primary"
                        sx={{ maxWidth: 25 }}
                        variant="outlined"
                      >
                        Replace fixed image
                        <input
                          {...getInputProps()}
                          accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
                        />
                      </Button>
                    )}
                  </Dropzone>
                )}
              </Box>
              <Box display="flex" gap="0.2rem" fontSize="0.5em">
                <Tooltip title="location x,y">
                  <Chip
                    icon={<LocationOnIcon />}
                    size="small"
                    variant="outlined"
                    label={`${Math.round(stack.x)},${Math.round(stack.y)}`}
                  />
                </Tooltip>
                <Tooltip title="rotation">
                  <Chip
                    icon={<ReplayIcon />}
                    size="small"
                    variant="outlined"
                    label={`${stack.rotation}`}
                  />
                </Tooltip>
                <Tooltip title="image Size (wxh) @ (scale)">
                  <Chip
                    icon={<PhotoSizeSelectLargeIcon />}
                    size="small"
                    variant="outlined"
                    label={`${Math.round(
                      stack.width * stack.scaling
                    )}x${Math.round(stack.height * stack.scaling)} @ ${
                      stack.scaling
                    }`}
                  />
                </Tooltip>
              </Box>
            </Paper>
          ))}
        </section>
      </CardContent>
    </Box>
  );
}
