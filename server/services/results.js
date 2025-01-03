import { glob } from "glob";
import { Router } from "express";

export const resultsApi = Router();

resultsApi.get("/api/results/:id", async (req, res) => {
  const id = req.params.id;
  const destination_folder = `uploads/${id}/results`;

  const listOfFilesResultingFromRegistration = await glob(
    `${destination_folder}/**`
  );

  const finallist = listOfFilesResultingFromRegistration
    .map((x) => x.replace(/\\/g, "/").replace(destination_folder, ""))
    .map((fileName) => `/api/uploads/${id}/results${fileName}`);
  res.json(finallist);
});

resultsApi.get("/api/images", async (req, res) => {
  const files = await glob("./uploads/*/*.json").then((paths) =>
    paths.map((x) => require("./" + x.replace(/\\/g, "/")))
  );
  res.json(files);
});

resultsApi.get("/api/export/:id", async (req, res) => {
  const folderToZip = path.join(__dirname, "uploads", req.params.id); // Replace 'your-folder' with your folder name
  const zipFileName = req.params.id + ".zip";

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename=${zipFileName}`);

  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level
  });

  // Listen for all archive data to be written
  archive.on("end", () => {
    console.log("Archive wrote %d bytes", archive.pointer());
  });

  // Good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on("warning", (err) => {
    if (err.code === "ENOENT") {
      console.warn(err.message); // log warning
    } else {
      // throw error for other errors
      throw err;
    }
  });

  archive.on("error", (err) => {
    res.status(500).send({ error: err.message });
  });

  archive.pipe(res);
  archive.directory(folderToZip, req.params.id);
  archive.finalize();
});
