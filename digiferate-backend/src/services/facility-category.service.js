import prisma from '../config/database.js';

const generateSlug = (name) => {
    return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const createCategory = async (data) => {
    const { name, description, sortOrder } = data;

    if(!name || !name.trim()) {
        throw new Error('Category name is required');
    }

    const slug = generateSlug(name);

    return prisma.facilityCategory.create({
        data: {
            name: name.trim(),
            slug,
            description,
            sortOrder: sortOrder ?? 0,
        }
    })
}

const getAllCategories = async () => {
    return prisma.facilityCategory.findMany({
        orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
        ],
        include: {
        _count: {
            select: { images: true },
        },
        },
    });
}

const getCategoryById = async (id) => {
  return prisma.facilityCategory.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
};

const updateCategory = async (id, data) => {
  const { name, description, sortOrder, isActive } = data;

  const updateData = {};

  if (name !== undefined) {
    if (!name.trim()) {
      throw new Error("Category name cannot be empty");
    }

    updateData.name = name.trim();
    updateData.slug = generateSlug(name);
  }

  if (description !== undefined) updateData.description = description;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
  if (isActive !== undefined) updateData.isActive = isActive;

  return prisma.facilityCategory.update({
    where: { id },
    data: updateData,
  });
};

const deleteCategory = async (id) => {
  return prisma.facilityCategory.delete({
    where: { id },
  });
};


export { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory };