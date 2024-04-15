const express = require("express");
const { exec } = require("child_process");
const fs = require("fs/promises");
const cors = require("cors");

const app = express(); //express() creates a http server
app.use(cors());
app.use(express.json());

const port = 4000;

let i = 0;
app.get("/", (req, res) => {
  res.send("Hello World again!");
});

let statuses = {};

app.post("/start", async (request, response) => {
  i++;
  console.log(request.body); // 1. receive json (initialised by user pressing "start registration")

  // 2a. create a folder for results each time
  await fs.mkdir("../results").catch(() => {});
  await fs.mkdir("../results/" + i).catch(() => {});
  // 2. save to disk => write settings.json file with data collected from the request (coming from website)

  const destination_folder = `../results/${i}`; //"../results/" + i

  await fs.writeFile(
    `${destination_folder}/settings.json`,
    JSON.stringify(request.body)
  );

  // 3. start registration (this takes time)
  exec(
    `python ../scripts_registration/imreg_python__read-json-settings.py ${destination_folder}/settings.json ${destination_folder}`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
      }

      //console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    }
  );

  // return information to the browser: server was succesful in receiving the task (1. it can start right away / 2. it cannot start since there is a queue / 3. it cannot start but redundant since results already available)
  // return information to the browser: server was unsuccesful in receiving the task (=> need to try again -- because ie json malformed / not able to run python (wrong installation) / etc )

  // 4. save results
  statuses[i] = "started";

  // return information to the browser: server was succesful in receiving the task (or not, ie not enough space in disk)
  response.json({ id: i });
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
