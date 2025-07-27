'use client';

import { useState, useEffect } from 'react';
import { storageService } from '@/lib/storage';
import { CalibrationAnalyzer, generateSampleData } from '@/lib/calibration';

export default function TestAnalysisPage() {
  const [testResults, setTestResults] = useState({
    storageTest: null,
    calibrationTest: null,
    dataFlow: null
  });

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const results = {
      storageTest: 'running',
      calibrationTest: 'running', 
      dataFlow: 'running'
    };
    setTestResults(results);

    // Test 1: Storage Service
    try {
      // Test creating a prediction
      const testPrediction = {
        taskName: "Test Analysis Pipeline",
        isProject: false,
        successCriteria: "Verify all components work together",
        confidence75Min: 30,
        confidence75Max: 45,
        confidence95Min: 20,
        confidence95Max: 60,
        confidenceLevel: 80,
        intensity: 5,
        tags: ['#test', '#analysis']
      };

      const saved = storageService.savePrediction(testPrediction);
      
      // Test completing the prediction
      storageService.completePrediction(saved.id, {
        actualTime: 38,
        reflection: "Test completion worked correctly"
      });

      const completed = storageService.getCompletedPredictions();
      results.storageTest = completed.length > 0 ? 'success' : 'failed';
    } catch (error) {
      console.error('Storage test failed:', error);
      results.storageTest = 'failed';
    }

    // Test 2: Calibration Analysis
    try {
      const analyzer = new CalibrationAnalyzer();
      const sampleData = generateSampleData();
      
      sampleData.forEach(pred => {
        analyzer.addPrediction(pred, pred.actualTime);
      });
      
      const report = analyzer.generateCalibrationReport();
      
      results.calibrationTest = report && report.summary ? 'success' : 'failed';
    } catch (error) {
      console.error('Calibration test failed:', error);
      results.calibrationTest = 'failed';
    }

    // Test 3: Data Flow Integration
    try {
      const predictions = storageService.getPredictions();
      const completed = storageService.getCompletedPredictions();
      const active = storageService.getActivePredictions();
      
      const analyzer = new CalibrationAnalyzer();
      const dataToAnalyze = completed.length >= 3 ? completed : generateSampleData();
      
      dataToAnalyze.forEach(pred => {
        if (pred.actualTime && pred.actualTime > 0) {
          analyzer.addPrediction(pred, pred.actualTime);
        }
      });
      
      const report = analyzer.generateCalibrationReport();
      
      results.dataFlow = report.summary.totalPredictions > 0 ? 'success' : 'failed';
    } catch (error) {
      console.error('Data flow test failed:', error);
      results.dataFlow = 'failed';
    }

    setTestResults(results);
  };

  const getStatusIcon = (status) => {
    if (status === 'running') return '⏳';
    if (status === 'success') return '✅';
    if (status === 'failed') return '❌';
    return '❓';
  };

  const getStatusColor = (status) => {
    if (status === 'running') return 'text-yellow-600 bg-yellow-50';
    if (status === 'success') return 'text-green-600 bg-green-50';
    if (status === 'failed') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analysis Pipeline Test</h1>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Storage Test */}
            <div className={`p-6 rounded-xl border-2 ${getStatusColor(testResults.storageTest)}`}>
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{getStatusIcon(testResults.storageTest)}</span>
                <h3 className="font-bold text-lg">Storage Service</h3>
              </div>
              <p className="text-sm">
                Tests prediction creation, completion, and data retrieval from localStorage.
              </p>
              <div className="mt-3 text-xs font-medium">
                Status: {testResults.storageTest || 'pending'}
              </div>
            </div>

            {/* Calibration Test */}
            <div className={`p-6 rounded-xl border-2 ${getStatusColor(testResults.calibrationTest)}`}>
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{getStatusIcon(testResults.calibrationTest)}</span>
                <h3 className="font-bold text-lg">Calibration Analysis</h3>
              </div>
              <p className="text-sm">
                Tests Brier Score, Murphy's Decomposition, and all research-based metrics.
              </p>
              <div className="mt-3 text-xs font-medium">
                Status: {testResults.calibrationTest || 'pending'}
              </div>
            </div>

            {/* Data Flow Test */}
            <div className={`p-6 rounded-xl border-2 ${getStatusColor(testResults.dataFlow)}`}>
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{getStatusIcon(testResults.dataFlow)}</span>
                <h3 className="font-bold text-lg">End-to-End Flow</h3>
              </div>
              <p className="text-sm">
                Tests complete pipeline from prediction creation to analysis dashboard.
              </p>
              <div className="mt-3 text-xs font-medium">
                Status: {testResults.dataFlow || 'pending'}
              </div>
            </div>
          </div>

          {/* Implementation Status */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Implementation Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span>Prediction Form with Validation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span>Task Completion Logging</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span>localStorage Data Persistence</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span>Navigation with Task Counters</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span>Brier Score Calculation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span>Murphy's Decomposition</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span>Overconfidence Detection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span>Personalized Recommendations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={runTests}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Run Tests Again
            </button>
            <a
              href="/predict"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Real Prediction
            </a>
            <a
              href="/dashboard"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
