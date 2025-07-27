'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { storageService } from '@/lib/storage';

function NavItem({ href, children, isActive, count }) {
  return (
    <Link 
      href={href}
      className={`relative px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
        isActive 
          ? 'bg-gray-900 text-white shadow-sm' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <span>{children}</span>
      {count !== undefined && count > 0 && (
        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
          isActive 
            ? 'bg-white text-gray-900' 
            : 'bg-gray-900 text-white'
        }`}>
          {count}
        </span>
      )}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [taskCounts, setTaskCounts] = useState({
    active: 0,
    completed: 0,
    total: 0
  });
  const { user, isLoading } = useUser();

  // Profile dropdown state
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (user) {
      const predictions = storageService.getPredictions();
      const activePredictions = storageService.getActivePredictions();
      const completedPredictions = storageService.getCompletedPredictions();
      
      setTaskCounts({
        active: activePredictions.length,
        completed: completedPredictions.length,
        total: predictions.length
      });
    } else {
      setTaskCounts({ active: 0, completed: 0, total: 0 });
    }
  }, [pathname, user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfile]);

  return (
    <header className="border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
              TimeCalibr
            </span>
          </Link>
          
          {/* Navigation or Login */}
          {user ? (
            <div className="flex items-center justify-between w-full ml-8">
              {/* Navigation Items - Centered */}
              <nav className="flex items-center space-x-1 flex-1 justify-center">
                <NavItem 
                  href="/predict" 
                  isActive={pathname === '/predict'}
                >
                  📝 Predict
                </NavItem>
                
                <NavItem 
                  href="/log" 
                  isActive={pathname === '/log'}
                  count={taskCounts.active}
                >
                  ✅ Log Tasks
                </NavItem>
                
                <NavItem 
                  href="/dashboard" 
                  isActive={pathname === '/dashboard'}
                  count={taskCounts.completed}
                >
                  📊 Dashboard
                </NavItem>

                {/* <NavItem 
                  href="/test" 
                  isActive={pathname === '/test'}
                >
                  🧪 Test
                </NavItem>

                <NavItem 
                  href="/charts-test" 
                  isActive={pathname === '/charts-test'}
                >
                  📊 Charts
                </NavItem> */}
              </nav>

              {/* Profile Button - Right End */}
              <div className="relative" ref={profileRef}>
                <button
                  className="flex items-center focus:outline-none"
                  onClick={() => setShowProfile((v) => !v)}
                  aria-label="User menu"
                >
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="w-9 h-9 rounded-full border-2 border-gray-200 shadow-sm hover:ring-2 hover:ring-gray-400 transition"
                  />
                </button>
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 text-gray-900 font-medium border-b border-gray-100">
                      {user.nickname}
                    </div>
                    <Link
                      href="/auth/logout"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Logout
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
            >
              Login
            </Link>
          )}

          {/* Task Summary (Desktop) */}
          {/* {user && (
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>{taskCounts.active} Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{taskCounts.completed} Completed</span>
              </div>
              <div className="text-gray-400">|</div>
              <div className="font-medium text-gray-900">
                {taskCounts.total} Total
              </div>
            </div>
          )} */}
        </div>

        {/* Mobile Task Summary */}
        {user && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>{taskCounts.active} Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{taskCounts.completed} Completed</span>
              </div>
              <div className="font-medium text-gray-900">
                {taskCounts.total} Total
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
