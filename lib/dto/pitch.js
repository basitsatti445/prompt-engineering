const Joi = require('joi');

// Create pitch DTO
const createPitchSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.min': 'Pitch title must be at least 5 characters long',
      'string.max': 'Pitch title cannot exceed 200 characters',
      'any.required': 'Pitch title is required'
    }),
  oneLiner: Joi.string()
    .trim()
    .min(10)
    .max(300)
    .required()
    .messages({
      'string.min': 'One-liner must be at least 10 characters long',
      'string.max': 'One-liner cannot exceed 300 characters',
      'any.required': 'One-liner is required'
    }),
  description: Joi.string()
    .trim()
    .min(50)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Description must be at least 50 characters long',
      'string.max': 'Description cannot exceed 2000 characters',
      'any.required': 'Description is required'
    }),
  category: Joi.string()
    .valid(
      'Technology',
      'Healthcare',
      'Finance',
      'Education',
      'E-commerce',
      'Social Impact',
      'Entertainment',
      'Food & Beverage',
      'Transportation',
      'Other'
    )
    .required()
    .messages({
      'any.only': 'Please select a valid category',
      'any.required': 'Category is required'
    }),
  stage: Joi.string()
    .valid('Idea', 'MVP', 'Early Stage', 'Growth Stage', 'Established')
    .required()
    .messages({
      'any.only': 'Please select a valid stage',
      'any.required': 'Stage is required'
    }),
  demoUrl: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'Demo URL must be a valid HTTP/HTTPS URL',
      'any.required': 'Demo URL is required'
    }),
  deckUrl: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'Deck URL must be a valid HTTP/HTTPS URL',
      'any.required': 'Deck URL is required'
    })
});

// Update pitch DTO
const updatePitchSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .messages({
      'string.min': 'Pitch title must be at least 5 characters long',
      'string.max': 'Pitch title cannot exceed 200 characters'
    }),
  oneLiner: Joi.string()
    .trim()
    .min(10)
    .max(300)
    .messages({
      'string.min': 'One-liner must be at least 10 characters long',
      'string.max': 'One-liner cannot exceed 300 characters'
    }),
  description: Joi.string()
    .trim()
    .min(50)
    .max(2000)
    .messages({
      'string.min': 'Description must be at least 50 characters long',
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  category: Joi.string()
    .valid(
      'Technology',
      'Healthcare',
      'Finance',
      'Education',
      'E-commerce',
      'Social Impact',
      'Entertainment',
      'Food & Beverage',
      'Transportation',
      'Other'
    )
    .messages({
      'any.only': 'Please select a valid category'
    }),
  stage: Joi.string()
    .valid('Idea', 'MVP', 'Early Stage', 'Growth Stage', 'Established')
    .messages({
      'any.only': 'Please select a valid stage'
    }),
  demoUrl: Joi.string()
    .uri()
    .messages({
      'string.uri': 'Demo URL must be a valid HTTP/HTTPS URL'
    }),
  deckUrl: Joi.string()
    .uri()
    .messages({
      'string.uri': 'Deck URL must be a valid HTTP/HTTPS URL'
    })
}).min(1); // At least one field must be provided

// Vote DTO
const voteSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be a whole number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required'
    })
});

// Feedback DTO
const feedbackSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(10)
    .max(240)
    .required()
    .messages({
      'string.min': 'Feedback must be at least 10 characters long',
      'string.max': 'Feedback cannot exceed 240 characters',
      'any.required': 'Feedback content is required'
    })
});

// Query parameters for pitch listing
const pitchQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be a whole number',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be a whole number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 50'
    }),
  category: Joi.string()
    .valid(
      'Technology',
      'Healthcare',
      'Finance',
      'Education',
      'E-commerce',
      'Social Impact',
      'Entertainment',
      'Food & Beverage',
      'Transportation',
      'Other'
    )
    .messages({
      'any.only': 'Please select a valid category'
    }),
  stage: Joi.string()
    .valid('Idea', 'MVP', 'Early Stage', 'Growth Stage', 'Established')
    .messages({
      'any.only': 'Please select a valid stage'
    }),
  search: Joi.string()
    .trim()
    .max(100)
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  sortBy: Joi.string()
    .valid('newest', 'oldest', 'rating', 'votes', 'weighted')
    .default('newest')
    .messages({
      'any.only': 'Sort option must be one of: newest, oldest, rating, votes, weighted'
    })
});

module.exports = {
  createPitchSchema,
  updatePitchSchema,
  voteSchema,
  feedbackSchema,
  pitchQuerySchema
};
