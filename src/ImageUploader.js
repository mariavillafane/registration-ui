import React from "react";
import Dropzone from "react-dropzone";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { readImage } from "./ImageTools";
import { useState } from "react";

export function ImageUploader({ setMovingFile }) {
  //images, setImages
  const [images, setImages] = useState([]);

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        {/* <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}> */}
        <Dropzone
          onDrop={(acceptedFiles) =>
            acceptedFiles.map((file) =>
              readImage(file, (image) => setImages([...images, image]))
            )
          }
        >
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Typography
                  sx={{ fontSize: 14 }}
                  color="text.secondary"
                  gutterBottom
                >
                  Upload Moving Image
                </Typography>

                {images.map((image) => (
                  <Card key={image}>
                    <img src={image} style={{ width: 140 }} />
                  </Card>
                ))}

                {/* <p>Drag 'n' drop some files here, or click to select files</p> */}
              </div>
            </section>
          )}
        </Dropzone>
      </CardContent>
    </Card>
  );
}
