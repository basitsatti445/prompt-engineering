'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading, { LoadingCard } from '../../components/Loading';
import Error from '../../components/Error';
import PitchCard from '../../components/PitchCard';

export default function FounderDashboard() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [pitch, setPitch] = useState(null);
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

      if (parsedUser.role !== 'founder') {
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
      const token = localStorage.getItem('token');
      
      // Fetch user profile (includes team data)
      const profileResponse = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      
      if (profileData.success) {
        setUser(profileData.data);
        setTeam(profileData.data.team);
        
        // If team exists, fetch pitch data
        if (profileData.data.team) {
          fetchPitchData(profileData.data.team._id);
        } else {
          setIsLoading(false);
        }
      } else {
        throw new Error(profileData.message);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const fetchPitchData = async (teamId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch team details to get pitch
      const teamResponse = await fetch(`/api/teams/${teamId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        if (teamData.success && teamData.data.pitches && teamData.data.pitches.length > 0) {
          setPitch(teamData.data.pitches[0]);
        }
      }
    } catch (error) {
      console.error('Pitch fetch error:', error);
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
                <LoadingCard />
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
            Founder Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.name}! Manage your team and pitch here.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Team Status */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Team Status
              </h2>
              
              {team ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {team.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {team.description || 'No description provided'}
                      </p>
                    </div>
                    <Link
                      href={`/teams/${team._id}/edit`}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      Edit Team
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Contact:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{team.contactEmail}</span>
                    </div>
                    {team.website && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Website:</span>
                        <a 
                          href={team.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {team.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Team Created
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create a team to start submitting your pitch.
                  </p>
                  <Link
                    href="/teams/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Create Team
                  </Link>
                </div>
              )}
            </div>

            {/* Pitch Status */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Pitch Status
              </h2>
              
              {pitch ? (
                <div>
                  <PitchCard pitch={pitch} showTeamInfo={false} />
                  <div className="mt-4 flex space-x-4">
                    <Link
                      href={`/pitches/${pitch._id}/edit`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                    >
                      Edit Pitch
                    </Link>
                    <Link
                      href={`/pitches/${pitch._id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ) : team ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Pitch Submitted
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Submit your startup pitch to get started.
                  </p>
                  <Link
                    href="/pitches/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Submit Pitch
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    Create a team first to submit your pitch.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {!team && (
                  <Link
                    href="/teams/create"
                    className="block w-full text-left px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    Create Team
                  </Link>
                )}
                {team && !pitch && (
                  <Link
                    href="/pitches/create"
                    className="block w-full text-left px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Submit Pitch
                  </Link>
                )}
                <Link
                  href="/leaderboard"
                  className="block w-full text-left px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                >
                  View Leaderboard
                </Link>
                <Link
                  href="/pitches"
                  className="block w-full text-left px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                >
                  Browse Pitches
                </Link>
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
