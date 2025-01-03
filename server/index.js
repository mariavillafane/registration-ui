import express from "express";
import cors from "cors";

import { mkdirp } from "mkdirp";
import { loadTasks, tasksApi } from "./services/tasks/index.js";
import { resultsApi } from "./services/results.js";
import { transformApi } from "./services/transform.js";
import { importApi } from "./services/import.js";

const app = express(); //express() creates a http server

mkdirp("tmp");
loadTasks();

app.set("limit", "2000mb");
app.use(express.json({ limit: "2000mb" }));

app.use(importApi);
app.use(tasksApi);
app.use(resultsApi);
app.use(transformApi);

app.use("/api/uploads", express.static("./uploads"));
app.use("/registration-ui", express.static("../build"));
app.get("/", (req, res) => {
  res.redirect("/registration-ui");
});

const port = 4000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
