const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: error.details.map(d => d.message)
        });
    }
    next();
};

const schemas = {
    // Example schema
    createUser: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        name: Joi.string().required()
    })
};

module.exports = {
    validate,
    schemas
};
