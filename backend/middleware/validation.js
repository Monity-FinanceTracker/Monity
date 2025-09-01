const Joi = require('joi');
const xss = require('xss');
const { logger } = require('../utils');

const xssOptions = {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
};

const sanitize = (value) => {
    if (typeof value !== 'string') return value;
    const cleaned = xss(value, xssOptions);
    return cleaned.trim();
};

const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            logger.warn('Validation failed', { errors, requestBody: req.body });
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        req[property] = value;
        next();
    };
};

const schemas = {
    signup: Joi.object({
        name: Joi.string().min(2).max(100).custom(sanitize).required(),
        email: Joi.string().email().max(255).required(),
        password: Joi.string().min(8).max(128).required()
    }),
    login: Joi.object({
        email: Joi.string().email().max(255).required(),
        password: Joi.string().min(6).max(128).required()
    }),
    transaction: Joi.object({
        description: Joi.string().min(1).max(500).custom(sanitize).required(),
        amount: Joi.number().positive().max(1000000).required(),
        category: Joi.string().min(1).max(100).custom(sanitize).required(),
        date: Joi.date().iso().max('now').required(),
        typeId: Joi.number().integer().valid(1, 2, 3).required()
    }),
    category: Joi.object({
        name: Joi.string().min(1).max(100).custom(sanitize).required(),
        typeId: Joi.number().integer().valid(1, 2, 3).required(),
        color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
        icon: Joi.string().max(50).custom(sanitize).optional()
    }),
};

module.exports = {
    validate,
    schemas
};
