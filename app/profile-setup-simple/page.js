// Alternative: Simplified approach using only your existing Auth0 app
// This stores profile data in localStorage instead of Auth0 user_metadata

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { useRouter, useSearchParams } from 'next/navigation';

const TASK_TYPE_OPTIONS = [
  'Software Development',
  'Project Management', 
  'Design Work',
  'Writing & Content',
  'Research & Analysis',
  'Administrative Tasks',
  'Meetings & Communication',
  'Learning & Training',
  'Testing & QA',
  'Data Analysis',
  'Marketing & Sales',
  'Other'
];

// Simple localStorage-based profile storage
const profileService = {
  getProfile: (userId) => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(`user_profile_${userId}`);
    return stored ? JSON.parse(stored) : null;
  },
  
  saveProfile: (userId, profile) => {
    if (typeof window === 'undefined') return;
    const profileData = {
      ...profile,
      profile_setup_completed: true,
      profile_setup_date: new Date().toISOString(),
      user_id: userId
    };
    localStorage.setItem(`user_profile_${userId}`, JSON.stringify(profileData));
    return profileData;
  },
  
  getLoginCount: (userId) => {
    if (typeof window === 'undefined') return 0;
    const count = localStorage.getItem(`login_count_${userId}`);
    return count ? parseInt(count) : 0;
  },
  
  incrementLoginCount: (userId) => {
    if (typeof window === 'undefined') return 0;
    const newCount = profileService.getLoginCount(userId) + 1;
    localStorage.setItem(`login_count_${userId}`, newCount.toString());
    return newCount;
  }
};

export default function ProfileSetupSimple() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    taskTypes: [],
    confidenceLevel: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loginCount, setLoginCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Track login count
      const count = profileService.incrementLoginCount(user.sub);
      setLoginCount(count);
      
      // Check if profile already exists
      const existingProfile = profileService.getProfile(user.sub);
      if (existingProfile) {
        router.push('/dashboard?already_setup=true');
        return;
      }
      
      // Only show profile setup on 3rd login or later
      if (count < 3) {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, router]);

  const handleTaskTypeToggle = (taskType) => {
    setFormData(prev => ({
      ...prev,
      taskTypes: prev.taskTypes.includes(taskType)
        ? prev.taskTypes.filter(t => t !== taskType)
        : [...prev.taskTypes, taskType]
    }));
  };

  const handleConfidenceChange = (value) => {
    setFormData(prev => ({
      ...prev,
      confidenceLevel: parseInt(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (formData.taskTypes.length === 0) {
      setError('Please select at least one task type');
      setIsSubmitting(false);
      return;
    }

    try {
      // Save to localStorage instead of Auth0
      profileService.saveProfile(user.sub, {
        task_types: formData.taskTypes,
        confidence_level: formData.confidenceLevel
      });

      // Redirect to dashboard
      router.push('/dashboard?setup_complete=true');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || loginCount < 3) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-lg text-gray-600">
              This is your {loginCount}{getOrdinalSuffix(loginCount)} login.
              Let's personalize your experience!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Task Types Section */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                What types of tasks do you usually track?
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Select all that apply. This helps us provide better insights.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TASK_TYPE_OPTIONS.map(taskType => (
                  <button
                    key={taskType}
                    type="button"
                    onClick={() => handleTaskTypeToggle(taskType)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-150 transform hover:scale-105 active:scale-95 ${
                      formData.taskTypes.includes(taskType)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {taskType}
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence Level Section */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                How confident are you in your time estimates?
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Rate yourself from 1 (always wrong) to 10 (always accurate)
              </p>
              <div className="space-y-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.confidenceLevel}
                  onChange={(e) => handleConfidenceChange(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>1 - Always wrong</span>
                  <span className="font-semibold text-lg text-blue-600">
                    {formData.confidenceLevel}
                  </span>
                  <span>10 - Always accurate</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-150 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function getOrdinalSuffix(number) {
  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return 'th';
  }
  
  switch (lastDigit) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
