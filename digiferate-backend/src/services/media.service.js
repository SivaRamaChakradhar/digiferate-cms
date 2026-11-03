import prisma from "../config/database.js";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "digiferate/content",
        resource_type: "auto",
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

const uploadContentAsset = async (contentId, file) => {
  // 1. Check whether content exists
  const content = await prisma.content.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    const error = new Error("Content not found");
    error.statusCode = 404;
    throw error;
  }

  // 2. Upload file to Cloudinary
  const uploadedFile = await uploadToCloudinary(file);

  // 3. Determine asset type
  const assetType = file.mimetype.startsWith("image/")
    ? "IMAGE"
    : "VIDEO";

  try {
    // 4. Save asset metadata in PostgreSQL
    const asset = await prisma.contentAsset.create({
      data: {
        contentId,
        assetType,
        fileName: file.originalname,
        url: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
        mimeType: file.mimetype,
        sizeBytes: BigInt(file.size),
      },
    });

    return asset;
  } catch (error) {
    // 5. Clean up Cloudinary if database insertion fails
    await cloudinary.uploader.destroy(uploadedFile.public_id, {
      resource_type: uploadedFile.resource_type,
    }).catch((cleanupError) => {
      console.error("Cloudinary cleanup failed:", cleanupError);
    });

    throw error;
  }
};

const deleteContentAsset = async (contentId, assetId) => {
  // 1. Find asset and verify it belongs to this content
  const asset = await prisma.contentAsset.findFirst({
    where: {
      id: assetId,
      contentId,
    },
  });

  if (!asset) {
    const error = new Error("Media asset not found");
    error.statusCode = 404;
    throw error;
  }

  // 2. Determine Cloudinary resource type
  const resourceType =
    asset.assetType === "VIDEO" ? "video" : "image";

  // 3. Delete from Cloudinary
  const result = await cloudinary.uploader.destroy(
    asset.publicId,
    {
      resource_type: resourceType,
    }
  );

  if (!["ok", "not found"].includes(result.result)) {
    throw new Error("Failed to delete media from Cloudinary");
  }

  // 4. Delete metadata from PostgreSQL
  await prisma.contentAsset.delete({
    where: {
      id: assetId,
    },
  });

  return {
    id: asset.id,
    publicId: asset.publicId,
  };
};

export { uploadContentAsset, deleteContentAsset };