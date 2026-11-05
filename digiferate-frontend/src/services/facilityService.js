import api from "./api";

// --------------------
// Facility Categories
// --------------------

export const getFacilityCategories = async () => {
  const response = await api.get("/facility-categories");
  return response.data;
};

export const getFacilityCategoryById = async (id) => {
  const response = await api.get(`/facility-categories/${id}`);
  return response.data;
};

export const createFacilityCategory = async (data) => {
  const response = await api.post("/facility-categories", data);
  return response.data;
};

export const updateFacilityCategory = async (id, data) => {
  const response = await api.patch(`/facility-categories/${id}`, data);
  return response.data;
};

export const deleteFacilityCategory = async (id) => {
  const response = await api.delete(`/facility-categories/${id}`);
  return response.data;
};

// --------------------
// Facility Images
// --------------------

export const getFacilityImages = async (categoryId) => {
  const response = await api.get(
    `/facility-categories/${categoryId}/images`
  );
  return response.data;
};

export const uploadFacilityImage = async (categoryId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/facility-categories/${categoryId}/images`,
    formData
  );

  return response.data;
};

export const updateFacilityImage = async (imageId, data) => {
  const response = await api.patch(`/facility-images/${imageId}`, data);
  return response.data;
};

export const deleteFacilityImage = async (imageId) => {
  const response = await api.delete(`/facility-images/${imageId}`);
  return response.data;
};