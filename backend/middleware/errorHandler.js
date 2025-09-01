const { logger } = require('../utils');
const { NODE_ENV } = require('../config');

const errorHandler = (err, req, res, next) => {
    logger.error(err.message, {
        stack: err.stack,
        path: req.path,
        method: req.method,
        user: req.user ? req.user.id : 'anonymous'
    });

    const statusCode = err.statusCode || 500;
    const response = {
        success: false,
        message: err.message || 'Internal Server Error',
        ...(NODE_ENV === 'development' && { stack: err.stack })
    };

    res.status(statusCode).json(response);
};

const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Not Found - ${req.method} ${req.originalUrl}`
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};
