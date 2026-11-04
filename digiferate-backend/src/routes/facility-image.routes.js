
import express from "express";
import uploadWallpaper from "../middlewares/wallpaper-upload.middleware.js";

import {
  uploadFacilityImageController,
  getFacilityImagesByCategoryController,
  updateFacilityImageController,
  deleteFacilityImageController
} from "../controllers/facility-image.controller.js";

const router = express.Router();

router.post(
  "/:id/images",
  uploadWallpaper.single("image"),
  uploadFacilityImageController
);

router.get("/:id/images", getFacilityImagesByCategoryController);
router.patch("/:id", updateFacilityImageController);
router.delete("/:id", deleteFacilityImageController);

export default router;
