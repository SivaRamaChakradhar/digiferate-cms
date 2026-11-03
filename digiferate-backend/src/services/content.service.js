import prisma from "../config/database.js";

const createContent = async ({ title, message }) => {
  return prisma.content.create({
    data: {
      title: title?.trim() || null,
      message: message?.trim() || null,
    },
    include: {
      assets: true,
    },
  });
};

const getAllContent = async () => {
  return prisma.content.findMany({
    include: {
      assets: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getContentById = async (id) => {
  return prisma.content.findUnique({
    where: { id },
    include: {
      assets: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
};

const updateContent = async (id, data) => {
  return prisma.content.update({
    where: { id },
    data,
    include: {
      assets: true,
    },
  });
};

const archiveContent = async (id) => {
  return prisma.content.update({
    where: { id },
    data: {
      status: "ARCHIVED",
    },
  });
};

export default {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  archiveContent,
};