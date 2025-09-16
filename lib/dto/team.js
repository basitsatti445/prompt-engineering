const Joi = require('joi');

// Create team DTO
const createTeamSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Team name must be at least 2 characters long',
      'string.max': 'Team name cannot exceed 100 characters',
      'any.required': 'Team name is required'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  contactEmail: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid contact email',
      'any.required': 'Contact email is required'
    }),
  website: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid website URL'
    }),
  members: Joi.array()
    .items(
      Joi.object({
        name: Joi.string()
          .trim()
          .min(2)
          .max(100)
          .required()
          .messages({
            'string.min': 'Member name must be at least 2 characters long',
            'string.max': 'Member name cannot exceed 100 characters',
            'any.required': 'Member name is required'
          }),
        role: Joi.string()
          .trim()
          .max(50)
          .allow('')
          .messages({
            'string.max': 'Member role cannot exceed 50 characters'
          })
      })
    )
    .max(10)
    .messages({
      'array.max': 'Cannot have more than 10 team members'
    })
});

// Update team DTO
const updateTeamSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Team name must be at least 2 characters long',
      'string.max': 'Team name cannot exceed 100 characters'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  contactEmail: Joi.string()
    .email()
    .messages({
      'string.email': 'Please provide a valid contact email'
    }),
  website: Joi.string()
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid website URL'
    }),
  members: Joi.array()
    .items(
      Joi.object({
        name: Joi.string()
          .trim()
          .min(2)
          .max(100)
          .required()
          .messages({
            'string.min': 'Member name must be at least 2 characters long',
            'string.max': 'Member name cannot exceed 100 characters',
            'any.required': 'Member name is required'
          }),
        role: Joi.string()
          .trim()
          .max(50)
          .allow('')
          .messages({
            'string.max': 'Member role cannot exceed 50 characters'
          })
      })
    )
    .max(10)
    .messages({
      'array.max': 'Cannot have more than 10 team members'
    })
}).min(1); // At least one field must be provided

module.exports = {
  createTeamSchema,
  updateTeamSchema
};
