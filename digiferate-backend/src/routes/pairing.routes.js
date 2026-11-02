import express from "express";
import devicePairingController from "../controllers/device-pairing.controller.js";

const router = express.Router();

router.post(
  "/claim",
  devicePairingController.claimPairingCode
);

export default router;