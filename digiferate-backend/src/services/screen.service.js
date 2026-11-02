import prisma from "../config/database.js";

const createScreen = async (data) => {
  return prisma.screen.create({
    data: {
      customName: data.customName.trim(),
      area: data.area.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      country: data.country.trim(),
    },
  });
};

const getAllScreens = async () => {
  return prisma.screen.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getScreenById = async (id) => {
  return prisma.screen.findUnique({
    where: { id },
  });
};

const updateScreen = async (id, data) => {
  return prisma.screen.update({
    where: { id },
    data,
  });
};

const deleteScreen = async (id) => {
  return prisma.screen.delete({
    where: { id },
  });
};

export default {
  createScreen,
  getAllScreens,
  getScreenById,
  updateScreen,
  deleteScreen,
};