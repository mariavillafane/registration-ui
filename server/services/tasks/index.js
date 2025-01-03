import * as fs from "fs/promises";
import { glob } from "glob";

import { rimraf } from "rimraf";

import { Router } from "express";
import { createTask, enqueueJob, processes, tasks } from "./jobs.js";

export * from "./jobs.js";

export const tasksApi = Router();

tasksApi.post("/api/start/:id", async (request, response) => {
  const { id } = request.params;

  const job = await createTask(id);
  const status = enqueueJob(job);

  response.json({ ...job, status });
});

tasksApi.get("/api/status", async (req, res) => {
  res.json(tasks);
});

tasksApi.get("/api/projects", async (req, res) => {
  const files = await glob("./uploads/project-*/settings.json").then((paths) =>
    Promise.all(
      paths
        .map((x) => "./" + x.replace(/\\/g, "/"))
        .map(async (path) => {
          const content = await fs.readFile(path, "utf8");
          return JSON.parse(content);
        })
    )
  );
  res.json(files);
});

tasksApi.post("/api/delete/:id", async (req, res) => {
  const { id } = req.params;
  if (processes[id]) {
    processes[id].kill();
  }
  await rimraf(`uploads/${id}`).catch(console.log);
  delete tasks[id];
  res.json({});
});

tasksApi.post("/api/stop/:id", async (req, res) => {
  const { id } = req.params;
  processes[id].kill();
  delete processes[id];
  tasks[id].status = "stopped";
  tasks[id].done = Date.now();
  tasks[id].message = "stopped by user";

  await fs.writeFile(
    `uploads/${id}/task.json`,
    JSON.stringify(tasks[id], null, 2)
  );

  res.json(tasks);
});

tasksApi.post("/api/resume/:id", async (req, res) => {
  const { id } = req.params;

  if (!tasks[id] || tasks[id].status != "stopped") {
    return res.json(tasks);
  }

  console.log("enqueueing", tasks[id]);
  enqueueJob(tasks[id]);

  res.json(tasks);
});
