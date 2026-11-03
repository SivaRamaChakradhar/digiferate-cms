import { uploadContentAsset, deleteContentAsset } from "../services/media.service.js";

const uploadAsset = async (req, res) => {
  try {
    const { id: contentId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image or video to upload",
      });
    }

    const asset = await uploadContentAsset(contentId, file);

    return res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      data: {
        ...asset,
        sizeBytes: asset.sizeBytes.toString(),
      },
    });
  } catch (error) {
    console.error("Media upload error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to upload media",
    });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const { contentId, assetId } = req.params;

    const deletedAsset = await deleteContentAsset(
      contentId,
      assetId
    );

    return res.status(200).json({
      success: true,
      message: "Media deleted successfully",
      data: deletedAsset,
    });
  } catch (error) {
    console.error("Media deletion error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to delete media",
    });
  }
};

export { 
    uploadAsset, 
    deleteAsset 
};