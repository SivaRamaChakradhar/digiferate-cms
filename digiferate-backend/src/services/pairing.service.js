import { randomInt, createHash } from "node:crypto";
import prisma from "../config/database.js";

const CODE_LENGTH = 6;
const CODE_EXPIRY_MINUTES = 5;

// Excludes confusing characters such as 0, O, 1 and I.
const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateCode = () => {
  let code = "";

  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARACTERS[randomInt(0, CHARACTERS.length)];
  }

  return code;
};

const hashCode = (code) => {
  return createHash("sha256").update(code).digest("hex");
};

const createPairingCode = async (screenId) => {
  const screen = await prisma.screen.findUnique({
    where: { id: screenId },
  });

  if (!screen) {
    const error = new Error("Screen not found");
    error.statusCode = 404;
    throw error;
  }

  if (screen.status !== "UNPAIRED") {
    const error = new Error(
      "Only unpaired screens can generate a pairing code"
    );
    error.statusCode = 409;
    throw error;
  }

  const code = generateCode();
  const codeHash = hashCode(code);

  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + CODE_EXPIRY_MINUTES * 60 * 1000
  );

  await prisma.$transaction(async (tx) => {
    // Revoke previous unused codes for this screen.
    await tx.pairingCode.updateMany({
      where: {
        screenId,
        usedAt: null,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    });

    await tx.pairingCode.create({
      data: {
        codeHash,
        codeSuffix: code.slice(-2),
        screenId,
        expiresAt,
      },
    });
  });

  // Return the original code only once.
  return {
    code,
    expiresAt,
  };
};

export default {
  createPairingCode,
};