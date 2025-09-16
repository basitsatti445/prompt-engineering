'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Loading, { LoadingGrid } from '../components/Loading';
import Error from '../components/Error';
import PitchCard from '../components/PitchCard';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    stage: '',
    timeRange: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/leaderboard?${params}`);
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/leaderboard/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

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

  const timeRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Error 
            title="Leaderboard Error"
            message={error}
            onRetry={fetchLeaderboard}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Discover the top-rated startup pitches ranked by our weighted scoring algorithm.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Filter Results
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stage
                  </label>
                  <select
                    value={filters.stage}
                    onChange={(e) => handleFilterChange('stage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">All Stages</option>
                    {stages.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Range
                  </label>
                  <select
                    value={filters.timeRange}
                    onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700 dark:text-white"
                  >
                    {timeRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Pitches
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Ranked by weighted score: average rating × log(total votes + 1)
                </p>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <LoadingGrid count={6} />
                ) : leaderboard.length > 0 ? (
                  <div className="space-y-6">
                    {leaderboard.map((entry, index) => (
                      <div key={entry.pitch.id} className="flex items-start space-x-4">
                        {/* Rank */}
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                            index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {entry.rank}
                          </div>
                        </div>

                        {/* Pitch Info */}
                        <div className="flex-1">
                          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                  {entry.pitch.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                  {entry.pitch.oneLiner}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                  <span>{entry.team.name}</span>
                                  <span>•</span>
                                  <span>{entry.pitch.category}</span>
                                  <span>•</span>
                                  <span>{entry.pitch.stage}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                  {entry.pitch.weightedScore.toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Weighted Score
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-6 text-sm">
                                <div className="flex items-center space-x-1">
                                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-gray-900 dark:text-white font-medium">
                                    {entry.pitch.averageRating.toFixed(1)}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    ({entry.pitch.totalVotes} votes)
                                  </span>
                                </div>
                              </div>
                              <Link
                                href={`/pitches/${entry.pitch.id}`}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Results Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Try adjusting your filters to see more results.
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Platform Stats */}
            {stats && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Platform Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Pitches</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats.totalPitches}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Teams</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats.totalTeams}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats.averages.rating.toFixed(1)} ⭐
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Votes</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stats.averages.votes.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Scoring Info */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How Scoring Works
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Our weighted scoring algorithm ensures fair ranking:
                </p>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                  <code className="text-blue-600 dark:text-blue-400 font-mono">
                    Score = Avg Rating × log(Votes + 1)
                  </code>
                </div>
                <p>
                  This formula balances rating quality with engagement volume, preventing new pitches from being buried while rewarding consistently high-rated content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
