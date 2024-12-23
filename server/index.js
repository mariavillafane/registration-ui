const express = require("express");
const { exec } = require("child_process");
const fs = require("fs/promises");
const cors = require("cors");
const crypto = require("crypto");
const { glob } = require("glob");
const path = require("path");

const app = express(); //express() creates a http server
app.use(cors());
app.set("limit", "2000mb");
app.use(express.json({ limit: "2000mb" }));
//allows access at the job end point to access images in the results folder 240420
app.use("/registration-ui", express.static("../build")); //how to serve react app from express 240529
app.use("/api/job", express.static("../results"));

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
  const paths_to_read = await glob("../results/*/metadata.json"); //once we have metadata.json, glob will need to read from jsons of each job
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

let i = 0;
app.post("/api/start", async (request, response) => {
  i++;
  const content = JSON.stringify(request.body);

  const id = crypto.createHash("md5").update(content).digest("hex");

  // 2a. create a folder for results each time
  await fs.mkdir("../results").catch(() => {});
  await fs.mkdir("../results/" + id).catch(() => {});
  // 2. save to disk => write settings.json file with data collected from the request (coming from website)

  const destination_folder = `../results/${id}`;

  //writing the settings.json file
  await fs.writeFile(`${destination_folder}/settings.json`, content);

  //statuses is a collection of jobs
  const statuses = await getStatuses();

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
  const destination_folder = `../results/${id}/results`;

  const listOfFilesResultingFromRegistration = await fs.readdir(
    destination_folder
  );
  const finallist = listOfFilesResultingFromRegistration.map(
    (fileName) => `/api/job/${id}/results/${fileName}`
  );
  res.json(finallist);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
