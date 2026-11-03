import {
  assignWallpaperToScreen,
  getScreenWallpaper,
  removeScreenWallpaper,
} from "../services/screen-wallpaper.service.js";

const assignWallpaper = async (req, res) => {
  try {
    const { wallpaperId } = req.body;

    if (
      typeof wallpaperId !== "string" ||
      !wallpaperId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Wallpaper ID is required",
      });
    }

    const assignment = await assignWallpaperToScreen(
      req.params.id,
      wallpaperId
    );

    return res.status(201).json({
      success: true,
      message: "Wallpaper assigned to screen successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Wallpaper assignment error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to assign wallpaper",
    });
  }
};

const getAssignedWallpaper = async (req, res) => {
  try {
    const assignment = await getScreenWallpaper(req.params.id);

    return res.status(200).json({
      success: true,
      message: assignment
        ? "Assigned wallpaper retrieved successfully"
        : "No wallpaper assigned to this screen",
      data: assignment,
    });
  } catch (error) {
    console.error("Get assigned wallpaper error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to retrieve assigned wallpaper",
    });
  }
};

const unassignWallpaper = async (req, res) => {
  try {
    const assignment = await removeScreenWallpaper(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Wallpaper removed from screen successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Wallpaper unassignment error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to remove wallpaper",
    });
  }
};

export {
  assignWallpaper,
  getAssignedWallpaper,
  unassignWallpaper,
};