const express = require("express");
const { exec } = require("child_process");

const app = express();
const port = 4000;

let i = 0;
app.get("/", (req, res) => {
  res.send("Hello World!");
});

let statuses = {};

app.get("/start", (req, res) => {
  i++;
  statuses[i] = "started";
  res.json({ id: i });
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
