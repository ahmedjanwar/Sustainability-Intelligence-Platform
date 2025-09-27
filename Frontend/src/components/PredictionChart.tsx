import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface Prediction {
  metricName: string;
  predictedValue: number;
  confidence: number;
  predictionDate: string;
  unit: string;
}

interface PredictionChartProps {
  predictions: Prediction[];
}

export const PredictionChart: React.FC<PredictionChartProps> = ({ predictions }) => {
  // Group predictions by metric for better visualization
  const groupedPredictions = predictions.reduce((acc, prediction) => {
    if (!acc[prediction.metricName]) {
      acc[prediction.metricName] = [];
    }
    acc[prediction.metricName].push(prediction);
    return acc;
  }, {} as Record<string, Prediction[]>);

  // Prepare data for line chart (showing trends over time)
  const timeSeriesData = predictions.map(prediction => ({
    date: new Date(prediction.predictionDate).toLocaleDateString(),
    metric: prediction.metricName,
    value: prediction.predictedValue,
    confidence: prediction.confidence * 100,
    unit: prediction.unit,
  }));

  // Prepare data for confidence comparison
  const confidenceData = Object.entries(groupedPredictions).map(([metricName, metricPredictions]) => {
    const avgConfidence = metricPredictions.reduce((sum, p) => sum + p.confidence, 0) / metricPredictions.length;
    const avgValue = metricPredictions.reduce((sum, p) => sum + p.predictedValue, 0) / metricPredictions.length;
    
    return {
      metric: metricName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      confidence: avgConfidence * 100,
      avgValue: avgValue,
      count: metricPredictions.length,
    };
  });

  const getMetricColor = (metricName: string) => {
    const colors = {
      'carbon_emissions': '#ef4444',
      'energy_consumption': '#f59e0b',
      'water_usage': '#3b82f6',
      'renewable_energy_percentage': '#10b981',
      'waste_generated': '#8b5cf6',
    };
    return colors[metricName as keyof typeof colors] || '#6b7280';
  };

  return (
    <div className="space-y-6">
      {/* Confidence Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle className="text-lg">Prediction Confidence by Metric</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="metric" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                label={{ value: 'Confidence (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  name === 'confidence' ? 'Average Confidence' : name
                ]}
                labelFormatter={(label) => `Metric: ${label}`}
              />
              <Bar 
                dataKey="confidence" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Individual Metric Predictions */}
      {Object.entries(groupedPredictions).map(([metricName, metricPredictions]) => (
        <Card key={metricName}>
          <CardHeader>
            <CardTitle className="text-lg capitalize">
              {metricName.replace(/_/g, ' ')} Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={metricPredictions.map(p => ({
                  date: new Date(p.predictionDate).toLocaleDateString(),
                  value: p.predictedValue,
                  confidence: p.confidence * 100,
                  unit: p.unit,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="left"
                  label={{ 
                    value: `Value (${metricPredictions[0]?.unit || ''})`, 
                    angle: -90, 
                    position: 'insideLeft' 
                  }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  label={{ 
                    value: 'Confidence (%)', 
                    angle: 90, 
                    position: 'insideRight' 
                  }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'confidence' ? `${value.toFixed(1)}%` : value.toLocaleString(),
                    name === 'confidence' ? 'Confidence' : `Predicted ${metricName.replace(/_/g, ' ')}`
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={getMetricColor(metricName)}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Predicted Value"
                  yAxisId="left"
                />
                <Line 
                  type="monotone" 
                  dataKey="confidence" 
                  stroke="#10b981"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={{ r: 2 }}
                  name="Confidence %"
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Prediction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {predictions.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Predictions</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {((predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Average Confidence</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(groupedPredictions).length}
              </div>
              <div className="text-sm text-muted-foreground">Unique Metrics</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((new Date(Math.max(...predictions.map(p => new Date(p.predictionDate).getTime()))).getTime() - 
                           new Date(Math.min(...predictions.map(p => new Date(p.predictionDate).getTime()))).getTime()) / 
                           (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-muted-foreground">Days Forecasted</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};