const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
    const { financialProjectionsController } = controllers;

    router.post('/', financialProjectionsController.createProjection.bind(financialProjectionsController));
    router.get('/:goalId', financialProjectionsController.getProjection.bind(financialProjectionsController));

    return router;
};
