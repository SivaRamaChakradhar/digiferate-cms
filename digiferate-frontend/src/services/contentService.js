import api from "./api";

export const getContent = async () => {
  const response = await api.get("/content");
  return response.data;
};

export const getContentById = async (id) => {
  const response = await api.get(`/content/${id}`);
  return response.data;
};

export const createContent = async (contentData) => {
  const response = await api.post("/content", contentData);
  return response.data;
};

export const updateContent = async (id, contentData) => {
  const response = await api.patch(`/content/${id}`, contentData);
  return response.data;
};

export const archiveContent = async (id) => {
  const response = await api.patch(`/content/${id}/archive`);
  return response.data;
};