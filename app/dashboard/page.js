'use client';

import { useState, useEffect } from 'react';
import { storageService } from '@/lib/storage';

export default function DashboardPage() {
  const [completedPredictions, setCompletedPredictions] = useState([]);
  const [stats, setStats] = useState({
    totalPredictions: 0,
    averageAccuracy: 0,
    totalTimeSpent: 0,
    mostCommonBias: 'Not enough data'
  });

  useEffect(() => {
    const completed = storageService.getCompletedPredictions();
    setCompletedPredictions(completed);
    
    // Calculate basic stats
    if (completed.length > 0) {
      const accuracyScores = completed.map(p => {
        const midpoint75 = (p.confidence75Min + p.confidence75Max) / 2;
        const accuracy = Math.abs(p.actualTime - midpoint75) / midpoint75;
        return 1 - Math.min(accuracy, 1); // Convert to accuracy score
      });
      
      const avgAccuracy = accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length;
      const totalTime = completed.reduce((sum, p) => sum + p.actualTime, 0);
      
      // Determine bias
      const overestimations = completed.filter(p => {
        const midpoint75 = (p.confidence75Min + p.confidence75Max) / 2;
        return p.actualTime < midpoint75;
      }).length;
      
      const bias = overestimations > completed.length / 2 ? 'Overestimation' : 'Underestimation';
      
      setStats({
        totalPredictions: completed.length,
        averageAccuracy: Math.round(avgAccuracy * 100),
        totalTimeSpent: totalTime,
        mostCommonBias: bias
      });
    }
  }, []);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.totalPredictions}
            </div>
            <div className="text-sm text-gray-600">Total Predictions</div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.averageAccuracy}%
            </div>
            <div className="text-sm text-gray-600">Average Accuracy</div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatTime(stats.totalTimeSpent)}
            </div>
            <div className="text-sm text-gray-600">Total Time Tracked</div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="text-lg font-bold text-gray-900 mb-2">
              {stats.mostCommonBias}
            </div>
            <div className="text-sm text-gray-600">Most Common Bias</div>
          </div>
        </div>

        {/* Recent Completions */}
        {completedPredictions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Completions</h2>
            <div className="space-y-4">
              {completedPredictions.slice(0, 5).map((prediction) => {
                const midpoint75 = (prediction.confidence75Min + prediction.confidence75Max) / 2;
                const difference = prediction.actualTime - midpoint75;
                const isAccurate = Math.abs(difference) <= midpoint75 * 0.2; // Within 20%
                
                return (
                  <div key={prediction.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {prediction.taskName}
                        </h3>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Predicted (75%)</p>
                            <p className="font-medium">
                              {prediction.confidence75Min}-{prediction.confidence75Max} min
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Actual</p>
                            <p className="font-medium">{prediction.actualTime} min</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Difference</p>
                            <p className={`font-medium ${
                              difference > 0 ? 'text-red-600' : difference < 0 ? 'text-green-600' : 'text-gray-900'
                            }`}>
                              {difference > 0 ? '+' : ''}{difference} min
                            </p>
                          </div>
                        </div>

                        {prediction.reflection && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600 mb-1">Reflection:</p>
                            <p className="text-sm text-gray-900">{prediction.reflection}</p>
                          </div>
                        )}
                      </div>

                      <div className={`ml-6 px-3 py-1 rounded-full text-xs font-medium ${
                        isAccurate 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {isAccurate ? 'Accurate' : 'Off target'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chart Placeholders */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Calibration Analysis</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Predicted vs Actual Time Chart
              </h3>
              <p className="text-gray-600">
                Scatter plot showing prediction accuracy over time
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Bias Analysis</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Bias Trends</h3>
                <p className="text-sm text-gray-600">
                  Over/under estimation patterns
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Task Categories</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Accuracy by Type</h3>
                <p className="text-sm text-gray-600">
                  Performance breakdown by tags
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {completedPredictions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
            <p className="text-gray-600 mb-6">
              Complete some predictions to see your calibration insights!
            </p>
            <a
              href="/predict"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Create Your First Prediction
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
