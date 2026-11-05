
import prisma from "../config/database.js";
import supabase from "../config/supabase.js";
import crypto from "node:crypto";
import path from "node:path";

const BUCKET_NAME = "digiferate-media";

const uploadToSupabase = async (file) => {
  const extension = path.extname(file.originalname);
  const fileName = `${crypto.randomUUID()}${extension}`;
  const storagePath = `wallpapers/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    storagePath: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
};

const uploadWallpaper = async (name, file) => {
  if (!name || !name.trim()) {
    const error = new Error("Wallpaper name is required");
    error.statusCode = 400;
    throw error;
  }

  // 1. Upload image to Supabase Storage
  const uploadedImage = await uploadToSupabase(file);

  try {
    // 2. Save wallpaper metadata in PostgreSQL
    const wallpaper = await prisma.wallpaper.create({
      data: {
        name: name.trim(),
        imageUrl: uploadedImage.publicUrl,
        publicId: uploadedImage.storagePath,
      },
    });

    return wallpaper;
  } catch (error) {
    // 3. Clean up Supabase Storage if database insertion fails
    const { error: cleanupError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([uploadedImage.storagePath]);

    if (cleanupError) {
      console.error("Supabase cleanup failed:", cleanupError);
    }

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

  // 1. Delete image from Supabase Storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([wallpaper.publicId]);

  if (storageError) {
    throw new Error(
      `Failed to delete wallpaper from Supabase: ${storageError.message}`
    );
  }

  // 2. Delete wallpaper record from PostgreSQL
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
