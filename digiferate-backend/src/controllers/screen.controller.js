import screenService from "../services/screen.service.js";

const allowedFields = [
  "customName",
  "area",
  "city",
  "state",
  "country",
];

const validateScreenData = (data, isUpdate = false) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Request body must be a valid object";
  }

  const keys = Object.keys(data);

  if (keys.length === 0) {
    return "Please provide screen details";
  }

  const invalidFields = keys.filter(
    (key) => !allowedFields.includes(key)
  );

  if (invalidFields.length > 0) {
    return `Invalid fields: ${invalidFields.join(", ")}`;
  }

  if (!isUpdate) {
    const missingFields = allowedFields.filter(
      (field) =>
        typeof data[field] !== "string" ||
        !data[field].trim()
    );

    if (missingFields.length > 0) {
      return `Missing required fields: ${missingFields.join(", ")}`;
    }
  } else {
    const invalidValues = keys.filter(
      (key) =>
        typeof data[key] !== "string" ||
        !data[key].trim()
    );

    if (invalidValues.length > 0) {
      return `Invalid values for: ${invalidValues.join(", ")}`;
    }
  }

  return null;
};

const createScreen = async (req, res) => {
  try {
    const validationError = validateScreenData(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const screen = await screenService.createScreen(req.body);

    return res.status(201).json({
      success: true,
      message: "Screen created successfully",
      data: screen,
    });
  } catch (error) {
    console.error("Create screen error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create screen",
    });
  }
};

const getAllScreens = async (req, res) => {
  try {
    const screens = await screenService.getAllScreens();

    return res.status(200).json({
      success: true,
      count: screens.length,
      data: screens,
    });
  } catch (error) {
    console.error("Get screens error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch screens",
    });
  }
};

const getScreenById = async (req, res) => {
  try {
    const screen = await screenService.getScreenById(req.params.id);

    if (!screen) {
      return res.status(404).json({
        success: false,
        message: "Screen not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: screen,
    });
  } catch (error) {
    console.error("Get screen error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch screen",
    });
  }
};

const updateScreen = async (req, res) => {
  try {
    const validationError = validateScreenData(req.body, true);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const screen = await screenService.updateScreen(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Screen updated successfully",
      data: screen,
    });
  } catch (error) {
    console.error("Update screen error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Screen not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update screen",
    });
  }
};

const deleteScreen = async (req, res) => {
  try {
    await screenService.deleteScreen(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Screen deleted successfully",
    });
  } catch (error) {
    console.error("Delete screen error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Screen not found",
      });
    }

    if (error.code === "P2003") {
      return res.status(409).json({
        success: false,
        message: "Screen has associated records and cannot be deleted",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete screen",
    });
  }
};

export default {
  createScreen,
  getAllScreens,
  getScreenById,
  updateScreen,
  deleteScreen,
};