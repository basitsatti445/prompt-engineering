'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Startup Pitch Showcase
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/pitches" 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Browse Pitches
            </Link>
            <Link 
              href="/leaderboard" 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Leaderboard
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href={user.role === 'founder' ? '/founder/dashboard' : '/reviewer/dashboard'}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/auth/signin"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-slate-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/" 
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/pitches" 
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Pitches
              </Link>
              <Link 
                href="/leaderboard" 
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Leaderboard
              </Link>
              
              {user ? (
                <>
                  <Link 
                    href={user.role === 'founder' ? '/founder/dashboard' : '/reviewer/dashboard'}
                    className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="px-3 py-2 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/signin"
                    className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
