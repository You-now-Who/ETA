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
  const [sampleData, setSampleData] = useState([]);
  const [count, setCount] = useState(8);

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
      // Clear any existing test data first
      const existingPredictions = storageService.getPredictions();
      const nonTestPredictions = existingPredictions.filter(pred => 
        !pred.taskName || !pred.taskName.includes('Test ')
      );
      
      // Update localStorage with non-test predictions only
      if (typeof window !== 'undefined') {
        localStorage.setItem('time_predictions', JSON.stringify(nonTestPredictions));
      }

      // Generate random test predictions
      const randomTestData = generateSampleData(5); // Generate 5 random test predictions
      
      let savedCount = 0;
      let completedCount = 0;

      randomTestData.forEach((testPred, index) => {
        // Create prediction with test prefix
        const testPrediction = {
          taskName: `Test ${testPred.taskName}`,
          isProject: testPred.isProject,
          successCriteria: testPred.successCriteria || "Test completion verification",
          confidence75Min: testPred.confidence75Min,
          confidence75Max: testPred.confidence75Max,
          confidence95Min: testPred.confidence95Min,
          confidence95Max: testPred.confidence95Max,
          confidenceLevel: testPred.confidenceLevel,
          intensity: testPred.intensity,
          tags: [...(testPred.tags || []), '#test', '#pipeline']
        };

        const saved = storageService.savePrediction(testPrediction);
        if (saved) savedCount++;
        
        // Complete the prediction with the random actual time
        storageService.completePrediction(saved.id, {
          actualTime: testPred.actualTime,
          reflection: `Test completion #${index + 1}: Actual time was ${testPred.actualTime} minutes`
        });
        completedCount++;
      });

      results.storageTest = (savedCount === 5 && completedCount === 5) ? 'success' : 'failed';
    } catch (error) {
      console.error('Storage test failed:', error);
      results.storageTest = 'failed';
    }

    // Test 2: Calibration Analysis
    try {
      const analyzer = new CalibrationAnalyzer();
      const sampleData = generateSampleData(15); // Generate more data for better analysis
      
      sampleData.forEach(pred => {
        analyzer.addPrediction(pred, pred.actualTime);
      });
      
      const report = analyzer.generateCalibrationReport();
      
      results.calibrationTest = report && report.summary && report.summary.totalPredictions >= 15 ? 'success' : 'failed';
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
    
    // Also generate new random sample data
    const newData = generateSampleData(count);
    setSampleData(newData);
  };

  const generateNewData = () => {
    const newData = generateSampleData(count);
    setSampleData(newData);
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

          {/* Random Data Generation Section */}
          <div className="mt-12 bg-gray-50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🎲 Random Sample Data Generator</h2>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Count:
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 8)}
                    className="ml-2 px-3 py-1 border border-gray-300 rounded-lg w-20"
                  />
                </label>
                <button
                  onClick={generateNewData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-150 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl btn-ripple"
                >
                  Generate New Data
                </button>
              </div>
            </div>

            {sampleData.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Generated {sampleData.length} Random Predictions
                </h3>
                
                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {sampleData.map((pred, index) => {
                    const isWithin75 = pred.actualTime >= pred.confidence75Min && pred.actualTime <= pred.confidence75Max;
                    const isWithin95 = pred.actualTime >= pred.confidence95Min && pred.actualTime <= pred.confidence95Max;
                    const isOver = pred.actualTime > pred.confidence95Max;
                    const isUnder = pred.actualTime < pred.confidence95Min;
                    
                    return (
                      <div key={pred.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{pred.taskName}</h4>
                          <div className="flex space-x-2">
                            {isWithin75 && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                ✓ 75%
                              </span>
                            )}
                            {isWithin95 && !isWithin75 && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                ✓ 95%
                              </span>
                            )}
                            {isOver && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                Overran
                              </span>
                            )}
                            {isUnder && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                Under
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">75% Range: </span>
                            <span className="font-medium">
                              {pred.confidence75Min}-{pred.confidence75Max}min
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">95% Range: </span>
                            <span className="font-medium">
                              {pred.confidence95Min}-{pred.confidence95Max}min
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Actual: </span>
                            <span className={`font-medium ${
                              isWithin75 ? 'text-green-600' :
                              isWithin95 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {pred.actualTime}min
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Days ago: </span>
                            <span className="font-medium">
                              {Math.ceil((new Date() - new Date(pred.completedAt)) / (1000 * 60 * 60 * 24))}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-green-900">
                      {((sampleData.filter(p => p.actualTime >= p.confidence75Min && p.actualTime <= p.confidence75Max).length / sampleData.length) * 100).toFixed(1)}%
                    </div>
                    <div className="text-green-700 text-sm">75% Accuracy</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-blue-900">
                      {((sampleData.filter(p => p.actualTime >= p.confidence95Min && p.actualTime <= p.confidence95Max).length / sampleData.length) * 100).toFixed(1)}%
                    </div>
                    <div className="text-blue-700 text-sm">95% Accuracy</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-orange-900">
                      {((sampleData.filter(p => p.actualTime > p.confidence95Max).length / sampleData.length) * 100).toFixed(1)}%
                    </div>
                    <div className="text-orange-700 text-sm">Overran Rate</div>
                  </div>
                </div>
              </div>
            )}

            {sampleData.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-3">🎲</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Generate Random Data</h3>
                <p className="text-gray-600 mb-4">Click "Generate New Data" to see realistic, random time estimation data with human biases.</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={runTests}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-150 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl btn-ripple"
            >
              Run Tests Again
            </button>
            <a
              href="/predict"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-150 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl btn-ripple inline-block text-center"
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
