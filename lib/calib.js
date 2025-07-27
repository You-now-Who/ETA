/**
 * Represents a time prediction for a task with confidence intervals.
 * @typedef {Object} TaskPrediction
 * @property {string} task - Name of the task.
 * @property {number} actualTime - The actual time the task took.
 * @property {Object} intervals - Confidence intervals
 * @property {Object} intervals.75 - 75% confidence interval
 * @property {number} intervals.75.lower - Lower bound for 75% confidence
 * @property {number} intervals.75.upper - Upper bound for 75% confidence
 * @property {Object} intervals.95 - 95% confidence interval
 * @property {number} intervals.95.lower - Lower bound for 95% confidence
 * @property {number} intervals.95.upper - Upper bound for 95% confidence
 * @property {string} [category] - Task category for analysis
 * @property {Date} timestamp - When the prediction was made
 */

/**
 * Legacy format for backward compatibility
 * @typedef {Object} LegacyTaskPrediction
 * @property {string} task - Name of the task.
 * @property {number} lowerBound - Estimated lower bound of time.
 * @property {number} upperBound - Estimated upper bound of time.
 * @property {number} confidence - Confidence level (e.g., 90 means 90%).
 * @property {number} actualTime - The actual time the task took.
 */

/**
 * Checks whether the actual time falls within the predicted interval.
 * @param {TaskPrediction} prediction
 * @returns {boolean}
 */
function isPredictionAccurate(prediction) {
  return (
    prediction.actualTime >= prediction.lowerBound &&
    prediction.actualTime <= prediction.upperBound
  );
}

/**
 * Filters predictions by confidence level.
 * @param {TaskPrediction[]} predictions
 * @param {number} confidenceLevel
 * @returns {TaskPrediction[]}
 */
function filterByConfidence(predictions, confidenceLevel) {
  return predictions.filter(p => p.confidence === confidenceLevel);
}

/**
 * Calculates the calibration score for a given confidence level.
 * @param {TaskPrediction[]} predictions
 * @param {number} confidenceLevel
 * @returns {Object|null}
 */
function calculateCalibrationForLevel(predictions, confidenceLevel) {
  const filteredPredictions = filterByConfidence(predictions, confidenceLevel);

  if (filteredPredictions.length === 0) {
    return null;
  }

  const accuratePredictions = filteredPredictions.filter(isPredictionAccurate);

  const calibration = (accuratePredictions.length / filteredPredictions.length) * 100;

  return {
    confidenceLevel,
    totalPredictions: filteredPredictions.length,
    accuratePredictions: accuratePredictions.length,
    calibrationPercentage: calibration.toFixed(1) + '%'
  };
}

/**
 * Displays calibration scores for multiple confidence levels.
 * @param {TaskPrediction[]} predictions
 * @param {number[]} confidenceLevels
 */
function evaluateCalibrations(predictions, confidenceLevels) {
  confidenceLevels.forEach(level => {
    const result = calculateCalibrationForLevel(predictions, level);
    if (result) {
      console.log(result);
    } else {
      console.log(`No data for ${level}% confidence level.`);
    }
  });
}

// Sample data
const taskPredictions = [
  { task: "Write blog post", lowerBound: 30, upperBound: 60, confidence: 90, actualTime: 45 },
  { task: "Math homework", lowerBound: 20, upperBound: 40, confidence: 80, actualTime: 50 },
  { task: "Clean kitchen", lowerBound: 10, upperBound: 20, confidence: 70, actualTime: 15 },
  { task: "Code review", lowerBound: 15, upperBound: 30, confidence: 90, actualTime: 25 },
  { task: "Meditation", lowerBound: 5, upperBound: 10, confidence: 80, actualT  ime: 12 },
];

// Run calibration check
evaluateCalibrations(taskPredictions, [70, 80, 90]);