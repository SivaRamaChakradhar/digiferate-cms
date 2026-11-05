import prisma from "../config/database.js";

const createScreen = async (data) => {
  return prisma.screen.create({
    data: {
      customName: data.customName.trim(),
      area: data.area.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      country: data.country.trim(),
    },
  });
};

const getAllScreens = async () => {
  return prisma.screen.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getScreenById = async (id) => {
  return prisma.screen.findUnique({
    where: { id },
  });
};

const updateScreen = async (id, data) => {
  return prisma.screen.update({
    where: { id },
    data,
  });
};

const deleteScreen = async (id) => {
  return prisma.$transaction(async (tx) => {
    // 1. Check whether the screen exists
    const screen = await tx.screen.findUnique({
      where: { id },
    });

    if (!screen) {
      throw Object.assign(new Error("Screen not found"), {
        statusCode: 404,
      });
    }

    // 2. Prevent deletion if the screen is currently paired
    const activePairing = await tx.screenPairing.findFirst({
      where: {
        screenId: id,
        unpairedAt: null,
      },
    });

    if (activePairing) {
      throw Object.assign(
        new Error("Please unpair this screen before deleting it"),
        { statusCode: 409 }
      );
    }

    // 3. Delete pairing history
    await tx.screenPairing.deleteMany({
      where: { screenId: id },
    });

    // 4. Delete content assignments
    await tx.contentAssignment.deleteMany({
      where: { screenId: id },
    });

    // 5. Delete wallpaper assignments
    await tx.wallpaperAssignment.deleteMany({
      where: { screenId: id },
    });

    // 6. Delete pairing codes
    await tx.pairingCode.deleteMany({
      where: { screenId: id },
    });

    // 7. Finally, delete the screen
    return tx.screen.delete({
      where: { id },
    });
  });
};
export default {
  createScreen,
  getAllScreens,
  getScreenById,
  updateScreen,
  deleteScreen,
};