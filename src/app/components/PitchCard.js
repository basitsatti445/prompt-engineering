'use client';

import Link from 'next/link';
import StarRatingDisplay from './StarRating';

export default function PitchCard({ pitch, showTeamInfo = true }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Healthcare': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Finance': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Education': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'E-commerce': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Social Impact': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Entertainment': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Food & Beverage': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Transportation': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category] || colors['Other'];
  };

  const getStageColor = (stage) => {
    const colors = {
      'Idea': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'MVP': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Early Stage': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Growth Stage': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Established': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[stage] || colors['Idea'];
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {pitch.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
              {pitch.oneLiner}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <StarRatingDisplay 
                rating={pitch.averageRating} 
                size="sm" 
                showValue={true}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({pitch.totalVotes} votes)
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(pitch.category)}`}>
            {pitch.category}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(pitch.stage)}`}>
            {pitch.stage}
          </span>
        </div>

        {/* Team Info */}
        {showTeamInfo && pitch.team && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                {pitch.team.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {pitch.team.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                by {pitch.team.founder?.name}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span>Submitted {formatDate(pitch.createdAt)}</span>
          {pitch.weightedScore > 0 && (
            <span className="font-medium">
              Score: {pitch.weightedScore.toFixed(2)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            href={`/pitches/${pitch._id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            View Details
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {pitch.totalVotes} views
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PitchCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 animate-pulse">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
          </div>
          <div className="ml-4">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-16"></div>
        </div>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}
