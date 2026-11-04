import {
  uploadFacilityImage,
  getFacilityImagesByCategory,
  updateFacilityImage,
  deleteFacilityImage
} from "../services/facility-image.service.js";

export const uploadFacilityImageController = async (req, res) => {
  try {
    const image = await uploadFacilityImage(
      req.params.id,
      req.file,
      req.body
    );

    return res.status(201).json({
      message: "Facility image uploaded successfully",
      image,
    });
  } catch (error) {
    console.error("Facility image upload error:", error);

    if (error.message === "Facility category not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error.message ===
      "Cannot upload images to an inactive category"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(400).json({
      message: error.message,
    });
  }
};


export const getFacilityImagesByCategoryController = async (req, res) => {
  try {
    const images = await getFacilityImagesByCategory(req.params.id);

    return res.status(200).json({
      count: images.length,
      images,
    });
  } catch (error) {
    if (error.message === "Facility category not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

// Update image details
export const updateFacilityImageController = async (req, res) => {
  try {
    const image = await updateFacilityImage(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      message: "Facility image updated successfully",
      image,
    });
  } catch (error) {
    console.error("Facility image update error:", error);

    const status = error.code === "P2025" ? 404 : 400;

    return res.status(status).json({
      message:
        error.code === "P2025"
          ? "Facility image not found"
          : error.message,
    });
  }
};

// Delete image
export const deleteFacilityImageController = async (req, res) => {
  try {
    const image = await deleteFacilityImage(req.params.id);

    return res.status(200).json({
      message: "Facility image deleted successfully",
      deletedImageId: image.id,
    });
  } catch (error) {
    console.error("Facility image deletion error:", error);

    const status =
      error.code === "P2025" ||
      error.message === "Facility image not found"
        ? 404
        : 500;

    return res.status(status).json({
      message: error.message,
    });
  }
};