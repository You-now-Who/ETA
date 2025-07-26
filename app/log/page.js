'use client';

import { useState, useEffect } from 'react';
import { storageService } from '@/lib/storage';

function CompletionModal({ prediction, onClose, onSave }) {
  const [actualTime, setActualTime] = useState('');
  const [reflection, setReflection] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(prediction.id, {
      actualTime: parseInt(actualTime),
      reflection
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Complete: {prediction.taskName}
        </h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Your prediction:</p>
          <p className="font-medium">
            75%: {prediction.confidence75Min}-{prediction.confidence75Max} min
          </p>
          <p className="font-medium">
            95%: {prediction.confidence95Min}-{prediction.confidence95Max} min
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actual time taken (minutes)
            </label>
            <input
              type="number"
              value={actualTime}
              onChange={(e) => setActualTime(e.target.value)}
              placeholder="e.g., 75"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reflection (optional)
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Why was it longer/shorter than expected?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LogPage() {
  const [predictions, setPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  useEffect(() => {
    setPredictions(storageService.getActivePredictions());
  }, []);

  const handleComplete = (predictionId, completionData) => {
    storageService.completePrediction(predictionId, completionData);
    setPredictions(storageService.getActivePredictions());
    setSelectedPrediction(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Log Completion</h1>
        
        {predictions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active predictions</h3>
            <p className="text-gray-600 mb-6">Create your first time prediction to get started!</p>
            <a
              href="/predict"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Create Prediction
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div
                key={prediction.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {prediction.taskName}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">75% confidence</p>
                        <p className="font-medium text-gray-900">
                          {prediction.confidence75Min}-{prediction.confidence75Max} min
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">95% confidence</p>
                        <p className="font-medium text-gray-900">
                          {prediction.confidence95Min}-{prediction.confidence95Max} min
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span>Created: {formatDate(prediction.createdAt)}</span>
                      <span>Intensity: {prediction.intensity}/10</span>
                      {prediction.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {prediction.tags.map(tag => (
                            <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Success criteria:</p>
                      <p className="text-sm text-gray-900">{prediction.successCriteria}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPrediction(prediction)}
                    className="ml-6 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Mark Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPrediction && (
        <CompletionModal
          prediction={selectedPrediction}
          onClose={() => setSelectedPrediction(null)}
          onSave={handleComplete}
        />
      )}
    </div>
  );
}
