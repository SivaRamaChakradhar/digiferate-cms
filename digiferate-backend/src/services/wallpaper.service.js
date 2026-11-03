import prisma from "../config/database.js";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "digiferate/wallpapers",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
};

const uploadWallpaper = async (name, file) => {
  if (!name || !name.trim()) {
    const error = new Error("Wallpaper name is required");
    error.statusCode = 400;
    throw error;
  }

  // Upload image to Cloudinary
  const uploadedImage = await uploadToCloudinary(file);

  try {
    // Save wallpaper metadata in PostgreSQL
    const wallpaper = await prisma.wallpaper.create({
      data: {
        name: name.trim(),
        imageUrl: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      },
    });

    return wallpaper;
  } catch (error) {
    // Clean up Cloudinary if database insertion fails
    await cloudinary.uploader.destroy(uploadedImage.public_id, {
      resource_type: "image",
    }).catch((cleanupError) => {
      console.error("Cloudinary cleanup failed:", cleanupError);
    });

    throw error;
  }
};

const getAllWallpapers = async () => {
  return await prisma.wallpaper.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getWallpaperById = async (id) => {
  const wallpaper = await prisma.wallpaper.findUnique({
    where: { id },
  });

  if (!wallpaper) {
    const error = new Error("Wallpaper not found");
    error.statusCode = 404;
    throw error;
  }

  return wallpaper;
};

const updateWallpaper = async (id, data) => {
  const wallpaper = await prisma.wallpaper.findUnique({
    where: { id },
  });

  if (!wallpaper) {
    const error = new Error("Wallpaper not found");
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  if (data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      const error = new Error("Wallpaper name cannot be empty");
      error.statusCode = 400;
      throw error;
    }

    updateData.name = data.name.trim();
  }

  if (Object.keys(updateData).length === 0) {
    const error = new Error("No valid fields provided for update");
    error.statusCode = 400;
    throw error;
  }

  return await prisma.wallpaper.update({
    where: { id },
    data: updateData,
  });
};

const deleteWallpaper = async (id) => {
  const wallpaper = await prisma.wallpaper.findUnique({
    where: { id },
    include: {
      assignments: {
        where: {
          removedAt: null,
        },
      },
    },
  });

  if (!wallpaper) {
    const error = new Error("Wallpaper not found");
    error.statusCode = 404;
    throw error;
  }

  if (wallpaper.assignments.length > 0) {
    const error = new Error(
      "Cannot delete wallpaper while it is assigned to screens. Remove assignments first."
    );
    error.statusCode = 409;
    throw error;
  }

  // Delete image from Cloudinary
  const result = await cloudinary.uploader.destroy(
    wallpaper.publicId,
    {
      resource_type: "image",
    }
  );

  if (!["ok", "not found"].includes(result.result)) {
    throw new Error("Failed to delete wallpaper from Cloudinary");
  }

  // Delete wallpaper record from PostgreSQL
  await prisma.wallpaper.delete({
    where: { id },
  });

  return {
    id: wallpaper.id,
    name: wallpaper.name,
  };
};

const updateWallpaperStatus = async (id, isActive) => {
  if (typeof isActive !== "boolean") {
    const error = new Error("isActive must be a boolean");
    error.statusCode = 400;
    throw error;
  }

  const wallpaper = await prisma.wallpaper.findUnique({
    where: { id },
  });

  if (!wallpaper) {
    const error = new Error("Wallpaper not found");
    error.statusCode = 404;
    throw error;
  }

  const updatedWallpaper = await prisma.wallpaper.update({
    where: { id },
    data: { isActive },
  });

  return updatedWallpaper;
};

export { 
    uploadWallpaper, 
    getAllWallpapers, 
    getWallpaperById, 
    updateWallpaper, 
    deleteWallpaper,
    updateWallpaperStatus,
 };