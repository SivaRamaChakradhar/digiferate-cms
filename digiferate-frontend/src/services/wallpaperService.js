import api from "./api";

// Get all wallpapers
export const getWallpapers = async () => {
  const response = await api.get("/wallpapers");
  return response.data;
};

// Get one wallpaper
export const getWallpaperById = async (id) => {
  const response = await api.get(`/wallpapers/${id}`);
  return response.data;
};

// Upload a new wallpaper
export const uploadWallpaper = async (name, file) => {
  const formData = new FormData();

  formData.append("name", name);
  formData.append("file", file);

  const response = await api.post("/wallpapers", formData);
  return response.data;
};

// Update wallpaper details
export const updateWallpaper = async (id, data) => {
  const response = await api.patch(`/wallpapers/${id}`, data);
  return response.data;
};

// Delete wallpaper
export const deleteWallpaper = async (id) => {
  const response = await api.delete(`/wallpapers/${id}`);
  return response.data;
};

// Activate or deactivate wallpaper
export const updateWallpaperStatus = async (id, isActive) => {
  const response = await api.patch(`/wallpapers/${id}/status`, {
    isActive,
  });
  return response.data;
};

// Assign wallpaper to a screen
export const assignWallpaperToScreen = async (screenId, wallpaperId) => {
  const response = await api.post(`/screens/${screenId}/wallpaper`, {
    wallpaperId,
  });
  return response.data;
};

// Get the wallpaper assigned to a screen
export const getScreenWallpaper = async (screenId) => {
  const response = await api.get(`/screens/${screenId}/wallpaper`);
  return response.data;
};

// Remove wallpaper assignment from a screen
export const removeScreenWallpaper = async (screenId) => {
  const response = await api.delete(`/screens/${screenId}/wallpaper`);
  return response.data;
};