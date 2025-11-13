const Joi = require('joi');
const xss = require('xss');
const { logger } = require('../utils');
<<<<<<< HEAD
<<<<<<< HEAD
const { emailValidationService } = require('../services');
=======
=======
>>>>>>> 358f1f6517ea7c6b697ad4b44c8a7e1bbbaac84f
const EmailValidationService = require('../services/emailValidationService');

// Create instance to avoid circular dependency issues
const emailValidationService = new EmailValidationService();
<<<<<<< HEAD
>>>>>>> 429196b016bd09c16635c353a0eb531e2033f047
=======
>>>>>>> 358f1f6517ea7c6b697ad4b44c8a7e1bbbaac84f

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

// Cache em memória para validações de email (previne abuse)
const emailValidationCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

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
        const normalizedEmail = email.trim().toLowerCase();
        
        // Verificar cache primeiro (evita múltiplas validações DNS)
        const cached = emailValidationCache.get(normalizedEmail);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            if (!cached.isValid) {
                return res.status(400).json({
                    success: false,
                    error: cached.reason,
                    details: cached.details?.step
                });
            }
            req.body.email = normalizedEmail;
            return next();
        }

        const validation = await emailValidationService.validateEmail(email);

        // Cachear resultado (válido ou inválido)
        emailValidationCache.set(normalizedEmail, {
            ...validation,
            timestamp: Date.now()
        });

        // Limpar cache antigo periodicamente
        if (emailValidationCache.size > 10000) {
            const now = Date.now();
            for (const [key, value] of emailValidationCache.entries()) {
                if (now - value.timestamp > CACHE_TTL) {
                    emailValidationCache.delete(key);
                }
            }
        }

        if (!validation.isValid) {
            logger.warn('Email validation blocked registration', {
                email: normalizedEmail,
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
        req.body.email = validation.details.email;
        next();

    } catch (error) {
        logger.error('Error in email validation middleware', {
            error: error.message,
<<<<<<< HEAD
<<<<<<< HEAD
            email
        });

        // Em caso de erro, permitir mas logar (fail-safe)
        next();
=======
            stack: error.stack,
            email
        });

=======
            stack: error.stack,
            email
        });

>>>>>>> 358f1f6517ea7c6b697ad4b44c8a7e1bbbaac84f
        // Em caso de erro crítico na validação, retornar erro amigável
        // Fail-safe: em erros de validação, é melhor bloquear do que permitir
        return res.status(500).json({
            success: false,
            error: 'Erro ao validar email. Por favor, tente novamente.',
            details: 'Erro temporário no sistema de validação'
        });
<<<<<<< HEAD
>>>>>>> 429196b016bd09c16635c353a0eb531e2033f047
=======
>>>>>>> 358f1f6517ea7c6b697ad4b44c8a7e1bbbaac84f
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
