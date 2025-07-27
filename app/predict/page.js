'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { storageService } from '@/lib/storage';

const PREDEFINED_TAGS = [
  '#writing', '#coding', '#research', '#meeting', '#planning', 
  '#night', '#morning', '#high-intensity', '#creative', '#routine'
];

export default function PredictPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    taskName: '',
    isProject: false,
    successCriteria: '',
    confidence75Min: '',
    confidence75Max: '',
    confidence95Min: '',
    confidence95Max: '',
    confidenceLevel: 80,
    intensity: 5,
    tags: []
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate confidence intervals
    const conf75Min = parseInt(formData.confidence75Min);
    const conf75Max = parseInt(formData.confidence75Max);
    const conf95Min = parseInt(formData.confidence95Min);
    const conf95Max = parseInt(formData.confidence95Max);
    
    // Basic validation
    if (conf75Min >= conf75Max) {
      alert('75% confidence minimum must be less than maximum');
      return;
    }
    
    if (conf95Min >= conf95Max) {
      alert('95% confidence minimum must be less than maximum');
      return;
    }
    
    if (conf95Min > conf75Min || conf95Max < conf75Max) {
      alert('95% confidence interval should contain the 75% interval');
      return;
    }
    
    // Convert string inputs to numbers
    const predictionData = {
      taskName: formData.taskName,
      isProject: formData.isProject,
      successCriteria: formData.successCriteria,
      confidence75Min: conf75Min,
      confidence75Max: conf75Max,
      confidence95Min: conf95Min,
      confidence95Max: conf95Max,
      confidenceLevel: formData.confidenceLevel,
      intensity: formData.intensity,
      tags: formData.tags,
    };

    // Save to storage
    const savedPrediction = storageService.savePrediction(predictionData);
    console.log('Saved prediction:', savedPrediction);
    
    // Redirect to log page
    router.push('/log');
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Prediction</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name / Label
            </label>
            <input
              type="text"
              name="taskName"
              value={formData.taskName}
              onChange={handleInputChange}
              placeholder="e.g., Write weekly blog post"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
              required
            />
          </div>

          {/* Prediction Tips */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">💡 Prediction Tips</h3>
            <p className="text-sm text-gray-600">
              Avoid vague or luck-based tasks. Be specific about what "done" means.
            </p>
          </div>

          {/* Project Question */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isProject"
                checked={formData.isProject}
                onChange={handleInputChange}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <span className="text-sm font-medium text-gray-700">
                Is this a project? (If yes, consider breaking it down into subtasks)
              </span>
            </label>
          </div>

          {/* Success Criteria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What does success look like?
            </label>
            <textarea
              name="successCriteria"
              value={formData.successCriteria}
              onChange={handleInputChange}
              placeholder="Describe what 'done' means for this task..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
              required
            />
          </div>

          {/* Time Estimates */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Time Estimates (in minutes)</h3>
            
            {/* 75% Confidence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                75% Confidence Range
                <span className="text-gray-500 text-xs ml-2">(You're 75% sure it will be between these times)</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="confidence75Min"
                  value={formData.confidence75Min}
                  onChange={handleInputChange}
                  placeholder="Min (e.g., 45)"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  required
                />
                <input
                  type="number"
                  name="confidence75Max"
                  value={formData.confidence75Max}
                  onChange={handleInputChange}
                  placeholder="Max (e.g., 90)"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  required
                />
              </div>
            </div>

            {/* 95% Confidence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                95% Confidence Range
                <span className="text-gray-500 text-xs ml-2">(You're 95% sure it will be between these times)</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="confidence95Min"
                  value={formData.confidence95Min}
                  onChange={handleInputChange}
                  placeholder="Min (e.g., 30)"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  required
                />
                <input
                  type="number"
                  name="confidence95Max"
                  value={formData.confidence95Max}
                  onChange={handleInputChange}
                  placeholder="Max (e.g., 120)"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Optional: Confidence Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Overall Confidence Level: {formData.confidenceLevel}%
            </label>
            <input
              type="range"
              name="confidenceLevel"
              min="0"
              max="100"
              value={formData.confidenceLevel}
              onChange={handleInputChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Optional: Intensity Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mental/Physical Intensity: {formData.intensity}/10
            </label>
            <input
              type="range"
              name="intensity"
              min="0"
              max="10"
              value={formData.intensity}
              onChange={handleInputChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tags (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Submit Prediction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
