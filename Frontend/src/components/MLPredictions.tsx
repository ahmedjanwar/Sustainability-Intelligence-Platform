import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, Brain, Calendar, Filter } from 'lucide-react';
import { usePredictions, PredictionFilters } from '@/hooks/usePredictions';
import { PredictionChart } from './PredictionChart';
import { format, addDays } from 'date-fns';

export const MLPredictions: React.FC = () => {
  const { predictions, loading, error, generatePredictions, clearPredictions } = usePredictions();
  
  const [filters, setFilters] = useState<PredictionFilters>({
    startDate: format(addDays(new Date(), -30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    predictionHorizon: '30d',
    scenario: 'current_trends',
  });

  const handleGeneratePredictions = () => {
    generatePredictions(filters);
  };

  const handleFilterChange = (key: keyof PredictionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const metricFilterOptions = [
    { value: 'all', label: 'All Metrics' },
    { value: 'energy_consumption', label: 'Energy Consumption' },
    { value: 'carbon_emissions', label: 'Carbon Emissions' },
    { value: 'water_usage', label: 'Water Usage' },
    { value: 'renewable_energy_percentage', label: 'Renewable Energy %' },
  ];

  const horizonOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
  ];

  const scenarioOptions = [
    { value: 'current_trends', label: 'Current Trends' },
    { value: 'optimistic', label: 'Optimistic' },
    { value: 'conservative', label: 'Conservative' },
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            {/* Metric Filter */}
            <div className="space-y-2">
              <Label>Metric Focus</Label>
              <Select
                value={filters.metricFilter || 'all'}
                onValueChange={(value) => handleFilterChange('metricFilter', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metrics" />
                </SelectTrigger>
                <SelectContent>
                  {metricFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prediction Horizon */}
            <div className="space-y-2">
              <Label>Prediction Horizon</Label>
              <Select
                value={filters.predictionHorizon}
                onValueChange={(value) => handleFilterChange('predictionHorizon', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {horizonOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scenario */}
            <div className="space-y-2">
              <Label>Scenario</Label>
              <Select
                value={filters.scenario}
                onValueChange={(value) => handleFilterChange('scenario', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scenarioOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
        <div className="space-y-4">
          {/* Model Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Algorithm</Label>
                  <p className="text-muted-foreground">{predictions.modelInfo.algorithm}</p>
                </div>
                <div>
                  <Label className="font-medium">Accuracy</Label>
                  <p className="text-muted-foreground">{(predictions.modelInfo.accuracy * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <Label className="font-medium">Last Trained</Label>
                  <p className="text-muted-foreground">
                    {format(new Date(predictions.modelInfo.lastTrained), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Predictions Chart */}
          <PredictionChart predictions={predictions.predictions} />

          {/* Predictions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Metric</th>
                      <th className="text-right p-2">Predicted Value</th>
                      <th className="text-right p-2">Unit</th>
                      <th className="text-right p-2">Confidence</th>
                      <th className="text-right p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.predictions.map((prediction, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{prediction.metricName}</td>
                        <td className="p-2 text-right">{prediction.predictedValue.toLocaleString()}</td>
                        <td className="p-2 text-right text-muted-foreground">{prediction.unit}</td>
                        <td className="p-2 text-right">
                          <span className={`px-2 py-1 rounded text-xs ${
                            prediction.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                            prediction.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {(prediction.confidence * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="p-2 text-right text-muted-foreground">
                          {format(new Date(prediction.predictionDate), 'MMM dd, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};