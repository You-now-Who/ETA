export interface Prediction {
  id: string;
  taskName: string;
  isProject: boolean;
  successCriteria: string;
  confidence75Min: number;
  confidence75Max: number;
  confidence95Min: number;
  confidence95Max: number;
  confidenceLevel?: number;
  intensity?: number;
  tags: string[];
  createdAt: Date;
  completedAt?: Date;
  actualTime?: number;
  reflection?: string;
  isCompleted: boolean;
}

export interface PredictionFormData {
  taskName: string;
  isProject: boolean;
  successCriteria: string;
  confidence75Min: string;
  confidence75Max: string;
  confidence95Min: string;
  confidence95Max: string;
  confidenceLevel: number;
  intensity: number;
  tags: string[];
}

export interface CompletionData {
  actualTime: number;
  reflection: string;
}
