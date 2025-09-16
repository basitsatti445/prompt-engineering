'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading, { LoadingCard } from '../../components/Loading';
import Error from '../../components/Error';
import PitchCard from '../../components/PitchCard';

export default function ReviewerDashboard() {
  const [user, setUser] = useState(null);
  const [recentPitches, setRecentPitches] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/signin');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      if (parsedUser.role !== 'reviewer') {
        router.push('/');
        return;
      }

      fetchDashboardData();
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/auth/signin');
    }
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch recent pitches and stats in parallel
      const [pitchesResponse, statsResponse] = await Promise.all([
        fetch('/api/pitches?limit=6&sortBy=newest'),
        fetch('/api/leaderboard/stats')
      ]);

      if (pitchesResponse.ok) {
        const pitchesData = await pitchesResponse.json();
        if (pitchesData.success) {
          setRecentPitches(pitchesData.data);
        }
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <LoadingCard />
                  <LoadingCard />
                </div>
              </div>
              <div>
                <LoadingCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Error 
            title="Dashboard Error"
            message={error}
            onRetry={fetchDashboardData}
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
            Reviewer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.name}! Discover and rate innovative startup pitches.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Pitches */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Pitches
                </h2>
                <Link
                  href="/pitches"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  View All →
                </Link>
              </div>
              
              {recentPitches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentPitches.map((pitch) => (
                    <PitchCard key={pitch._id} pitch={pitch} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Pitches Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No pitches have been submitted yet. Check back later!
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/pitches"
                  className="flex items-center p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Browse Pitches</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Discover new startup ideas</p>
                  </div>
                </Link>
                
                <Link
                  href="/leaderboard"
                  className="flex items-center p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Leaderboard</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View top-rated pitches</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Platform Stats */}
            {stats && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Platform Stats
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

            {/* Reviewer Guidelines */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Review Guidelines
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Rate pitches on innovation, market potential, and execution feasibility</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Provide constructive feedback to help founders improve</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Be fair and objective in your evaluations</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Rate limit: 10 votes per minute</p>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Info
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Name:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{user?.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Email:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{user?.email}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Role:</span>
                  <span className="ml-2 text-gray-900 dark:text-white capitalize">{user?.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-4 w-full text-left px-4 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900 hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
