import api from "./api";

// Get all screens
export const getScreens = async () => {
  const response = await api.get("/screens");
  return response.data;
};

// Create a screen
export const createScreen = async (screenData) => {
  const response = await api.post("/screens", screenData);
  return response.data;
};

// Get screen by ID
export const getScreenById = async (id) => {
  const response = await api.get(`/screens/${id}`);
  return response.data;
};

// Generate pairing code
export const generatePairingCode = async (id) => {
  const response = await api.post(`/screens/${id}/pairing-code`);
  return response.data;
};

// Get pairing details
export const getScreenPairing = async (id) => {
  const response = await api.get(`/screens/${id}/pairing`);
  return response.data;
};

// Unpair screen
export const unpairScreen = async (id) => {
  const response = await api.post(`/screens/${id}/unpair`);
  return response.data;
};

// Delete screen
export const deleteScreen = async (id) => {
  const response = await api.delete(`/screens/${id}`);
  return response.data;
};