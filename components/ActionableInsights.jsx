'use client';

export function ActionableInsights({ calibrationReport }) {
  if (!calibrationReport) return null;

  const getInsightData = () => {
    const insights = [];

    // Accuracy insights
    const accuracy75 = calibrationReport.summary?.accuracy75 || 0;
    const accuracy95 = calibrationReport.summary?.accuracy95 || 0;
    
    if (accuracy75 < 60) {
      insights.push({
        type: 'critical',
        title: 'Poor 75% Calibration',
        percentage: accuracy75.toFixed(0),
        target: '75',
        description: 'Your 75% confidence intervals are missing the mark',
        action: 'Widen your 75% estimates and consider more obstacles'
      });
    } else if (accuracy75 > 85) {
      insights.push({
        type: 'warning',
        title: 'Overconfident at 75%',
        percentage: accuracy75.toFixed(0),
        target: '75',
        description: 'You might be too conservative with your estimates',
        action: 'Try narrowing your confidence ranges slightly'
      });
    }

    if (accuracy95 < 85) {
      insights.push({
        type: 'critical',
        title: 'Poor 95% Calibration',
        percentage: accuracy95.toFixed(0),
        target: '95',
        description: 'Your 95% confidence intervals are too narrow',
        action: 'Consider more extreme scenarios and edge cases'
      });
    }

    // Overconfidence insights
    const overconfidence = calibrationReport.calibration?.overconfidence;
    if (overconfidence?.isOverconfident) {
      insights.push({
        type: 'warning',
        title: 'Overconfidence Detected',
        percentage: ((1 - overconfidence.overconfidenceScore) * 100).toFixed(0),
        target: '80',
        description: 'You consistently underestimate uncertainty',
        action: 'Practice reference class forecasting and consider past similar tasks'
      });
    }

    // Planning fallacy insights
    const timeBias = calibrationReport.timeEstimation;
    if (timeBias?.planningFallacyPresent) {
      const underestimationRate = (timeBias.underestimationRate * 100).toFixed(0);
      insights.push({
        type: 'critical',
        title: 'Planning Fallacy',
        percentage: underestimationRate,
        target: '40',
        description: `You underestimate ${underestimationRate}% of the time`,
        action: 'Add buffer time and break tasks into smaller components'
      });
    }

    // Bias insights
    if (timeBias && Math.abs(timeBias.meanPercentageError) > 15) {
      const bias = timeBias.meanPercentageError;
      insights.push({
        type: 'warning',
        title: `${bias > 0 ? 'Optimistic' : 'Pessimistic'} Bias`,
        percentage: Math.abs(bias).toFixed(0),
        target: '10',
        description: `You ${bias > 0 ? 'under' : 'over'}estimate by ${Math.abs(bias).toFixed(0)}% on average`,
        action: bias > 0 ? 'Add more buffer time to estimates' : 'Challenge pessimistic assumptions'
      });
    }

    // Positive insights
    if (insights.length === 0) {
      insights.push({
        type: 'success',
        title: 'Well Calibrated!',
        percentage: '85',
        target: '80',
        description: 'Your time estimation skills are excellent',
        action: 'Keep tracking to maintain this calibration level'
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights
  };

  const insights = getInsightData();

  const getTypeStyles = (type) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-900',
          accent: 'text-red-600',
          icon: '🚨'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-900',
          accent: 'text-orange-600',
          icon: '⚠️'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-900',
          accent: 'text-green-600',
          icon: '🎯'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-900',
          accent: 'text-gray-600',
          icon: '📊'
        };
    }
  };

  const getProgressColor = (percentage, target, type) => {
    const pct = parseFloat(percentage);
    const tgt = parseFloat(target);
    
    if (type === 'success') return 'bg-green-500';
    if (Math.abs(pct - tgt) <= 5) return 'bg-green-500';
    if (Math.abs(pct - tgt) <= 15) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Actionable Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => {
          const styles = getTypeStyles(insight.type);
          const progressWidth = Math.min((parseFloat(insight.percentage) / 100) * 100, 100);
          
          return (
            <div
              key={index}
              className={`${styles.bg} ${styles.border} border rounded-xl p-4 transition-all duration-200 hover:shadow-md`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{styles.icon}</span>
                  <h3 className={`font-semibold text-sm ${styles.text}`}>
                    {insight.title}
                  </h3>
                </div>
              </div>

              {/* Percentage Display */}
              <div className="mb-3">
                <div className="flex items-baseline space-x-2">
                  <span className={`text-2xl font-bold ${styles.accent}`}>
                    {insight.percentage}%
                  </span>
                  <span className="text-xs text-gray-600">
                    target: {insight.target}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                      insight.percentage,
                      insight.target,
                      insight.type
                    )}`}
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>
              </div>

              {/* Description */}
              <p className={`text-xs ${styles.text} mb-2 leading-relaxed`}>
                {insight.description}
              </p>

              {/* Action */}
              <div className={`text-xs font-medium ${styles.accent}`}>
                💡 {insight.action}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
