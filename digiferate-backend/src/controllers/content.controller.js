import contentService from "../services/content.service.js";

const serializeContent = (content) => ({
  ...content,
  assets: content.assets?.map((asset) => ({
    ...asset,
    sizeBytes: asset.sizeBytes?.toString() ?? null,
  })),
});

const createContent = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (
      title !== undefined &&
      (typeof title !== "string" || !title.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Title must be a non-empty string",
      });
    }

    if (
      message !== undefined &&
      (typeof message !== "string" || !message.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Message must be a non-empty string",
      });
    }

    if (!title?.trim() && !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Provide at least a title or message",
      });
    }

    const content = await contentService.createContent({
      title,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Content created successfully",
      data: serializeContent(content),
    });
  } catch (error) {
    console.error("Create content error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create content",
    });
  }
};

const getAllContent = async (req, res) => {
  try {
    const content = await contentService.getAllContent();

    return res.status(200).json({
      success: true,
      count: content.length,
      data: content.map(serializeContent),
    });
  } catch (error) {
    console.error("Get content error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch content",
    });
  }
};

const getContentById = async (req, res) => {
  try {
    const content = await contentService.getContentById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: serializeContent(content),
    });
  } catch (error) {
    console.error("Get content by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch content",
    });
  }
};

const updateContent = async (req, res) => {
  try {
    const { title, message } = req.body;
    const keys = Object.keys(req.body);

    if (keys.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide content details to update",
      });
    }

    const invalidFields = keys.filter(
      (key) => !["title", "message"].includes(key)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fields: ${invalidFields.join(", ")}`,
      });
    }

    if (
      title !== undefined &&
      (typeof title !== "string" || !title.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Title must be a non-empty string",
      });
    }

    if (
      message !== undefined &&
      (typeof message !== "string" || !message.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Message must be a non-empty string",
      });
    }

    const content = await contentService.updateContent(
      req.params.id,
      {
        ...(title !== undefined && { title: title.trim() }),
        ...(message !== undefined && { message: message.trim() }),
      }
    );

    return res.status(200).json({
      success: true,
      message: "Content updated successfully",
      data: serializeContent(content),
    });
  } catch (error) {
    console.error("Update content error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update content",
    });
  }
};

const archiveContent = async (req, res) => {
  try {
    const content = await contentService.archiveContent(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Content archived successfully",
      data: content,
    });
  } catch (error) {
    console.error("Archive content error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to archive content",
    });
  }
};

export default {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  archiveContent,
};