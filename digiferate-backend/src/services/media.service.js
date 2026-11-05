
import prisma from "../config/database.js";
import supabase from "../config/supabase.js";
import crypto from "node:crypto";
import path from "node:path";

const BUCKET_NAME = "digiferate-media";

const uploadToSupabase = async (file, contentId) => {
  const extension = path.extname(file.originalname);
  const fileName = `${crypto.randomUUID()}${extension}`;
  const storagePath = `content/${contentId}/${fileName}`;

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

  // 2. Determine asset type
  const assetType = file.mimetype.startsWith("image/")
    ? "IMAGE"
    : "VIDEO";

  // 3. Upload file to Supabase Storage
  const uploadedFile = await uploadToSupabase(file, contentId);

  try {
    // 4. Save asset metadata in PostgreSQL
    const asset = await prisma.contentAsset.create({
      data: {
        contentId,
        assetType,
        fileName: file.originalname,
        url: uploadedFile.publicUrl,
        publicId: uploadedFile.storagePath,
        mimeType: file.mimetype,
        sizeBytes: BigInt(file.size),
      },
    });

    return asset;
  } catch (error) {
    // 5. Clean up Supabase Storage if database insertion fails
    const { error: cleanupError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([uploadedFile.storagePath]);

    if (cleanupError) {
      console.error("Supabase cleanup failed:", cleanupError);
    }

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

  // 2. Delete file from Supabase Storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([asset.publicId]);

  if (storageError) {
    throw new Error(
      `Failed to delete media from Supabase: ${storageError.message}`
    );
  }

  // 3. Delete metadata from PostgreSQL
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
