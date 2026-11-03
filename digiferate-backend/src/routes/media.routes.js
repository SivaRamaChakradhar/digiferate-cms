import express from "express";
import upload from "../middlewares/upload.middleware.js";
import { uploadAsset, deleteAsset } from "../controllers/media.controller.js";

const router = express.Router();

router.post(
  "/:id/assets",
  upload.single("file"),
  uploadAsset
);

router.delete(
  "/:contentId/assets/:assetId",
  deleteAsset
);

export default router;