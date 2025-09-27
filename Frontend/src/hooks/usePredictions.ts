import { useState, useEffect } from 'react';
import { greenviewApi, PredictionRequest, PredictionResponse } from '@/services/greenviewApi';
import { useToast } from '@/hooks/use-toast';

export interface PredictionFilters {
  startDate: string;
  endDate: string;
  metricFilter?: string;
  predictionHorizon: '7d' | '30d' | '90d' | '1y';
  scenario: 'current_trends' | 'optimistic' | 'conservative';
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
        startDate: filters.startDate,
        endDate: filters.endDate,
        filter: filters.metricFilter,
        predictionHorizon: filters.predictionHorizon,
        scenario: filters.scenario,
      };

      const response = await greenviewApi.getPredictions(request);
      setPredictions(response);
      
      toast({
        title: "Predictions generated",
        description: `Successfully generated ${response.predictions.length} predictions`,
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