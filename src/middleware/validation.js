const Joi = require('joi');

// Validate request body against a Joi schema
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((d) => d.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
    next();
  };
};

// Schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username cannot exceed 30 characters',
    'any.required': 'Username is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const habitSchema = Joi.object({
  name: Joi.string().max(100).required().messages({
    'any.required': 'Habit name is required',
    'string.max': 'Habit name cannot exceed 100 characters',
  }),
  description: Joi.string().max(500).allow('').optional(),
  category: Joi.string()
    .valid('health', 'fitness', 'mindfulness', 'learning', 'productivity', 'social', 'other')
    .optional(),
  frequency: Joi.string().valid('daily', 'weekly').optional(),
  targetDays: Joi.array().items(Joi.string()).optional(),
  color: Joi.string().optional(),
  icon: Joi.string().optional(),
});

const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  bio: Joi.string().max(200).allow('').optional(),
  avatar: Joi.string().allow('').optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  habitSchema,
  updateProfileSchema,
};
