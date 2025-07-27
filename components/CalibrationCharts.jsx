'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function CalibrationCurveChart({ calibrationCurve }) {
  if (!calibrationCurve) return null;

  const data = {
    labels: ['50%', '75%', '95%'],
    datasets: [
      {
        label: 'Perfect Calibration',
        data: [0.5, 0.75, 0.95],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0
      },
      {
        label: 'Your Calibration',
        data: [
          0.5, // Placeholder for 50%
          calibrationCurve['75%']?.observed || 0,
          calibrationCurve['95%']?.observed || 0
        ],
        borderColor: 'rgb(17, 24, 39)',
        backgroundColor: 'rgba(17, 24, 39, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(17, 24, 39)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 6,
        tension: 0.3,
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Calibration Curve',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = (context.parsed.y * 100).toFixed(1);
            return `${context.dataset.label}: ${value}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: function(value) {
            return (value * 100) + '%';
          }
        },
        title: {
          display: true,
          text: 'Actual Accuracy'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Confidence Level'
        }
      }
    },
    elements: {
      line: {
        tension: 0.3
      }
    }
  };

  return (
    <div className="h-80">
      <Line data={data} options={options} />
    </div>
  );
}

export function PredictionAccuracyChart({ predictions }) {
  if (!predictions || predictions.length === 0) return null;

  const scatterData = predictions.map((pred, index) => {
    const estimate = (pred.confidence75Min + pred.confidence75Max) / 2;
    return {
      x: estimate,
      y: pred.actualTime,
      label: pred.taskName
    };
  });

  const maxValue = Math.max(
    ...scatterData.map(d => Math.max(d.x, d.y))
  );

  const data = {
    datasets: [
      {
        label: 'Perfect Estimation',
        data: [
          { x: 0, y: 0 },
          { x: maxValue, y: maxValue }
        ],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderDash: [5, 5],
        pointRadius: 0,
        showLine: true,
        tension: 0
      },
      {
        label: 'Your Predictions',
        data: scatterData,
        backgroundColor: 'rgba(17, 24, 39, 0.6)',
        borderColor: 'rgb(17, 24, 39)',
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Predicted vs Actual Time',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.datasetIndex === 1) {
              const point = context.raw;
              return [
                `Task: ${point.label}`,
                `Predicted: ${point.x} min`,
                `Actual: ${point.y} min`
              ];
            }
            return context.dataset.label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Predicted Time (minutes)'
        },
        beginAtZero: true
      },
      y: {
        title: {
          display: true,
          text: 'Actual Time (minutes)'
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="h-80">
      <Scatter data={data} options={options} />
    </div>
  );
}

export function BiasOverTimeChart({ predictions }) {
  if (!predictions || predictions.length === 0) return null;

  const sortedPredictions = [...predictions].sort((a, b) => 
    new Date(a.completedAt) - new Date(b.completedAt)
  );

  const biasData = sortedPredictions.map((pred, index) => {
    const estimate = (pred.confidence75Min + pred.confidence75Max) / 2;
    const bias = ((estimate - pred.actualTime) / pred.actualTime) * 100;
    return {
      x: index + 1,
      y: bias,
      label: pred.taskName
    };
  });

  const data = {
    labels: sortedPredictions.map((_, index) => `Task ${index + 1}`),
    datasets: [
      {
        label: 'Perfect Estimation',
        data: new Array(sortedPredictions.length).fill(0),
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderDash: [5, 5],
        pointRadius: 0
      },
      {
        label: 'Estimation Bias',
        data: biasData.map(d => d.y),
        borderColor: 'rgb(17, 24, 39)',
        backgroundColor: 'rgba(17, 24, 39, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: biasData.map(d => 
          d.y > 0 ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)'
        ),
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 5,
        tension: 0.3,
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Estimation Bias Over Time',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.datasetIndex === 1) {
              const value = context.parsed.y;
              const direction = value > 0 ? 'overestimated' : 'underestimated';
              return `${Math.abs(value).toFixed(1)}% ${direction}`;
            }
            return context.dataset.label;
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Bias (%)'
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          color: function(context) {
            if (context.tick.value === 0) {
              return 'rgb(156, 163, 175)';
            }
            return 'rgba(156, 163, 175, 0.3)';
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Task Order'
        }
      }
    }
  };

  return (
    <div className="h-80">
      <Line data={data} options={options} />
    </div>
  );
}
