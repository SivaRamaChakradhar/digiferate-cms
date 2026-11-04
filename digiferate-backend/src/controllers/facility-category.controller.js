import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from '../services/facility-category.service.js';

const createCategoryController = async (req, res) => {
    try {
        const category = await createCategory(req.body);
        res.status(201).json({
            message: "Facility category created successfully",
            data: category,
        });
    }catch (error) {
        res.status(400).json({message: error.message});
    }
}

const getAllCategoriesController = async (req, res) => {
    try {
        const categories = await getAllCategories();
        res.status(200).json({
            categories,
        });
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

const getCategoryByIdController = async (req, res) => {
    try {
        const category = await getCategoryById(req.params.id);

        if(!category){
            return res.status(404).json({
                message: "Facility category not found",
            })
        }

        res.status(200).json({
            category,
        })
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
}

const updateCategoryController = async (req, res) => {
  try {
    const category = await updateCategory(
      req.params.id,
      req.body
    );

    res.status(200).json({
      message: "Facility category updated successfully",
      category,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCategoryController = async (req, res) => {
  try {
    await deleteCategory(req.params.id);

    res.status(200).json({
      message: "Facility category deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export { createCategoryController, getAllCategoriesController, getCategoryByIdController, updateCategoryController, deleteCategoryController };