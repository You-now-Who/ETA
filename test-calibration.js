// Test the calibration analysis engine
import { CalibrationAnalyzer, generateSampleData } from './lib/calibration.js';

// Create analyzer and add sample data
const analyzer = new CalibrationAnalyzer();
const sampleData = generateSampleData();

console.log('Sample Data:');
console.log(sampleData);

// Add all sample predictions
sampleData.forEach(pred => {
  analyzer.addPrediction(pred, pred.actualTime);
});

// Generate comprehensive report
const report = analyzer.generateCalibrationReport();

console.log('\n=== CALIBRATION ANALYSIS REPORT ===\n');

console.log('SUMMARY:');
console.log(`- Total Predictions: ${report.summary.totalPredictions}`);
console.log(`- 75% Accuracy: ${report.summary.accuracy75.toFixed(1)}%`);
console.log(`- 95% Accuracy: ${report.summary.accuracy95.toFixed(1)}%`);
console.log(`- Calibration Quality: ${report.summary.calibrationQuality}`);
console.log(`- Primary Issue: ${report.summary.primaryIssue}\n`);

console.log('SCIENTIFIC SCORES:');
console.log(`- Brier Score: ${report.scores.brierScore} (lower = better)`);
console.log(`- Interval Score (75%): ${report.scores.intervalScore75}`);
console.log(`- Interval Score (95%): ${report.scores.intervalScore95}\n`);

console.log('CALIBRATION CURVE:');
Object.entries(report.calibration.curve).forEach(([level, data]) => {
  console.log(`- ${level}: Predicted ${(data.predicted * 100).toFixed(0)}%, Actual ${(data.observed * 100).toFixed(1)}%, Error ${(data.calibrationError * 100).toFixed(1)}%`);
});

console.log('\nOVERCONFIDENCE ANALYSIS:');
console.log(`- Interpretation: ${report.calibration.overconfidence.interpretation}`);
console.log(`- Overconfidence Score: ${report.calibration.overconfidence.overconfidenceScore.toFixed(3)}`);
console.log(`- Severity: ${report.calibration.overconfidence.severity.toFixed(3)}\n`);

console.log('TIME ESTIMATION BIAS:');
console.log(`- Mean Percentage Error: ${report.timeEstimation.meanPercentageError.toFixed(1)}%`);
console.log(`- Underestimation Rate: ${(report.timeEstimation.underestimationRate * 100).toFixed(1)}%`);
console.log(`- Bias Type: ${report.timeEstimation.bias}`);
console.log(`- Planning Fallacy Present: ${report.timeEstimation.planningFallacyPresent}\n`);

if (report.calibration.murphyDecomposition) {
  console.log('MURPHY\'S DECOMPOSITION:');
  console.log(`- Reliability: ${report.calibration.murphyDecomposition.reliability.toFixed(4)}`);
  console.log(`- Resolution: ${report.calibration.murphyDecomposition.resolution.toFixed(4)}`);
  console.log(`- Uncertainty: ${report.calibration.murphyDecomposition.uncertainty.toFixed(4)}`);
  console.log(`- Skill Score: ${report.calibration.murphyDecomposition.skill.toFixed(4)}\n`);
}

console.log('RECOMMENDATIONS:');
report.recommendations.forEach((rec, i) => {
  console.log(`${i + 1}. [${rec.priority}] ${rec.issue}`);
  console.log(`   ${rec.recommendation}\n`);
});
