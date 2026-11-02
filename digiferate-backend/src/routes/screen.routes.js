import express from "express";
import screenController from "../controllers/screen.controller.js";
import pairingController from "../controllers/pairing.controller.js";

const router = express.Router();

router.post("/", screenController.createScreen);
router.get("/", screenController.getAllScreens);
router.get("/:id", screenController.getScreenById);
router.put("/:id", screenController.updateScreen);
router.delete("/:id", screenController.deleteScreen);

router.post("/:id/pairing-code", pairingController.createPairingCode);

export default router;