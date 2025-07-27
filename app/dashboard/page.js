'use client';

import { useState, useEffect } from 'react';
import { storageService } from '@/lib/storage';
import { CalibrationAnalyzer, generateSampleData } from '@/lib/calibration';

export default function DashboardPage() {
  const [predictions, setPredictions] = useState([]);
  const [completedPredictions, setCompletedPredictions] = useState([]);
  const [calibrationReport, setCalibrationReport] = useState(null);
  const [useSampleData, setUseSampleData] = useState(false);

  useEffect(() => {
    const allPredictions = storageService.getPredictions();
    setPredictions(allPredictions);
    
    const completed = allPredictions.filter(p => p.completed);
    setCompletedPredictions(completed);

    // Generate calibration analysis
    const analyzer = new CalibrationAnalyzer();
    
    // Use sample data if no real data exists
    const dataToAnalyze = completed.length >= 3 ? completed : generateSampleData();
    if (completed.length < 3) {
      setUseSampleData(true);
    }

    dataToAnalyze.forEach(pred => {
      analyzer.addPrediction(pred, pred.actualTime);
    });

    const report = analyzer.generateCalibrationReport();
    setCalibrationReport(report);
  }, []);

  const calculateAccuracy = (confidenceLevel) => {
    if (completedPredictions.length === 0) return 0;
    
    const accurate = completedPredictions.filter(pred => {
      if (confidenceLevel === 75) {
        return pred.actualTime >= pred.confidence75Min && pred.actualTime <= pred.confidence75Max;
      } else {
        return pred.actualTime >= pred.confidence95Min && pred.actualTime <= pred.confidence95Max;
      }
    });
    
    return (accurate.length / completedPredictions.length * 100).toFixed(1);
  };

  const calculateAverageError = () => {
    if (completedPredictions.length === 0) return 0;
    
    const errors = completedPredictions.map(pred => {
      const estimate = (pred.confidence75Min + pred.confidence75Max) / 2;
      return Math.abs(estimate - pred.actualTime);
    });
    
    return (errors.reduce((sum, error) => sum + error, 0) / errors.length).toFixed(1);
  };

  const getScoreColor = (score, type) => {
    if (type === 'brier') {
      if (score < 0.1) return 'text-green-600';
      if (score < 0.2) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-900';
  };

  const getSeverityColor = (severity) => {
    if (severity === 'High') return 'bg-red-100 text-red-800 border-red-200';
    if (severity === 'Medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calibration Dashboard</h1>
        {useSampleData && (
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm border border-blue-200">
            📊 Showing sample data for demonstration
          </div>
        )}
      </div>
      
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Predictions</h3>
          <div className="text-3xl font-bold text-gray-900">{predictions.length}</div>
          <p className="text-sm text-gray-600 mt-1">
            {calibrationReport?.summary?.totalPredictions || 0} analyzed
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Calibration Quality</h3>
          <div className="text-xl font-bold text-gray-900 mb-1">
            {calibrationReport?.summary?.calibrationQuality || 'N/A'}
          </div>
          <p className="text-sm text-gray-600">
            Brier Score: {calibrationReport?.scores?.brierScore || 'N/A'}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">75% Accuracy</h3>
          <div className="text-3xl font-bold text-gray-900">
            {calibrationReport?.summary?.accuracy75?.toFixed(1) || calculateAccuracy(75)}%
          </div>
          <p className="text-sm text-gray-600 mt-1">Target: 75%</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">95% Accuracy</h3>
          <div className="text-3xl font-bold text-gray-900">
            {calibrationReport?.summary?.accuracy95?.toFixed(1) || calculateAccuracy(95)}%
          </div>
          <p className="text-sm text-gray-600 mt-1">Target: 95%</p>
        </div>
      </div>

      {/* Primary Issue Alert */}
      {calibrationReport?.summary?.primaryIssue && calibrationReport.summary.primaryIssue !== 'Well calibrated' && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Primary Issue Detected: {calibrationReport.summary.primaryIssue}
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                {calibrationReport.calibration.overconfidence?.interpretation}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analysis */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Calibration Curve */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Calibration Analysis</h3>
          {calibrationReport?.calibration?.curve && (
            <div className="space-y-4">
              {Object.entries(calibrationReport.calibration.curve).map(([level, data]) => (
                <div key={level} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{level} Confidence</span>
                    <span className="font-semibold">
                      {(data.observed * 100).toFixed(1)}% actual
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 relative">
                    <div 
                      className="bg-gray-900 h-3 rounded-full" 
                      style={{ width: `${data.observed * 100}%` }}
                    />
                    <div 
                      className="absolute top-0 w-1 h-3 bg-red-500"
                      style={{ left: `${data.predicted * 100}%` }}
                      title={`Target: ${(data.predicted * 100).toFixed(0)}%`}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    Error: {(data.calibrationError * 100).toFixed(1)}% 
                    {data.predicted > data.observed ? ' (overconfident)' : ' (underconfident)'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Time Estimation Bias */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Time Estimation Bias</h3>
          {calibrationReport?.timeEstimation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Mean Error</div>
                  <div className="text-lg font-semibold">
                    {calibrationReport.timeEstimation.meanPercentageError.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Underestimation Rate</div>
                  <div className="text-lg font-semibold">
                    {(calibrationReport.timeEstimation.underestimationRate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Bias Type</div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  calibrationReport.timeEstimation.bias === 'Optimistic' ? 'bg-orange-100 text-orange-800' :
                  calibrationReport.timeEstimation.bias === 'Pessimistic' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {calibrationReport.timeEstimation.bias}
                </span>
              </div>

              {calibrationReport.timeEstimation.planningFallacyPresent && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-yellow-800">⚠️ Planning Fallacy Detected</div>
                  <div className="text-xs text-yellow-700 mt-1">
                    You underestimate {(calibrationReport.timeEstimation.underestimationRate * 100).toFixed(0)}% of the time
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scientific Metrics */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Research-Based Metrics</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Brier Score */}
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">
              <span className={getScoreColor(parseFloat(calibrationReport?.scores?.brierScore || 0), 'brier')}>
                {calibrationReport?.scores?.brierScore || 'N/A'}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900">Brier Score</div>
            <div className="text-xs text-gray-600 mt-1">Probability accuracy (lower = better)</div>
          </div>

          {/* Murphy's Skill */}
          <div className="text-center">
            <div className="text-2xl font-bold mb-2 text-gray-900">
              {calibrationReport?.calibration?.murphyDecomposition?.skill?.toFixed(3) || 'N/A'}
            </div>
            <div className="text-sm font-medium text-gray-900">Murphy's Skill</div>
            <div className="text-xs text-gray-600 mt-1">Resolution - Reliability</div>
          </div>

          {/* Interval Score */}
          <div className="text-center">
            <div className="text-2xl font-bold mb-2 text-gray-900">
              {calibrationReport?.scores?.intervalScore75 || 'N/A'}
            </div>
            <div className="text-sm font-medium text-gray-900">Interval Score (75%)</div>
            <div className="text-xs text-gray-600 mt-1">Width + coverage penalty</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {calibrationReport?.recommendations && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Personalized Recommendations</h3>
          <div className="space-y-4">
            {calibrationReport.recommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{rec.issue}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(rec.priority)}`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{rec.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Completions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Completions</h3>
        
        {completedPredictions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">📊 No completed predictions yet</div>
            <p className="text-sm text-gray-600">
              Complete some predictions to see your personal calibration analysis here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedPredictions.slice(-5).reverse().map((pred, index) => (
              <div key={pred.id || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{pred.taskName}</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(pred.completedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">75% Range: </span>
                    <span className="font-medium">
                      {pred.confidence75Min}-{pred.confidence75Max} min
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">95% Range: </span>
                    <span className="font-medium">
                      {pred.confidence95Min}-{pred.confidence95Max} min
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Actual: </span>
                    <span className="font-medium">{pred.actualTime} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
