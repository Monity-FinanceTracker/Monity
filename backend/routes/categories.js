const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { categoryController } = controllers;

    router.get('/', (req, res, next) => categoryController.getAllCategories(req, res, next));
    router.post('/', (req, res, next) => categoryController.createCategory(req, res, next));
    router.put('/:id', (req, res, next) => categoryController.updateCategory(req, res, next));
    router.delete('/:id', (req, res, next) => categoryController.deleteCategory(req, res, next));

    return router;
};
