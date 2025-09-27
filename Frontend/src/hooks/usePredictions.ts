import { useState } from 'react';
import { greenviewApi, PredictionRequest, PredictionResponse } from '@/services/greenviewApi';
import { useToast } from '@/hooks/use-toast';

export interface PredictionFilters {
  metric: string;
  forecast_days: number;
  models?: string[];
}

export const usePredictions = () => {
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generatePredictions = async (filters: PredictionFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const request: PredictionRequest = {
        metric: filters.metric,
        forecast_days: filters.forecast_days,
        models: filters.models || ['xgboost', 'lightgbm'],
      };

      const response = await greenviewApi.getPredictions(request);
      setPredictions(response);
      
      const totalPredictions = Object.values(response.predictions).reduce((sum, modelPredictions) => sum + modelPredictions.length, 0);
      toast({
        title: "Predictions generated",
        description: `Successfully generated ${totalPredictions} predictions for ${response.metric}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate predictions';
      setError(errorMessage);
      
      toast({
        title: "Prediction failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearPredictions = () => {
    setPredictions(null);
    setError(null);
  };

  return {
    predictions,
    loading,
    error,
    generatePredictions,
    clearPredictions,
  };
};