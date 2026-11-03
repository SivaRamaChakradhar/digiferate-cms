import express from "express";

import { createWallpaper, getWallpapers, getWallpaper, editWallpaper, removeWallpaper, changeWallpaperStatus } from "../controllers/wallpaper.controller.js";
import uploadWallpaper from "../middlewares/wallpaper-upload.middleware.js";

const router = express.Router();

router.post("/", uploadWallpaper.single("file"), createWallpaper);
router.get("/", getWallpapers);
router.get("/:id", getWallpaper);
router.patch("/:id", editWallpaper);
router.delete("/:id", removeWallpaper);
router.patch("/:id/status", changeWallpaperStatus);
export default router;

