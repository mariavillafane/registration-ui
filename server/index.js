const archiver = require("archiver");
const unzipper = require("unzipper");
const express = require("express");
const { exec } = require("child_process");
const fs = require("fs/promises");
const cors = require("cors");
const { glob } = require("glob");
const path = require("path");

const multer = require("multer");
const sharp = require("sharp");
const { mkdirp } = require("mkdirp");
const { emitWarning } = require("process");
const { default: prettyBytes } = require("pretty-bytes");
const { rimraf } = require("rimraf");
mkdirp("tmp");
const upload = multer({ dest: "tmp/" });

const app = express(); //express() creates a http server
app.use(cors());
app.set("limit", "2000mb");
app.use(express.json({ limit: "2000mb" }));
//allows access at the job end point to access images in the results folder 240420
app.use("/registration-ui", express.static("../build")); //how to serve react app from express 240529

const port = 4000;

async function writeMetadataOfJob(status) {
  const metadata = JSON.stringify(status);
  await fs.writeFile(`${status.destination_folder}/metadata.json`, metadata);
}

async function readMetadataOfJob(path) {
  const data = await fs.readFile(path, "utf8");
  const obj = JSON.parse(data);
  return obj;
}

async function getStatuses() {
  const paths_to_read = await glob("uploads/*/metadata.json"); //once we have metadata.json, glob will need to read from jsons of each job
  const array_of_metadata = await Promise.all(
    paths_to_read.map(readMetadataOfJob)
  );
  const dictionary_of_jobs_as_dict_following_their_status = Object.fromEntries(
    array_of_metadata.map((entry) => [entry.id, entry])
  );
  return dictionary_of_jobs_as_dict_following_their_status;
}

async function startnextjob(statuses) {
  const areThereAnyOngoingJobs = Object.values(statuses).find(
    (entry) => entry.status == "started"
  );

  if (areThereAnyOngoingJobs) return; //did we start any job? if yes, do nothing

  const nextjob = Object.values(statuses) //this is an array of jobs
    .sort((a, b) => a.entryTime - b.entryTime)
    .find((entry) => entry.status == "queued");

  if (!nextjob) return; //is there any queued job? if no, do nothing (this finishes the function)

  const i = nextjob.id;
  statuses[i].status = "started";
  statuses[i].startTime = +new Date();
  const destination_folder = statuses[i].destination_folder;

  await writeMetadataOfJob(statuses[i]);
  await mkdirp(destination_folder + "/results").catch(() => {});

  // 3. start registration (this takes a function (run registration) and a callback (with only 1 function taking 3 args))
  exec(
    `python ../scripts_registration/imreg_python__read-json-settings.py ${destination_folder}/settings.json ${destination_folder}`,
    async (error, stdout, stderr) => {
      statuses[i].endTime = +new Date();
      statuses[i].runTime = statuses[i].endTime - statuses[i].startTime;
      if (error) {
        console.log(`error: ${error.message}`);
        statuses[i].status = "failure";
        statuses[i].message = stderr;
        console.log(`stderr: ${stderr}`);
      } else {
        statuses[i].status = "success";
        //console.log(`stdout: ${stdout}`); //prints everythings that prints normally (i.e. all the MI values)
      }
      await writeMetadataOfJob(statuses[i]);

      await startnextjob(statuses);
    }
  );
}

app.get("/api", (req, res) => {
  res.send("Hello World again!");
});

app.post("/api/start/:id", async (request, response) => {
  const { id } = request.params;

  const destination_folder = `uploads/${id}`;
  const statuses = await getStatuses();

  if (statuses[id] && statuses[id].status != "failure") {
    return response.json(statuses[id]);
  }

  const job = {
    id,
    entryTime: +new Date(),
    destination_folder, //destination_folder: destination_folder,
    status: "queued",
  };

  await writeMetadataOfJob(job);

  statuses[id] = job;

  await startnextjob(statuses);
  response.json(job);
});

app.get("/api/status", async (req, res) => {
  res.json(await getStatuses());
});

app.get("/api/results/:id", async (req, res) => {
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

function stripMetadataBuffers(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([_k, v]) => !Buffer.isBuffer(v))
  );
}

app.post("/api/upload/:id", upload.single("image"), async (req, res) => {
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

app.post("/api/transform", (req, res) => {
  const { transformation, image } = req.body;

  const imagePath = image.replace("/api/", "");
  const imgHash = imagePath.split(/[/.]/g)[3];
  const transformationJsonPath = transformation.replace("/api/", "");
  const destination =
    transformationJsonPath.replace("_transformations.json", "") + `/${imgHash}`;

  console.log(req.body, { destination, image, transformationJsonPath });

  exec(
    `python ../scripts_registration/apply_transform_to_image_from_json_alpha.py ${destination} "${transformationJsonPath}" "${imagePath}"`,
    async (error, stdout, stderr) => {
      console.log({ error, stdout, stderr });
      res.end("done");
    }
  );
});

app.use("/api/uploads", express.static("./uploads"));

app.post("/api/save/:id", async (req, res) => {
  const dest = "uploads/" + req.params.id + "/";
  await mkdirp(dest);
  const isInlineThumbnail = req.body.thumbnail.startsWith("data:image");
  const thumbnail = req.body.thumbnail.replace(/^data:image\/png;base64,/, "");
  console.log({ isInlineThumbnail, thumbnail: req.body.thumbnail });
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

app.post("/api/delete/:id", async (req, res) => {
  const { id } = req.params;
  await rimraf(`uploads/${id}`).catch(console.log);
  res.json({});
});

app.get("/api/export/:id", async (req, res) => {
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

  // Catch errors that may occur during the zipping process
  archive.on("error", (err) => {
    res.status(500).send({ error: err.message });
  });

  // Pipe the zip data to the response
  archive.pipe(res);
  // Append files from the folder
  archive.directory(folderToZip, req.params.id);
  // Finalize the archive (i.e. we are done appending files)
  archive.finalize();
});

app.post("/api/import", upload.single("project"), async (req, res) => {
  await unzipper.Open.file(req.file.path)
    .then((x) => {
      console.log("open", req.file);
      return x.extract({ path: __dirname + "/uploads" });
    })
    .then(() => {
      console.log("extracted");
      return rimraf(req.file.path);
    })
    .catch((e) => {
      console.log(e);
    });
  res.end("");
});

app.get("/api/projects", async (req, res) => {
  const files = await glob("./uploads/*/settings.json").then((paths) =>
    paths.map((x) => require("./" + x.replace(/\\/g, "/")))
  );
  res.json(files);
});

app.get("/api/images", async (req, res) => {
  const files = await glob("./uploads/*/*.json").then((paths) =>
    paths.map((x) => require("./" + x.replace(/\\/g, "/")))
  );
  res.json(files);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
