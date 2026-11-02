import pairingService from "../services/pairing.service.js";

const createPairingCode = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pairingService.createPairingCode(id);

    return res.status(201).json({
      success: true,
      message: "Pairing code generated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Generate pairing code error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to generate pairing code",
    });
  }
};

export default {
  createPairingCode,
};