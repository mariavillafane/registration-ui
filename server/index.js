const express = require("express");
const { exec } = require("child_process");
const fs = require("fs/promises");
const cors = require("cors");
const { SmsFailedRounded } = require("@mui/icons-material");

const app = express(); //express() creates a http server
app.use(cors());
app.use(express.json());
//allows access at the job end point to access images in the results folder 240420
app.use("/job", express.static("../results"));

const port = 4000;

function startnextjob(statuses) {
  const areThereAnyOngoingJobs = Object.values(statuses).find(
    (entry) => entry.status == "started"
  );

  if (areThereAnyOngoingJobs) return; //did we start any job? if yes, do nothing

  const nextjob = Object.values(statuses)
    .sort((a, b) => a.entryTime - b.entryTime)
    .find((entry) => entry.status == "queued");

  if (!nextjob) return; //is thete any queued job? if no, do nothing (this finishes the function)

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

app.get("/", (req, res) => {
  res.send("Hello World again!");
});

let i = 0;
let statuses = {};
app.post("/start", async (request, response) => {
  i++;
  console.log(request.body); // 1. receive json (initialised by user pressing "start registration")

  // 2a. create a folder for results each time
  await fs.mkdir("../results").catch(() => {});
  await fs.mkdir("../results/" + i).catch(() => {});
  // 2. save to disk => write settings.json file with data collected from the request (coming from website)

  const destination_folder = `../results/${i}`;

  await fs.writeFile(
    `${destination_folder}/settings.json`,
    JSON.stringify(request.body)
  );

  const job = {
    id: i,
    entryTime: +new Date(),
    destination_folder, //destination_folder: destination_folder,
    status: "queued",
  };

  statuses[i] = job;
  startnextjob(statuses);
  response.json(job);
});

app.get("/status", (req, res) => {
  res.json(statuses);
});

app.get("/stop/:id", (req, res) => {
  console.log(req.params.id);
  statuses = {
    ...statuses,
    [req.params.id]: "stopped",
  };
  res.json(statuses);
});

app.get("/blub", (req, res) => {
  exec("ls -la", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    setTimeout(() => res.send(`${stdout}`), 3000);
    console.log(`stdout: ${stdout}`);
  });

  ++i;
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
