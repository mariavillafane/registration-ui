import React from "react";
import Dropzone from "react-dropzone";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export function ImageUploader({ setMovingFile }) {
  return (
    <Card sx={{ minWidth: 275, height: 100 }}>
      <CardContent>
        {/* <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}> */}
        <Dropzone onDrop={(acceptedFiles) => setMovingFile(acceptedFiles[0])}>
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
                {/* <p>Drag 'n' drop some files here, or click to select files</p> */}
              </div>
            </section>
          )}
        </Dropzone>
      </CardContent>
    </Card>
  );
}
