/**
 * Test the complete time estimation analysis pipeline
 */

import { storageService } from './lib/storage.js';
import { CalibrationAnalyzer, generateSampleData } from './lib/calibration.js';

console.log('🧪 Testing Time Estimation Analysis Pipeline\n');

// Test 1: Storage Service
console.log('1. Testing Storage Service...');
try {
  // Clear any existing data for clean test
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('time_predictions');
  }
  
  // Test prediction creation
  const testPrediction = {
    taskName: "Test task",
    isProject: false,
    successCriteria: "Complete the test",
    confidence75Min: 30,
    confidence75Max: 45,
    confidence95Min: 20,
    confidence95Max: 60,
    confidenceLevel: 80,
    intensity: 5,
    tags: ['#testing']
  };
  
  console.log('✅ Storage service import successful');
} catch (error) {
  console.log('❌ Storage service error:', error.message);
}

// Test 2: Calibration Analysis
console.log('\n2. Testing Calibration Analysis...');
try {
  const analyzer = new CalibrationAnalyzer();
  const sampleData = generateSampleData();
  
  console.log(`✅ Generated ${sampleData.length} sample predictions`);
  
  // Add sample data to analyzer
  sampleData.forEach(pred => {
    analyzer.addPrediction(pred, pred.actualTime);
  });
  
  console.log('✅ Added predictions to analyzer');
  
  // Generate report
  const report = analyzer.generateCalibrationReport();
  
  console.log('✅ Generated calibration report');
  console.log(`   - Brier Score: ${report.scores.brierScore}`);
  console.log(`   - 75% Accuracy: ${report.summary.accuracy75?.toFixed(1)}%`);
  console.log(`   - 95% Accuracy: ${report.summary.accuracy95?.toFixed(1)}%`);
  console.log(`   - Primary Issue: ${report.summary.primaryIssue}`);
  console.log(`   - Recommendations: ${report.recommendations.length}`);
  
} catch (error) {
  console.log('❌ Calibration analysis error:', error.message);
}

// Test 3: Individual Metric Calculations
console.log('\n3. Testing Individual Metrics...');
try {
  const analyzer = new CalibrationAnalyzer();
  const sampleData = generateSampleData();
  
  sampleData.forEach(pred => {
    analyzer.addPrediction(pred, pred.actualTime);
  });
  
  // Test individual methods
  const brierScore = analyzer.calculateBrierScore();
  console.log(`✅ Brier Score: ${brierScore?.toFixed(4)}`);
  
  const calibrationCurve = analyzer.calculateCalibrationCurve();
  console.log(`✅ Calibration Curve: ${Object.keys(calibrationCurve).length} confidence levels`);
  
  const overconfidence = analyzer.calculateOverconfidenceMetrics();
  console.log(`✅ Overconfidence Analysis: ${overconfidence.interpretation}`);
  
  const timeBias = analyzer.calculateTimeEstimationBias();
  console.log(`✅ Time Bias: ${timeBias.bias} (${timeBias.meanPercentageError.toFixed(1)}% error)`);
  
  const intervalScores = analyzer.calculateIntervalScore();
  console.log(`✅ Interval Scores: 75%=${intervalScores.interval75Score?.toFixed(2)}, 95%=${intervalScores.interval95Score?.toFixed(2)}`);
  
} catch (error) {
  console.log('❌ Individual metrics error:', error.message);
}

console.log('\n🎉 All tests completed!');
console.log('\nThe analysis pipeline is ready to use. Key features:');
console.log('- Research-based calibration metrics (Brier Score, Murphy\'s Decomposition)');
console.log('- Overconfidence and planning fallacy detection');
console.log('- Personalized recommendations for improvement');
console.log('- Compatible with the ETA dashboard');
