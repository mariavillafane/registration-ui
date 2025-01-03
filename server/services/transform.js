import { exec } from "child_process";
import { Router } from "express";

export const transformApi = Router();

transformApi.post("/api/transform", (req, res) => {
  const { transformation, image } = req.body;

  const imagePath = image.replace("/api/", "");
  const imgHash = imagePath.split(/[/.]/g)[3];
  const transformationJsonPath = transformation.replace("/api/", "");
  const destination =
    transformationJsonPath.replace("_transformations.json", "") + `/${imgHash}`;

  exec(
    `python ../scripts_registration/apply_transform_to_image_from_json_alpha.py ${destination} "${transformationJsonPath}" "${imagePath}"`,
    async (error, stdout, stderr) => {
      console.log({ error, stdout, stderr });
      res.end("done");
    }
  );
});
