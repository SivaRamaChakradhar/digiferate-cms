import express from "express";
import screenController from "../controllers/screen.controller.js";
import pairingController from "../controllers/pairing.controller.js";
import devicePairingController from "../controllers/device-pairing.controller.js";

import {
  assignWallpaper,
  getAssignedWallpaper,
  unassignWallpaper,
} from "../controllers/screen-wallpaper.controller.js";

const router = express.Router();

router.post("/", screenController.createScreen);
router.get("/", screenController.getAllScreens);
router.get("/:id", screenController.getScreenById);
router.put("/:id", screenController.updateScreen);
router.delete("/:id", screenController.deleteScreen);

router.post("/:id/pairing-code", pairingController.createPairingCode);

router.get(
  "/:id/pairing",
  devicePairingController.getScreenPairing
);

router.post(
  "/:id/unpair",
  devicePairingController.unpairScreen
);

router.post("/:id/wallpaper", assignWallpaper);
router.get("/:id/wallpaper", getAssignedWallpaper);
router.delete("/:id/wallpaper", unassignWallpaper);

export default router;