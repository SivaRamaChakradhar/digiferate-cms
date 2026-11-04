import prisma from '../config/database.js';
import cloudinary from '../config/cloudinary.js';

const uploadFacilityImageToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'facility_images',
                resource_type: 'image',
            },
            (error, result) => {
                if(error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        uploadStream.end(file.buffer);
    });
}

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

  const uploadedImage = await uploadFacilityImageToCloudinary(file);

  try {
    const facilityImage = await prisma.facilityImage.create({
      data: {
        title: data.title || null,
        altText: data.altText || null,
        sortOrder: data.sortOrder
          ? Number(data.sortOrder)
          : 0,
        categoryId,
        imageUrl: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      },
    });

    return facilityImage;
  } catch (error) {
    // Avoid leaving an orphaned Cloudinary image
    await cloudinary.uploader.destroy(uploadedImage.public_id, {
      resource_type: "image",
    });

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

// Delete facility image from Cloudinary and database
export const deleteFacilityImage = async (id) => {
  const image = await prisma.facilityImage.findUnique({
    where: { id },
  });

  if (!image) {
    throw new Error("Facility image not found");
  }

  const cloudinaryResult = await cloudinary.uploader.destroy(
    image.publicId,
    { resource_type: "image" }
  );

  // "not found" means the Cloudinary asset is already absent.
  // We can still clean up its database record.
  if (
    cloudinaryResult.result !== "ok" &&
    cloudinaryResult.result !== "not found"
  ) {
    throw new Error("Failed to delete image from Cloudinary");
  }

  await prisma.facilityImage.delete({
    where: { id },
  });

  return image;
};