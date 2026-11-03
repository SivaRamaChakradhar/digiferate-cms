import express from "express";
import contentController from "../controllers/content.controller.js";

const router = express.Router();

router.post("/", contentController.createContent);
router.get("/", contentController.getAllContent);
router.get("/:id", contentController.getContentById);
router.patch("/:id", contentController.updateContent);
router.patch("/:id/archive", contentController.archiveContent);

export default router;