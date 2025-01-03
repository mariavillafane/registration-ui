import sharp from "sharp";

import * as fs from "fs/promises";
import { mkdirp } from "mkdirp";
import express from "express";
import multer from "multer";
import prettyBytes from "pretty-bytes";

const upload = multer({ dest: "tmp/" });
export const importApi = express.Router();

function stripMetadataBuffers(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([_k, v]) => !Buffer.isBuffer(v))
  );
}

importApi.post("/api/upload/:id", upload.single("image"), async (req, res) => {
  const dest = "uploads/" + req.params.id + "/images/" + req.file.filename;
  await mkdirp(dest);
  const filePath = (dest + "/" + req.file.originalname).replace(/\\/g, "/");
  const filePathNoExt = filePath.replace(/\.[^/.]+$/, "");
  await fs.rename(req.file.path, filePath);
  const image = sharp(filePath);

  const [metadata] = await Promise.all([
    image
      .metadata()
      .then(stripMetadataBuffers)
      .then((x) => ({
        ...x,
        files: {
          url: "/api/" + filePath,
          path: filePath,
          webUrl: "/api/" + filePathNoExt + ".web.png",
          smallUrl: "/api/" + filePathNoExt + ".128.png",
          mediumUrl: "/api/" + filePathNoExt + ".512.png",
        },
        destination: dest,
        size: req.file.size,
        uploaded: Date.now(),
        sizeStr: prettyBytes(req.file.size),
      })),
    image.toFile(filePathNoExt + ".web.png"),
    image
      .resize(128, 128, { resize: "contain" })
      .toFile(filePathNoExt + ".128.png"),
    image
      .resize(512, 512, { resize: "contain" })
      .toFile(filePathNoExt + ".512.png"),
  ]);

  await fs.writeFile(filePathNoExt + ".json", JSON.stringify(metadata));

  res.json({
    metadata,
    ...metadata.files,
  });
});

importApi.post("/api/save/:id", async (req, res) => {
  const dest = "uploads/" + req.params.id + "/";
  await mkdirp(dest);
  const isInlineThumbnail = req.body.thumbnail.startsWith("data:image");
  const thumbnail = req.body.thumbnail.replace(/^data:image\/png;base64,/, "");
  await Promise.all([
    isInlineThumbnail
      ? fs.writeFile(dest + "thumbnail.png", thumbnail, "base64")
      : Promise.resolve(),
    fs.writeFile(
      dest + "settings.json",
      JSON.stringify(
        {
          ...req.body,
          dest,
          uploaded: Date.now(),
          id: req.params.id,
          thumbnail: "/api/" + dest + "thumbnail.png",
          status: "wip",
        },
        null,
        2
      )
    ),
  ]);
  res.json({ status: "success" });
});

importApi.post("/api/import", upload.single("project"), async (req, res) => {
  await unzipper.Open.file(req.file.path)
    .then((x) => x.extract({ path: __dirname + "/uploads" }))
    .then(() => rimraf(req.file.path))
    .catch((e) => {
      console.error(e);
    });
  res.end("");
});
