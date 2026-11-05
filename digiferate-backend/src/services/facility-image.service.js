
import prisma from '../config/database.js';
import supabase from '../config/supabase.js';
import crypto from 'node:crypto';
import path from 'node:path';

const BUCKET_NAME = 'digiferate-media';

const uploadFacilityImageToSupabase = async (file, categoryId) => {
  const extension = path.extname(file.originalname) || '.jpg';
  const filePath = `facility-images/${categoryId}/${crypto.randomUUID()}${extension}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload facility image: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    imageUrl: publicUrlData.publicUrl,
    publicId: data.path,
  };
};

export const uploadFacilityImage = async (categoryId, file, data) => {
  if (!file) {
    throw new Error("Please select an image");
  }

  const category = await prisma.facilityCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new Error("Facility category not found");
  }

  if (!category.isActive) {
    throw new Error("Cannot upload images to an inactive category");
  }

  const uploadedImage = await uploadFacilityImageToSupabase(file, categoryId);

  try {
    const facilityImage = await prisma.facilityImage.create({
      data: {
        title: data.title || null,
        altText: data.altText || null,
        sortOrder: data.sortOrder
          ? Number(data.sortOrder)
          : 0,
        categoryId,
        imageUrl: uploadedImage.imageUrl,
        publicId: uploadedImage.publicId,
      },
    });

    return facilityImage;
  } catch (error) {
    const { error: cleanupError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([uploadedImage.publicId]);

    if (cleanupError) {
      console.error("Supabase cleanup failed:", cleanupError);
    }

    throw error;
  }
};

export const getFacilityImagesByCategory = async (categoryId) => {
  const category = await prisma.facilityCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new Error("Facility category not found");
  }

  return prisma.facilityImage.findMany({
    where: { categoryId },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });
};

// Update facility image details
export const updateFacilityImage = async (id, data) => {
  const updateData = {};

  if (Object.hasOwn(data, "title")) {
    updateData.title = data.title;
  }

  if (Object.hasOwn(data, "altText")) {
    updateData.altText = data.altText;
  }

  if (Object.hasOwn(data, "sortOrder")) {
    const sortOrder = Number(data.sortOrder);

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      throw new Error("sortOrder must be a non-negative integer");
    }

    updateData.sortOrder = sortOrder;
  }

  if (Object.hasOwn(data, "isActive")) {
    if (typeof data.isActive !== "boolean") {
      throw new Error("isActive must be a boolean");
    }

    updateData.isActive = data.isActive;
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("Provide at least one field to update");
  }

  return prisma.facilityImage.update({
    where: { id },
    data: updateData,
  });
};

// Delete facility image from Supabase Storage and database
export const deleteFacilityImage = async (id) => {
  const image = await prisma.facilityImage.findUnique({
    where: { id },
  });

  if (!image) {
    throw new Error("Facility image not found");
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([image.publicId]);

  if (error) {
    throw new Error(`Failed to delete facility image: ${error.message}`);
  }

  await prisma.facilityImage.delete({
    where: { id },
  });

  return image;
};
