import * as fs from "fs/promises";

import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { mkdirp } from "mkdirp";
import { glob } from "glob";

export const queue = [];
export const processes = {};
export const tasks = {};

export async function createTask(projectId) {
  const jobId = "job-" + randomUUID();
  await mkdirp(`uploads/${jobId}`);
  await fs.copyFile(
    `uploads/${projectId}/settings.json`,
    `uploads/${jobId}/settings.json`
  );
  await fs.copyFile(
    `uploads/${projectId}/thumbnail.png`,
    `uploads/${jobId}/thumbnail.png`
  );

  const settingsJson = await fs
    .readFile(`uploads/${projectId}/settings.json`, "utf-8")
    .then(JSON.parse);

  tasks[jobId] = {
    id: jobId,
    projectId,
    title: settingsJson.title,
    fixedImage: settingsJson.workingImages[0].imageEntries[0],
    images: settingsJson.workingImages.flatMap((x) => x.imageEntries).length,
    datacubes: settingsJson.workingImages.length,
    thumbnail: `/api/uploads/${jobId}/thumbnail.png`,
    progress: [0, 0],
    startTime: Date.now(),
    endTime: 0,
    updated: Date.now(),
    message: "",
    status: "queued",
  };

  await fs.writeFile(
    `uploads/${jobId}/task.json`,
    JSON.stringify(tasks[jobId], null, 2)
  );

  return tasks[jobId];
}

export async function startTask(jobId) {
  tasks[jobId].done = 0;
  tasks[jobId].status = "started";

  const p = spawn("python", [
    "../scripts_registration/imreg_python__read-json-settings.py",
    `uploads/${jobId}/settings.json`,
    `uploads/${jobId}`,
  ]);

  processes[jobId] = p;

  p.stdout.on("data", (data) => {
    if (tasks[jobId].done) return;

    const str = data.toString();
    tasks[jobId].updated = Date.now();
    const matches = str.match(/#\[progress:(\d+)\/(\d+)\]/);
    if (matches) {
      const [_, i, count] = matches;
      tasks[jobId].progress = [i, count];
      console.log("progress", [jobId, i, count]);
    }

    //tasks[jobId].message += str;
  });

  p.stderr.on("data", (data) => {
    if (tasks[jobId].done) return;
    const str = data.toString();

    tasks[jobId].updated = Date.now();
    tasks[jobId].message += str;
  });

  return new Promise((done) => {
    p.on("close", async (code) => {
      if (tasks[jobId].done) return;
      tasks[jobId].updated = Date.now();
      tasks[jobId].endTime = Date.now();
      tasks[jobId].done = Date.now();
      tasks[jobId].status = code ? "error" : "success";
      await fs.writeFile(
        `uploads/${jobId}/task.json`,
        JSON.stringify(tasks[jobId], null, 2)
      );
      done(code);
    });
  });
}

let processing = false;
async function processQueue() {
  if (processing) return;
  while (queue.length) {
    processing = true;
    const job = queue.pop();
    await startTask(job);
  }
  processing = false;
}

export function enqueueJob(job) {
  queue.push(job.id);
  const status = queue.length == 1 ? "started" : "queued";
  processQueue();

  return status;
}

export async function loadTasks() {
  const savedTasks = await glob("uploads/job-*/task.json").then((paths) =>
    Promise.all(
      paths
        .map((x) => "./" + x.replace(/\\/g, "/"))
        .map(async (path) => {
          const content = await fs.readFile(path, "utf8");
          return JSON.parse(content);
        })
    )
  );

  savedTasks.forEach((job) => {
    tasks[job.id] = job;
  });

  if (!queue.length) {
    savedTasks
      .filter(
        (x) =>
          (x.status == "started" && !processes[x.id]) || x.status == "queued"
      )
      .forEach((job) => {
        enqueueJob(job);
      });
  }
}
