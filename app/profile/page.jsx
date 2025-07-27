'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { storageService } from '@/lib/storage';
import Loading from '../../components/Loading';

export default function Profile() {
  const { user, isLoading } = useUser();
  const [userStats, setUserStats] = useState({
    totalPredictions: 0,
    completedPredictions: 0,
    activePredictions: 0,
    averageAccuracy: 0
  });
  const [fullUserData, setFullUserData] = useState(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState(null);

  useEffect(() => {
    if (user) {
      const predictions = storageService.getPredictions();
      const completed = storageService.getCompletedPredictions();
      const active = storageService.getActivePredictions();
      
      // Calculate accuracy for completed predictions
      const accurateWithin75 = completed.filter(p => 
        p.actualTime >= p.confidence75Min && p.actualTime <= p.confidence75Max
      ).length;
      
      const accuracy = completed.length > 0 ? (accurateWithin75 / completed.length) * 100 : 0;

      setUserStats({
        totalPredictions: predictions.length,
        completedPredictions: completed.length,
        activePredictions: active.length,
        averageAccuracy: accuracy
      });

      // Fetch full user data with metadata
      fetchUserMetadata();
    }
  }, [user]);

  const fetchUserMetadata = async () => {
    if (!user?.sub) return;
    
    setLoadingMetadata(true);
    setMetadataError(null);
    
    try {
      const response = await fetch(`/api/user/${encodeURIComponent(user.sub)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user metadata: ${response.status}`);
      }
      
      const userData = await response.json();
      setFullUserData(userData);
    } catch (error) {
      console.error('Error fetching user metadata:', error);
      setMetadataError(error.message);
    } finally {
      setLoadingMetadata(false);
    }
  };

  if (isLoading) return <Loading />;

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h1>
          <a href="/auth/login" className="btn-primary-enhanced">
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        {/* Cover/Header */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6">
            <img
              src={user.picture}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg mb-4 sm:mb-0 sm:mr-6"
            />
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name || user.nickname}</h1>
              <p className="text-lg text-gray-600 mb-2">{user.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Time Estimation Expert
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {userStats.completedPredictions} Predictions Completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{userStats.totalPredictions}</div>
          <div className="text-gray-600">Total Predictions</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{userStats.completedPredictions}</div>
          <div className="text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">{userStats.activePredictions}</div>
          <div className="text-gray-600">Active Tasks</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{userStats.averageAccuracy.toFixed(1)}%</div>
          <div className="text-gray-600">75% Accuracy</div>
        </div>
      </div>

      {/* User Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-gray-900">{user.name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Username</label>
              <p className="text-gray-900">{user.nickname || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email Verified</label>
              <p className="text-gray-900">
                {user.email_verified ? (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    ✗ Not Verified
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-gray-900">{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Not available'}</p>
            </div>
          </div>
        </div>

        {/* User Metadata */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">User Metadata</h2>
            {loadingMetadata && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Loading...
              </div>
            )}
          </div>
          
          {metadataError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">
                Failed to load metadata: {metadataError}
              </p>
              <button
                onClick={fetchUserMetadata}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : fullUserData ? (
            <>
              {/* User Metadata */}
              {fullUserData.user_metadata && Object.keys(fullUserData.user_metadata).length > 0 ? (
                <div className="space-y-3 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">User Metadata</h3>
                  {Object.entries(fullUserData.user_metadata).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-sm font-medium text-gray-500 capitalize">{key.replace(/_/g, ' ')}</label>
                      <p className="text-gray-900">{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-gray-500 italic">No user metadata available</p>
                </div>
              )}
              
              {/* App Metadata */}
              {fullUserData.app_metadata && Object.keys(fullUserData.app_metadata).length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">App Metadata</h3>
                  {Object.entries(fullUserData.app_metadata).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-sm font-medium text-gray-500 capitalize">{key.replace(/_/g, ' ')}</label>
                      <p className="text-gray-900">{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 italic">No app metadata available</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 italic">Click to load metadata from Auth0 Management API</p>
              <button
                onClick={fetchUserMetadata}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Load Metadata
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Raw User Data (for debugging) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Raw User Data</h2>
        <div className="space-y-4">
          <details className="cursor-pointer">
            <summary className="text-blue-600 hover:text-blue-800 font-medium">
              Basic User Object (from useUser hook)
            </summary>
            <pre className="mt-4 p-4 bg-gray-50 rounded-lg text-sm overflow-x-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
          
          {fullUserData && (
            <details className="cursor-pointer">
              <summary className="text-blue-600 hover:text-blue-800 font-medium">
                Complete User Object (from Management API)
              </summary>
              <pre className="mt-4 p-4 bg-gray-50 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(fullUserData, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
