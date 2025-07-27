'use client';

import { useState, useEffect } from 'react';
import { storageService } from '@/lib/storage';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState(null);
  const [localStorageRaw, setLocalStorageRaw] = useState('');

  useEffect(() => {
    // Get raw localStorage data
    const raw = localStorage.getItem('time_predictions');
    setLocalStorageRaw(raw || 'No data found');

    // Get processed data from storageService
    const allPredictions = storageService.getPredictions();
    const activePredictions = storageService.getActivePredictions();
    const completedPredictions = storageService.getCompletedPredictions();

    setDebugInfo({
      all: allPredictions,
      active: activePredictions,
      completed: completedPredictions,
      counts: {
        total: allPredictions.length,
        active: activePredictions.length,
        completed: completedPredictions.length
      }
    });
  }, []);

  const clearData = () => {
    localStorage.removeItem('time_predictions');
    window.location.reload();
  };

  if (!debugInfo) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🐛 Debug Information</h1>
          <button
            onClick={clearData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear All Data
          </button>
        </div>
        
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-900">{debugInfo.counts.total}</div>
            <div className="text-blue-700">Total Predictions</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-900">{debugInfo.counts.active}</div>
            <div className="text-orange-700">Active Predictions</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-900">{debugInfo.counts.completed}</div>
            <div className="text-green-700">Completed Predictions</div>
          </div>
        </div>

        {/* Raw localStorage */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Raw localStorage Data</h2>
          <pre className="bg-gray-100 rounded-lg p-4 text-sm overflow-auto max-h-40">
            {localStorageRaw}
          </pre>
        </div>

        {/* All Predictions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Predictions</h2>
          <div className="space-y-2">
            {debugInfo.all.map((pred, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{pred.taskName}</h3>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      pred.isCompleted || pred.completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {pred.isCompleted || pred.completed ? 'Completed' : 'Active'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ID: </span>
                    <span>{pred.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created: </span>
                    <span>{new Date(pred.createdAt).toLocaleString()}</span>
                  </div>
                  {pred.actualTime && (
                    <div>
                      <span className="text-gray-600">Actual Time: </span>
                      <span>{pred.actualTime} min</span>
                    </div>
                  )}
                  {pred.completedAt && (
                    <div>
                      <span className="text-gray-600">Completed: </span>
                      <span>{new Date(pred.completedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Predictions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Predictions</h2>
          {debugInfo.active.length === 0 ? (
            <p className="text-gray-500">No active predictions</p>
          ) : (
            <div className="space-y-2">
              {debugInfo.active.map((pred, index) => (
                <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="font-medium">{pred.taskName}</div>
                  <div className="text-sm text-gray-600">ID: {pred.id}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Predictions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Completed Predictions</h2>
          {debugInfo.completed.length === 0 ? (
            <p className="text-gray-500">No completed predictions</p>
          ) : (
            <div className="space-y-2">
              {debugInfo.completed.map((pred, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="font-medium">{pred.taskName}</div>
                  <div className="text-sm text-gray-600">
                    ID: {pred.id} | Actual: {pred.actualTime} min
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
