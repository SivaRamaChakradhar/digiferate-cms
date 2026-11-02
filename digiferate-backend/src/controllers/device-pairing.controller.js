import devicePairingService from "../services/device-pairing.service.js";

const claimPairingCode = async (req, res) => {
  try {
    const {
      code,
      deviceIdentifier,
      deviceName,
      deviceModel,
    } = req.body;

    if (
      typeof code !== "string" ||
      !/^[A-HJ-NP-Z2-9]{6}$/i.test(code)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid six-character pairing code is required",
      });
    }

    if (
      typeof deviceIdentifier !== "string" ||
      !deviceIdentifier.trim() ||
      deviceIdentifier.length > 200
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid device identifier is required",
      });
    }

    if (
      deviceName !== undefined &&
      (typeof deviceName !== "string" || deviceName.length > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid device name",
      });
    }

    if (
      deviceModel !== undefined &&
      (typeof deviceModel !== "string" || deviceModel.length > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid device model",
      });
    }

    const pairing = await devicePairingService.claimPairingCode({
      code,
      deviceIdentifier: deviceIdentifier.trim(),
      deviceName: deviceName?.trim(),
      deviceModel: deviceModel?.trim(),
    });

    return res.status(200).json({
      success: true,
      message: "Device paired successfully",
      data: {
        pairingId: pairing.id,
        pairedAt: pairing.pairedAt,
        screen: {
          id: pairing.screen.id,
          customName: pairing.screen.customName,
          status: pairing.screen.status,
        },
        device: {
          id: pairing.androidDevice.id,
          deviceName: pairing.androidDevice.deviceName,
          deviceModel: pairing.androidDevice.deviceModel,
        },
      },
    });
  } catch (error) {
    console.error("Claim pairing code error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to pair device",
    });
  }
};

const unpairScreen = async (req, res) => {
  try {
    const result = await devicePairingService.unpairScreen(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Screen unpaired successfully",
      data: result,
    });
  } catch (error) {
    console.error("Unpair screen error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to unpair screen",
    });
  }
};

const getScreenPairing = async (req, res) => {
  try {
    const pairing = await devicePairingService.getScreenPairing(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: pairing
        ? {
            pairingId: pairing.id,
            pairedAt: pairing.pairedAt,
            device: pairing.androidDevice,
          }
        : null,
    });
  } catch (error) {
    console.error("Get screen pairing error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to fetch pairing details",
    });
  }
};

export default {
  claimPairingCode,
  unpairScreen,
  getScreenPairing,
};