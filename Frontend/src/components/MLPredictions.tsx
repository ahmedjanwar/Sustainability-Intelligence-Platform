import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, Brain, Filter } from 'lucide-react';
import { usePredictions, PredictionFilters } from '@/hooks/usePredictions';
import { PredictionChart } from './PredictionChart';
import { format } from 'date-fns';

export const MLPredictions: React.FC = () => {
  const { predictions, loading, error, generatePredictions, clearPredictions } = usePredictions();
  
  const [filters, setFilters] = useState<PredictionFilters>({
    metric: 'CO2_Emissions_kg',
    forecast_days: 30,
    models: ['xgboost', 'lightgbm'], // Always use both models
  });

  const handleGeneratePredictions = () => {
    generatePredictions(filters);
  };

  const handleFilterChange = (key: keyof PredictionFilters, value: string | string[]) => {
    setFilters((prev: PredictionFilters) => ({ 
      ...prev, 
      [key]: key === 'forecast_days' ? parseInt(value as string) : value,
      models: ['xgboost', 'lightgbm'] // Always keep both models
    }));
  };

  const metricOptions = [
    { value: 'CO2_Emissions_kg', label: 'CO2 Emissions (kg)' },
    { value: 'Waste_Generated_kg', label: 'Waste Generated (kg)' },
    { value: 'Sustainability_Score', label: 'Sustainability Score' },
    { value: 'Heat_Generation_MWh', label: 'Heat Generation (MWh)' },
    { value: 'Electricity_Generation_MWh', label: 'Electricity Generation (MWh)' },
  ];

  const forecastDaysOptions = [
    { value: 7, label: '7 Days' },
    { value: 30, label: '30 Days' },
    { value: 90, label: '90 Days' },
    { value: 365, label: '1 Year' },
    { value: 730, label: '2 Years' },
  ];


  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>ML Predictions</CardTitle>
              <CardDescription>
                Generate AI-powered sustainability predictions using the GreenView API
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">Prediction Parameters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Metric Selection */}
            <div className="space-y-2">
              <Label>Metric to Predict</Label>
              <Select
                value={filters.metric}
                onValueChange={(value: string) => handleFilterChange('metric', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Forecast Days */}
            <div className="space-y-2">
              <Label>Forecast Period</Label>
              <Select
                value={filters.forecast_days.toString()}
                onValueChange={(value: string) => handleFilterChange('forecast_days', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {forecastDaysOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Model Information */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">ML Models</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Using both XGBoost and LightGBM models for comprehensive predictions
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleGeneratePredictions} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              Generate Predictions
            </Button>
            
            {predictions && (
              <Button variant="outline" onClick={clearPredictions}>
                Clear Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive text-sm">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {predictions && (
        <div className="space-y-6">
          {/* Current Values */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Values</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="p-4 border rounded-lg bg-card/50">
                  <Label className="font-medium">Current {predictions.metric.replace('_', ' ')}</Label>
                  <p className="text-2xl font-bold text-primary mt-2">{predictions.current_value.toLocaleString()}</p>
                </div>
                <div className="p-4 border rounded-lg bg-card/50">
                  <Label className="font-medium">Sustainability Score</Label>
                  <p className="text-2xl font-bold text-green-600 mt-2">{predictions.sustainability_score.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Latest Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Latest Predictions ({predictions.forecast_days} days ahead)</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(predictions.latest_predictions).map(([modelName, value]: [string, number]) => (
                  <div key={modelName} className="p-6 border rounded-lg bg-card/50">
                    <div className="text-sm font-medium text-muted-foreground">{modelName.toUpperCase()}</div>
                    <div className="text-2xl font-bold mt-2">{value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Predictions Chart */}
          <PredictionChart predictions={predictions.predictions} />

          {/* Detailed Predictions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Predictions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {Object.entries(predictions.predictions).map(([modelName, modelPredictions]: [string, any[]]) => (
                  <div key={modelName} className="space-y-3">
                    <h4 className="font-medium text-lg">{modelName.toUpperCase()} Predictions</h4>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr className="border-b">
                            <th className="text-left p-4 font-medium">Date</th>
                            <th className="text-right p-4 font-medium">Days Ahead</th>
                            <th className="text-right p-4 font-medium">Prediction</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modelPredictions.slice(0, 10).map((prediction: any, index: number) => (
                            <tr key={index} className="border-b hover:bg-muted/30">
                              <td className="p-4">{format(new Date(prediction.date), 'MMM dd, yyyy')}</td>
                              <td className="p-4 text-right">{prediction.days_ahead}</td>
                              <td className="p-4 text-right font-medium">{prediction.prediction.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};