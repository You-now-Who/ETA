'use client';

import { ActionableInsights } from '@/components/ActionableInsights';
import { CalibrationCurveChart, PredictionAccuracyChart, BiasOverTimeChart } from '@/components/CalibrationCharts';
import { generateSampleData } from '@/lib/calibration';

export default function ChartsTestPage() {
  const sampleData = generateSampleData();
  
  const mockCalibrationReport = {
    summary: {
      accuracy75: 68,
      accuracy95: 87,
      totalPredictions: 10
    },
    calibration: {
      curve: {
        '75%': { predicted: 0.75, observed: 0.68, calibrationError: 0.07 },
        '95%': { predicted: 0.95, observed: 0.87, calibrationError: 0.08 }
      },
      overconfidence: {
        isOverconfident: true,
        overconfidenceScore: 0.12,
        interpretation: "Moderately overconfident"
      }
    },
    timeEstimation: {
      planningFallacyPresent: true,
      underestimationRate: 0.7,
      meanPercentageError: 15.5,
      bias: 'Optimistic'
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">📊 Charts & Insights Test</h1>
      
      {/* Actionable Insights */}
      <ActionableInsights calibrationReport={mockCalibrationReport} />
      
      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Calibration Curve</h3>
          <CalibrationCurveChart calibrationCurve={mockCalibrationReport.calibration.curve} />
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Predicted vs Actual</h3>
          <PredictionAccuracyChart predictions={sampleData} />
        </div>
      </div>

      {/* Bias Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Bias Over Time</h3>
        <BiasOverTimeChart predictions={sampleData} />
      </div>
    </div>
  );
}
