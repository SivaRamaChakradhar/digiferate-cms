import prisma from "../config/database.js";

const assignWallpaperToScreen = async (screenId, wallpaperId) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Check screen
    const screen = await tx.screen.findUnique({
      where: { id: screenId },
    });

    if (!screen) {
      const error = new Error("Screen not found");
      error.statusCode = 404;
      throw error;
    }

    // 2. Check wallpaper
    const wallpaper = await tx.wallpaper.findUnique({
      where: { id: wallpaperId },
    });

    if (!wallpaper) {
      const error = new Error("Wallpaper not found");
      error.statusCode = 404;
      throw error;
    }

    if (!wallpaper.isActive) {
      const error = new Error("Cannot assign an inactive wallpaper");
      error.statusCode = 400;
      throw error;
    }

    // 3. Remove previous active assignment
    await tx.wallpaperAssignment.updateMany({
      where: {
        screenId,
        removedAt: null,
      },
      data: {
        removedAt: new Date(),
      },
    });

    // 4. Create new assignment
    const assignment = await tx.wallpaperAssignment.create({
      data: {
        screenId,
        wallpaperId,
      },
      include: {
        wallpaper: true,
        screen: true,
      },
    });

    return assignment;
  });
};

const getScreenWallpaper = async (screenId) => {
  const screen = await prisma.screen.findUnique({
    where: { id: screenId },
  });

  if (!screen) {
    const error = new Error("Screen not found");
    error.statusCode = 404;
    throw error;
  }

  const assignment = await prisma.wallpaperAssignment.findFirst({
    where: {
      screenId,
      removedAt: null,
    },
    include: {
      wallpaper: true,
    },
  });

  return assignment;
};

const removeScreenWallpaper = async (screenId) => {
  return await prisma.$transaction(async (tx) => {
    const screen = await tx.screen.findUnique({
      where: { id: screenId },
    });

    if (!screen) {
      const error = new Error("Screen not found");
      error.statusCode = 404;
      throw error;
    }

    const assignment = await tx.wallpaperAssignment.findFirst({
      where: {
        screenId,
        removedAt: null,
      },
    });

    if (!assignment) {
      const error = new Error("No active wallpaper assignment found");
      error.statusCode = 404;
      throw error;
    }

    await tx.wallpaperAssignment.update({
      where: { id: assignment.id },
      data: {
        removedAt: new Date(),
      },
    });

    return assignment;
  });
};

export {
  assignWallpaperToScreen,
  getScreenWallpaper,
  removeScreenWallpaper,
};