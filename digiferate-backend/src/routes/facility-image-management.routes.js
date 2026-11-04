
import express from "express";

import {
  updateFacilityImageController,
  deleteFacilityImageController,
} from "../controllers/facility-image.controller.js";

const router = express.Router();

router.patch("/:id", updateFacilityImageController);
router.delete("/:id", deleteFacilityImageController);

export default router;
