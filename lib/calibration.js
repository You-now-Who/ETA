/**
 * Calibration Analysis Engine
 * Based on established research in forecasting accuracy and probability calibration
 * 
 * Key References:
 * - Brier Score (1950): Quadratic scoring rule for probabilistic forecasts
 * - Murphy's Decomposition (1973): Reliability, Resolution, Uncertainty
 * - Hosmer-Lemeshow Test: Goodness-of-fit for probabilistic predictions
 * - Yates' Partition: Skill decomposition analysis
 * - Overconfidence research by Kahneman & Tversky
 */

export class CalibrationAnalyzer {
  constructor() {
    this.predictions = [];
  }

  /**
   * Add a completed prediction for analysis
   * @param {Object} prediction - The prediction data
   * @param {number} actualTime - Actual time taken in minutes
   */
  addPrediction(prediction, actualTime) {
    this.predictions.push({
      ...prediction,
      actualTime,
      completedAt: new Date()
    });
  }

  /**
   * BRIER SCORE (Brier, 1950)
   * Measures accuracy of probabilistic predictions
   * Score = Σ(forecast_probability - outcome)² / n
   * Lower is better (0 = perfect, 1 = worst possible)
   */
  calculateBrierScore() {
    if (this.predictions.length === 0) return null;

    let totalScore = 0;
    let validPredictions = 0;

    this.predictions.forEach(pred => {
      // For 75% confidence interval
      const within75 = pred.actualTime >= pred.confidence75Min && 
                      pred.actualTime <= pred.confidence75Max;
      const brierScore75 = Math.pow(0.75 - (within75 ? 1 : 0), 2);

      // For 95% confidence interval  
      const within95 = pred.actualTime >= pred.confidence95Min && 
                      pred.actualTime <= pred.confidence95Max;
      const brierScore95 = Math.pow(0.95 - (within95 ? 1 : 0), 2);

      totalScore += (brierScore75 + brierScore95) / 2;
      validPredictions++;
    });

    return validPredictions > 0 ? totalScore / validPredictions : null;
  }

  /**
   * MURPHY'S DECOMPOSITION (Murphy, 1973)
   * Decomposes Brier Score into: Reliability - Resolution + Uncertainty
   * Reliability: How well probabilities match frequencies
   * Resolution: Ability to discriminate between different outcomes
   * Uncertainty: Inherent difficulty of the prediction task
   */
  calculateMurphyDecomposition() {
    if (this.predictions.length < 5) return null;

    const bins = [0.5, 0.75, 0.95]; // Confidence levels
    let reliability = 0;
    let resolution = 0;
    let uncertainty = 0;

    // Calculate base rate (overall frequency of success)
    const totalOutcomes = this.predictions.length * 2; // 75% and 95% intervals
    let totalHits = 0;

    this.predictions.forEach(pred => {
      if (pred.actualTime >= pred.confidence75Min && pred.actualTime <= pred.confidence75Max) totalHits++;
      if (pred.actualTime >= pred.confidence95Min && pred.actualTime <= pred.confidence95Max) totalHits++;
    });

    const baseRate = totalHits / totalOutcomes;
    uncertainty = baseRate * (1 - baseRate);

    // Calculate reliability and resolution for each confidence level
    bins.forEach(confidenceLevel => {
      const relevantPredictions = this.predictions.filter(pred => {
        if (confidenceLevel === 0.75) return true;
        if (confidenceLevel === 0.95) return true;
        return false;
      });

      if (relevantPredictions.length > 0) {
        const hits = relevantPredictions.filter(pred => {
          if (confidenceLevel === 0.75) {
            return pred.actualTime >= pred.confidence75Min && pred.actualTime <= pred.confidence75Max;
          } else {
            return pred.actualTime >= pred.confidence95Min && pred.actualTime <= pred.confidence95Max;
          }
        }).length;

        const frequency = hits / relevantPredictions.length;
        const weight = relevantPredictions.length / totalOutcomes;

        reliability += weight * Math.pow(confidenceLevel - frequency, 2);
        resolution += weight * Math.pow(frequency - baseRate, 2);
      }
    });

    return {
      reliability,
      resolution,
      uncertainty,
      skill: resolution - reliability // Murphy's skill score
    };
  }

  /**
   * CALIBRATION CURVE ANALYSIS
   * Plots predicted vs observed frequencies to assess calibration
   * Perfect calibration = diagonal line (predicted = observed)
   */
  calculateCalibrationCurve() {
    const confidenceLevels = [0.75, 0.95];
    const curves = {};

    confidenceLevels.forEach(level => {
      const hits = this.predictions.filter(pred => {
        if (level === 0.75) {
          return pred.actualTime >= pred.confidence75Min && pred.actualTime <= pred.confidence75Max;
        } else {
          return pred.actualTime >= pred.confidence95Min && pred.actualTime <= pred.confidence95Max;
        }
      }).length;

      const frequency = this.predictions.length > 0 ? hits / this.predictions.length : 0;
      
      curves[`${level * 100}%`] = {
        predicted: level,
        observed: frequency,
        calibrationError: Math.abs(level - frequency),
        count: this.predictions.length
      };
    });

    return curves;
  }

  /**
   * OVERCONFIDENCE METRICS
   * Based on research by Kahneman, Tversky, and others
   * Measures systematic bias in confidence judgments
   */
  calculateOverconfidenceMetrics() {
    const calibrationCurve = this.calculateCalibrationCurve();
    
    let overconfidenceScore = 0;
    let calibrationCount = 0;

    Object.values(calibrationCurve).forEach(point => {
      if (point.count > 0) {
        // Positive = overconfident, Negative = underconfident
        overconfidenceScore += (point.predicted - point.observed);
        calibrationCount++;
      }
    });

    const avgOverconfidence = calibrationCount > 0 ? overconfidenceScore / calibrationCount : 0;

    return {
      overconfidenceScore: avgOverconfidence,
      isOverconfident: avgOverconfidence > 0.05, // 5% threshold
      isUnderconfident: avgOverconfidence < -0.05,
      severity: Math.abs(avgOverconfidence),
      interpretation: this.interpretOverconfidence(avgOverconfidence)
    };
  }

  interpretOverconfidence(score) {
    if (Math.abs(score) < 0.05) return "Well calibrated";
    if (score > 0.15) return "Severely overconfident";
    if (score > 0.05) return "Moderately overconfident";
    if (score < -0.15) return "Severely underconfident";
    if (score < -0.05) return "Moderately underconfident";
    return "Well calibrated";
  }

  /**
   * TIME ESTIMATION BIAS ANALYSIS
   * Measures systematic errors in time prediction
   * Based on planning fallacy research
   */
  calculateTimeEstimationBias() {
    if (this.predictions.length === 0) return null;

    const biases = this.predictions.map(pred => {
      // Use midpoint of 75% confidence interval as primary estimate
      const estimate = (pred.confidence75Min + pred.confidence75Max) / 2;
      const actual = pred.actualTime;
      
      return {
        absoluteError: Math.abs(estimate - actual),
        relativeError: (estimate - actual) / actual,
        percentageError: ((estimate - actual) / actual) * 100,
        underestimated: estimate < actual,
        estimate,
        actual
      };
    });

    const avgAbsoluteError = biases.reduce((sum, b) => sum + b.absoluteError, 0) / biases.length;
    const avgRelativeError = biases.reduce((sum, b) => sum + b.relativeError, 0) / biases.length;
    const avgPercentageError = biases.reduce((sum, b) => sum + b.percentageError, 0) / biases.length;
    const underestimationRate = biases.filter(b => b.underestimated).length / biases.length;

    return {
      meanAbsoluteError: avgAbsoluteError,
      meanRelativeError: avgRelativeError,
      meanPercentageError: avgPercentageError,
      underestimationRate,
      planningFallacyPresent: underestimationRate > 0.6, // Research threshold
      bias: avgPercentageError > 10 ? 'Optimistic' : avgPercentageError < -10 ? 'Pessimistic' : 'Balanced',
      rawBiases: biases
    };
  }

  /**
   * INTERVAL SCORING (Gneiting & Raftery, 2007)
   * Proper scoring rule for interval forecasts
   * Penalizes both width and coverage
   */
  calculateIntervalScore(alpha = 0.25) { // alpha = 0.25 for 75% intervals
    if (this.predictions.length === 0) return null;

    const scores75 = this.predictions.map(pred => {
      const lower = pred.confidence75Min;
      const upper = pred.confidence75Max;
      const actual = pred.actualTime;
      const alpha = 0.25; // For 75% interval

      let score = upper - lower; // Width penalty

      if (actual < lower) {
        score += (2 / alpha) * (lower - actual); // Under-coverage penalty
      } else if (actual > upper) {
        score += (2 / alpha) * (actual - upper); // Over-coverage penalty
      }

      return score;
    });

    const scores95 = this.predictions.map(pred => {
      const lower = pred.confidence95Min;
      const upper = pred.confidence95Max;
      const actual = pred.actualTime;
      const alpha = 0.05; // For 95% interval

      let score = upper - lower;

      if (actual < lower) {
        score += (2 / alpha) * (lower - actual);
      } else if (actual > upper) {
        score += (2 / alpha) * (actual - upper);
      }

      return score;
    });

    return {
      interval75Score: scores75.reduce((sum, s) => sum + s, 0) / scores75.length,
      interval95Score: scores95.reduce((sum, s) => sum + s, 0) / scores95.length,
      interpretation: "Lower scores indicate better interval forecasts"
    };
  }

  /**
   * COMPREHENSIVE CALIBRATION REPORT
   * Combines all metrics into actionable insights
   */
  generateCalibrationReport() {
    if (this.predictions.length === 0) {
      return { error: "No predictions available for analysis" };
    }

    const brierScore = this.calculateBrierScore();
    const murphyDecomp = this.calculateMurphyDecomposition();
    const calibrationCurve = this.calculateCalibrationCurve();
    const overconfidence = this.calculateOverconfidenceMetrics();
    const timeBias = this.calculateTimeEstimationBias();
    const intervalScores = this.calculateIntervalScore();

    // Calculate additional summary statistics
    const totalPredictions = this.predictions.length;
    const accuracy75 = calibrationCurve['75%']?.observed || 0;
    const accuracy95 = calibrationCurve['95%']?.observed || 0;

    return {
      summary: {
        totalPredictions,
        accuracy75: accuracy75 * 100,
        accuracy95: accuracy95 * 100,
        calibrationQuality: this.getCalibrationQuality(brierScore),
        primaryIssue: this.identifyPrimaryIssue(overconfidence, timeBias)
      },
      scores: {
        brierScore: brierScore?.toFixed(4),
        intervalScore75: intervalScores?.interval75Score?.toFixed(2),
        intervalScore95: intervalScores?.interval95Score?.toFixed(2)
      },
      calibration: {
        curve: calibrationCurve,
        overconfidence,
        murphyDecomposition: murphyDecomp
      },
      timeEstimation: timeBias,
      recommendations: this.generateRecommendations(overconfidence, timeBias, accuracy75, accuracy95)
    };
  }

  getCalibrationQuality(brierScore) {
    if (!brierScore) return "Insufficient data";
    if (brierScore < 0.1) return "Excellent";
    if (brierScore < 0.2) return "Good";
    if (brierScore < 0.3) return "Fair";
    return "Poor";
  }

  identifyPrimaryIssue(overconfidence, timeBias) {
    if (!overconfidence || !timeBias) return "Insufficient data";
    
    if (overconfidence.severity > 0.15) return "Overconfidence";
    if (timeBias.planningFallacyPresent) return "Planning Fallacy";
    if (Math.abs(timeBias.meanPercentageError) > 20) return "Time Estimation Bias";
    return "Well calibrated";
  }

  generateRecommendations(overconfidence, timeBias, accuracy75, accuracy95) {
    const recommendations = [];

    if (overconfidence?.isOverconfident) {
      recommendations.push({
        issue: "Overconfidence",
        recommendation: "Your confidence intervals are too narrow. Try widening your estimates and considering more potential obstacles.",
        priority: "High"
      });
    }

    if (timeBias?.planningFallacyPresent) {
      recommendations.push({
        issue: "Planning Fallacy",
        recommendation: "You consistently underestimate time. Use reference class forecasting: look at similar past tasks.",
        priority: "High"
      });
    }

    if (accuracy75 < 65) {
      recommendations.push({
        issue: "Poor 75% Calibration",
        recommendation: "Your 75% confidence intervals should contain the actual time about 75% of the time. Adjust your uncertainty assessment.",
        priority: "Medium"
      });
    }

    if (accuracy95 < 85) {
      recommendations.push({
        issue: "Poor 95% Calibration", 
        recommendation: "Your 95% intervals are too narrow. Consider more extreme scenarios and edge cases.",
        priority: "Medium"
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        issue: "Well Calibrated",
        recommendation: "Great job! Your time estimation skills are well calibrated. Continue tracking to maintain this level.",
        priority: "Low"
      });
    }

    return recommendations;
  }
}

// Generate sample data for testing
export function generateSampleData() {
  const sampleData = [
    { taskName: "Write blog post", confidence75Min: 45, confidence75Max: 75, confidence95Min: 30, confidence95Max: 120, actualTime: 85 },
    { taskName: "Code review", confidence75Min: 20, confidence75Max: 35, confidence95Min: 15, confidence95Max: 50, actualTime: 28 },
    { taskName: "Design mockup", confidence75Min: 60, confidence75Max: 90, confidence95Min: 45, confidence95Max: 150, actualTime: 130 },
    { taskName: "Team meeting", confidence75Min: 30, confidence75Max: 45, confidence95Min: 25, confidence95Max: 60, actualTime: 42 },
    { taskName: "Bug fix", confidence75Min: 15, confidence75Max: 30, confidence95Min: 10, confidence95Max: 60, actualTime: 45 },
    { taskName: "Research task", confidence75Min: 90, confidence75Max: 120, confidence95Min: 60, confidence95Max: 180, actualTime: 95 },
    { taskName: "Documentation", confidence75Min: 40, confidence75Max: 60, confidence95Min: 30, confidence95Max: 90, actualTime: 75 },
    { taskName: "Database migration", confidence75Min: 120, confidence75Max: 180, confidence95Min: 90, confidence95Max: 300, actualTime: 210 },
    { taskName: "Client presentation", confidence75Min: 30, confidence75Max: 45, confidence95Min: 20, confidence95Max: 75, actualTime: 38 },
    { taskName: "Performance optimization", confidence75Min: 60, confidence75Max: 120, confidence95Min: 45, confidence95Max: 240, actualTime: 165 }
  ];

  return sampleData;
}
