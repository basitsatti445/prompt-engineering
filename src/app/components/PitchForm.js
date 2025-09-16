'use client';

import { useState } from 'react';
import StarRatingInput from './StarRating';

export default function PitchForm({ 
  initialData = null, 
  onSubmit, 
  isLoading = false,
  submitText = 'Submit Pitch'
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    oneLiner: initialData?.oneLiner || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    stage: initialData?.stage || ''
  });
  const [errors, setErrors] = useState({});

  const categories = [
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
  ];

  const stages = [
    'Idea',
    'MVP',
    'Early Stage',
    'Growth Stage',
    'Established'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (!formData.oneLiner.trim()) {
      newErrors.oneLiner = 'One-liner is required';
    } else if (formData.oneLiner.trim().length < 10) {
      newErrors.oneLiner = 'One-liner must be at least 10 characters long';
    } else if (formData.oneLiner.trim().length > 300) {
      newErrors.oneLiner = 'One-liner cannot exceed 300 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters long';
    } else if (formData.description.trim().length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.stage) {
      newErrors.stage = 'Please select a stage';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {initialData ? 'Edit Pitch' : 'Create New Pitch'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {initialData ? 'Update your pitch information' : 'Tell us about your startup idea'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pitch Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.title 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white'
              }`}
              placeholder="Enter a compelling title for your pitch"
              maxLength={200}
            />
            <div className="mt-1 flex justify-between">
              {errors.title ? (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.title}</p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Be specific and attention-grabbing
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formData.title.length}/200
              </p>
            </div>
          </div>

          {/* One-liner */}
          <div>
            <label htmlFor="oneLiner" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              One-liner *
            </label>
            <textarea
              id="oneLiner"
              name="oneLiner"
              rows={3}
              value={formData.oneLiner}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.oneLiner 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white'
              }`}
              placeholder="Describe your startup in one compelling sentence"
              maxLength={300}
            />
            <div className="mt-1 flex justify-between">
              {errors.oneLiner ? (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.oneLiner}</p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Summarize your value proposition clearly
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formData.oneLiner.length}/300
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={8}
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.description 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white'
              }`}
              placeholder="Provide a detailed description of your startup, including the problem you're solving, your solution, target market, and business model"
              maxLength={2000}
            />
            <div className="mt-1 flex justify-between">
              {errors.description ? (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Include problem, solution, market, and business model
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formData.description.length}/2000
              </p>
            </div>
          </div>

          {/* Category and Stage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.category 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="stage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Development Stage *
              </label>
              <select
                id="stage"
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.stage 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white'
                }`}
              >
                <option value="">Select a stage</option>
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
              {errors.stage && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.stage}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {initialData ? 'Updating...' : 'Submitting...'}
                </div>
              ) : (
                submitText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
