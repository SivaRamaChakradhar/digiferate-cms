import {
    createCategoryController,
    getAllCategoriesController,
    getCategoryByIdController,
    updateCategoryController,
    deleteCategoryController
} from '../controllers/facility-category.controller.js';

import express from 'express';

const router = express.Router();

router.post('/', createCategoryController);
router.get('/', getAllCategoriesController);
router.get('/:id', getCategoryByIdController);
router.patch('/:id', updateCategoryController);
router.delete('/:id', deleteCategoryController);

export default router;