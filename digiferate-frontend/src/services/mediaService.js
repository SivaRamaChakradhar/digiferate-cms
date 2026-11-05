import api from "./api";

// Get all content records, including their media assets
export const getAllMedia = async () => {
  const response = await api.get("/content");
  const contentItems = response.data.data || [];

  // Convert nested content assets into one flat media list
  return contentItems.flatMap((content) =>
    (content.assets || []).map((asset) => ({
      ...asset,
      contentId: content.id,
      contentTitle: content.title || "Untitled content",
    }))
  );
};

// Upload an image or video to a content record
export const uploadMedia = async (contentId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/content/${contentId}/assets`,
    formData
  );

  return response.data;
};

// Delete a media asset
export const deleteMedia = async (contentId, assetId) => {
  const response = await api.delete(
    `/content/${contentId}/assets/${assetId}`
  );

  return response.data;
};
