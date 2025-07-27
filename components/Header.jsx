'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const predictions = storageService.getPredictions();
    const activePredictions = storageService.getActivePredictions();
    const completedPredictions = storageService.getCompletedPredictions();
    
    setTaskCounts({
      active: activePredictions.length,
      completed: completedPredictions.length,
      total: predictions.length
    });
  }, [pathname]); // Refresh counts when navigation changes

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
              ETA
            </span>
          </Link>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-1">
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

            <NavItem 
              href="/test" 
              isActive={pathname === '/test'}
            >
              🧪 Test
            </NavItem>
          </nav>

          {/* Task Summary (Desktop) */}
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
        </div>

        {/* Mobile Task Summary */}
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
      </div>
    </header>
  );
}
