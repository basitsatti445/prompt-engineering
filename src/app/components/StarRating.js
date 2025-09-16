'use client';

import { useState } from 'react';

export default function StarRating({ 
  rating = 0, 
  maxRating = 5, 
  interactive = false, 
  size = 'md',
  onRatingChange = null,
  showValue = false 
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleClick = (newRating) => {
    if (interactive && onRatingChange) {
      setCurrentRating(newRating);
      onRatingChange(newRating);
    }
  };

  const handleMouseEnter = (newRating) => {
    if (interactive) {
      setHoverRating(newRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = interactive ? (hoverRating || currentRating) : rating;

  return (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-1">
        {Array.from({ length: maxRating }, (_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= displayRating;
          
          return (
            <button
              key={index}
              type="button"
              className={`${sizeClasses[size]} ${
                interactive ? 'cursor-pointer' : 'cursor-default'
              } transition-colors`}
              onClick={() => handleClick(starRating)}
              onMouseEnter={() => handleMouseEnter(starRating)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
            >
              <svg
                className={`${sizeClasses[size]} ${
                  isFilled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                } transition-colors`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export function StarRatingDisplay({ rating, maxRating = 5, size = 'md', showValue = true }) {
  return (
    <StarRating 
      rating={rating} 
      maxRating={maxRating} 
      size={size} 
      showValue={showValue}
      interactive={false}
    />
  );
}

export function StarRatingInput({ 
  value = 0, 
  onChange = null, 
  maxRating = 5, 
  size = 'lg',
  label = 'Rating' 
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <StarRating 
        rating={value} 
        maxRating={maxRating} 
        size={size} 
        interactive={true}
        onRatingChange={onChange}
        showValue={true}
      />
    </div>
  );
}
