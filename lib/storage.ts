import { Prediction, CompletionData } from '@/types';

const STORAGE_KEY = 'time_predictions';

export const storageService = {
  getPredictions(): Prediction[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const predictions = JSON.parse(stored);
      return predictions.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        completedAt: p.completedAt ? new Date(p.completedAt) : undefined,
      }));
    } catch {
      return [];
    }
  },

  savePrediction(prediction: Omit<Prediction, 'id' | 'createdAt' | 'isCompleted'>): Prediction {
    const newPrediction: Prediction = {
      ...prediction,
      id: Date.now().toString(),
      createdAt: new Date(),
      isCompleted: false,
    };

    const predictions = this.getPredictions();
    predictions.push(newPrediction);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
    
    return newPrediction;
  },

  completePrediction(id: string, completionData: CompletionData): void {
    const predictions = this.getPredictions();
    const index = predictions.findIndex(p => p.id === id);
    
    if (index !== -1) {
      predictions[index] = {
        ...predictions[index],
        actualTime: completionData.actualTime,
        reflection: completionData.reflection,
        completedAt: new Date(),
        isCompleted: true,
        completed: true, // Add this for compatibility with calibration analysis
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
    }
  },

  getActivePredictions(): Prediction[] {
    return this.getPredictions().filter(p => !p.isCompleted);
  },

  getCompletedPredictions(): Prediction[] {
    return this.getPredictions().filter(p => p.isCompleted);
  },
};
