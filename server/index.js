const express = require("express");
const { exec } = require("child_process");
const fs = require("fs/promises");
const cors = require("cors");
const crypto = require("crypto");

const app = express(); //express() creates a http server
app.use(cors());
app.use(express.json({ limit: "400mb" }));
//allows access at the job end point to access images in the results folder 240420
app.use("/registration-ui", express.static("../build")); //how to serve react app from express 240529
app.use("/api/job", express.static("../results"));

const port = 4000;

function startnextjob(statuses) {
  const areThereAnyOngoingJobs = Object.values(statuses).find(
    (entry) => entry.status == "started"
  );

  if (areThereAnyOngoingJobs) return; //did we start any job? if yes, do nothing

  const nextjob = Object.values(statuses)
    .sort((a, b) => a.entryTime - b.entryTime)
    .find((entry) => entry.status == "queued");

  if (!nextjob) return; //is there any queued job? if no, do nothing (this finishes the function)

  const i = nextjob.id;
  statuses[i].status = "started";
  statuses[i].startTime = +new Date();
  const destination_folder = statuses[i].destination_folder;
  // 3. start registration (this takes a function (run registration) and a callback (with only 1 function taking 3 args))
  exec(
    `python ../scripts_registration/imreg_python__read-json-settings.py ${destination_folder}/settings.json ${destination_folder}`,
    (error, stdout, stderr) => {
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

      startnextjob(statuses);
    }
  );
}

app.get("/api", (req, res) => {
  res.send("Hello World again!");
});

let i = 0;
let statuses = {};
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
  const job = {
    id,
    entryTime: +new Date(),
    destination_folder, //destination_folder: destination_folder,
    status: "queued",
  };

  statuses[id] = job;
  startnextjob(statuses);
  response.json(job);
});

app.get("/api/status", (req, res) => {
  res.json(statuses);
});

// app.get("/stop/:id", (req, res) => {
//   console.log(req.params.id);
//   statuses = {
//     ...statuses,
//     [req.params.id]: "stopped",
//   };
//   res.json(statuses);
// });

app.get("/api/results/:id", async (req, res) => {
  const id = req.params.id;
  const destination_folder = `${
    statuses[req.params.id].destination_folder
  }/results`;

  const listOfFilesResultingFromRegistration = await fs.readdir(
    destination_folder
  );
  // res.json(listOfFilesResultingFromRegistration);
  const finallist = listOfFilesResultingFromRegistration.map(
    (fileName) => `/job/${id}/results/${fileName}`
  );
  res.json(finallist);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
