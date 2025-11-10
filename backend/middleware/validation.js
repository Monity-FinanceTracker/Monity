const Joi = require('joi');
const xss = require('xss');
const { logger } = require('../utils');
const { emailValidationService } = require('../services');

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

// Middleware para validar email profundamente (bloqueia emails temporários e inválidos)
const validateEmailDeep = async (req, res, next) => {
    const email = req.body.email;

    if (!email) {
        return res.status(400).json({
            success: false,
            error: 'Email é obrigatório'
        });
    }

    try {
        const validation = await emailValidationService.validateEmail(email);

        if (!validation.isValid) {
            logger.warn('Email validation blocked registration', {
                email,
                reason: validation.reason,
                details: validation.details
            });

            return res.status(400).json({
                success: false,
                error: validation.reason,
                details: validation.details?.step
            });
        }

        // Email válido, normalizar e continuar
        req.body.email = validation.details.email; // Email normalizado (lowercase, trimmed)
        next();

    } catch (error) {
        logger.error('Error in email validation middleware', {
            error: error.message,
            email
        });

        // Em caso de erro, permitir mas logar (fail-safe)
        next();
    }
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
    validateEmailDeep,
    schemas
};
