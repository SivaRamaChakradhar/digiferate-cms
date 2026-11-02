import { createHash } from "node:crypto";
import prisma from "../config/database.js";

const hashCode = (code) => {
  return createHash("sha256")
    .update(code)
    .digest("hex");
};

const claimPairingCode = async ({
  code,
  deviceIdentifier,
  deviceName,
  deviceModel,
}) => {
  const normalizedCode = code.trim().toUpperCase();
  const codeHash = hashCode(normalizedCode);

  return prisma.$transaction(async (tx) => {
    const pairingCode = await tx.pairingCode.findUnique({
      where: { codeHash },
      include: { screen: true },
    });

    if (!pairingCode) {
      throw Object.assign(
        new Error("Invalid pairing code"),
        { statusCode: 400 }
      );
    }

    if (pairingCode.usedAt || pairingCode.revokedAt) {
      throw Object.assign(
        new Error("Pairing code has already been used or revoked"),
        { statusCode: 409 }
      );
    }

    if (pairingCode.expiresAt <= new Date()) {
      throw Object.assign(
        new Error("Pairing code has expired"),
        { statusCode: 410 }
      );
    }

    if (pairingCode.screen.status !== "UNPAIRED") {
      throw Object.assign(
        new Error("Screen is not available for pairing"),
        { statusCode: 409 }
      );
    }

    const screenId = pairingCode.screenId;

    const activeScreenPairing = await tx.screenPairing.findFirst({
      where: {
        screenId,
        unpairedAt: null,
      },
    });

    if (activeScreenPairing) {
      throw Object.assign(
        new Error("Screen is already paired"),
        { statusCode: 409 }
      );
    }

    let device = await tx.androidDevice.findUnique({
      where: { deviceIdentifier },
    });

    if (device) {
      const activeDevicePairing =
        await tx.screenPairing.findFirst({
          where: {
            androidDeviceId: device.id,
            unpairedAt: null,
          },
        });

      if (activeDevicePairing) {
        throw Object.assign(
          new Error("Device is already paired with another screen"),
          { statusCode: 409 }
        );
      }
    }

    device = await tx.androidDevice.upsert({
      where: { deviceIdentifier },
      update: {
        ...(deviceName !== undefined ? { deviceName } : {}),
        ...(deviceModel !== undefined ? { deviceModel } : {}),
      },
      create: {
        deviceIdentifier,
        deviceName,
        deviceModel,
      },
    });

    const pairing = await tx.screenPairing.create({
      data: {
        screenId,
        androidDeviceId: device.id,
      },
      include: {
        screen: true,
        androidDevice: true,
      },
    });

    await tx.pairingCode.update({
      where: { id: pairingCode.id },
      data: { usedAt: new Date() },
    });

    await tx.screen.update({
      where: { id: screenId },
      data: { status: "PAIRED" },
    });

    return pairing;
  });
};

const unpairScreen = async (screenId) => {
  return prisma.$transaction(async (tx) => {
    const screen = await tx.screen.findUnique({
      where: { id: screenId },
    });

    if (!screen) {
      throw Object.assign(
        new Error("Screen not found"),
        { statusCode: 404 }
      );
    }

    const activePairing = await tx.screenPairing.findFirst({
      where: {
        screenId,
        unpairedAt: null,
      },
    });

    if (!activePairing) {
      throw Object.assign(
        new Error("Screen is not currently paired"),
        { statusCode: 409 }
      );
    }

    const now = new Date();

    await tx.screenPairing.update({
      where: {
        id: activePairing.id,
      },
      data: {
        unpairedAt: now,
      },
    });

    await tx.screen.update({
      where: { id: screenId },
      data: {
        status: "UNPAIRED",
      },
    });

    return {
      screenId,
      pairingId: activePairing.id,
      unpairedAt: now,
    };
  });
};

const getScreenPairing = async (screenId) => {
  const screen = await prisma.screen.findUnique({
    where: { id: screenId },
  });

  if (!screen) {
    throw Object.assign(
      new Error("Screen not found"),
      { statusCode: 404 }
    );
  }

  const pairing = await prisma.screenPairing.findFirst({
    where: {
      screenId,
      unpairedAt: null,
    },
    include: {
      androidDevice: true,
    },
  });

  return pairing;
};

export default {
  claimPairingCode,
  unpairScreen,
  getScreenPairing,
};