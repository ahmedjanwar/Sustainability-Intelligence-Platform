import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface PredictionData {
  date: string;
  prediction: number;
  days_ahead: number;
}

interface PredictionChartProps {
  predictions: {
    [modelName: string]: PredictionData[];
  };
}

export const PredictionChart: React.FC<PredictionChartProps> = ({ predictions }) => {
  // Get all model names
  const modelNames = Object.keys(predictions);
  
  // Prepare data for comparison chart (showing all models together)
  const maxLength = Math.max(...Object.values(predictions).map(modelPredictions => modelPredictions.length));
  const comparisonData = [];
  
  for (let i = 0; i < maxLength; i++) {
    const dataPoint: any = {
      days_ahead: i + 1,
      date: i < Object.values(predictions)[0]?.length ? new Date(Object.values(predictions)[0][i].date).toLocaleDateString() : '',
    };
    
    modelNames.forEach(modelName => {
      const modelPredictions = predictions[modelName];
      if (i < modelPredictions.length) {
        dataPoint[modelName] = modelPredictions[i].prediction;
      }
    });
    
    comparisonData.push(dataPoint);
  }

  // Prepare data for model comparison
  const modelComparisonData = modelNames.map(modelName => {
    const modelPredictions = predictions[modelName];
    const avgPrediction = modelPredictions.reduce((sum, p) => sum + p.prediction, 0) / modelPredictions.length;
    const latestPrediction = modelPredictions[modelPredictions.length - 1]?.prediction || 0;
    
    return {
      model: modelName.toUpperCase(),
      avgPrediction: avgPrediction,
      latestPrediction: latestPrediction,
      count: modelPredictions.length,
    };
  });

  const getModelColor = (modelName: string) => {
    const colors = {
      'xgboost': '#ef4444',
      'lightgbm': '#3b82f6',
      'random_forest': '#10b981',
    };
    return colors[modelName as keyof typeof colors] || '#6b7280';
  };

  return (
    <div className="space-y-6">
      {/* Model Comparison Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle className="text-lg">Model Predictions Comparison</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="days_ahead"
                label={{ value: 'Days Ahead', position: 'insideBottom', offset: -10 }}
                fontSize={12}
              />
              <YAxis 
                label={{ value: 'Predicted Value', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  value.toLocaleString(),
                  name.toUpperCase()
                ]}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Legend />
              {modelNames.map((modelName) => (
                <Line 
                  key={modelName}
                  type="monotone" 
                  dataKey={modelName} 
                  stroke={getModelColor(modelName)}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name={modelName.toUpperCase()}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Model Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Model Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="model" 
                fontSize={12}
              />
              <YAxis 
                label={{ value: 'Average Prediction', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  value.toLocaleString(),
                  name === 'avgPrediction' ? 'Average Prediction' : 'Latest Prediction'
                ]}
                labelFormatter={(label) => `Model: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="avgPrediction" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name="Average Prediction"
              />
              <Bar 
                dataKey="latestPrediction" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="Latest Prediction"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Individual Model Predictions */}
      {Object.entries(predictions).map(([modelName, modelPredictions]) => (
        <Card key={modelName}>
          <CardHeader>
            <CardTitle className="text-lg">
              {modelName.toUpperCase()} Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={modelPredictions.map(p => ({
                  days_ahead: p.days_ahead,
                  date: new Date(p.date).toLocaleDateString(),
                  prediction: p.prediction,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="days_ahead"
                  label={{ value: 'Days Ahead', position: 'insideBottom', offset: -10 }}
                  fontSize={12}
                />
                <YAxis 
                  label={{ 
                    value: 'Predicted Value', 
                    angle: -90, 
                    position: 'insideLeft' 
                  }}
                />
                <Tooltip 
                  formatter={(value: number) => [
                    value.toLocaleString(),
                    'Prediction'
                  ]}
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="prediction" 
                  stroke={getModelColor(modelName)}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Prediction"
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
                {Object.values(predictions).reduce((sum, modelPredictions) => sum + modelPredictions.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Predictions</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {modelNames.length}
              </div>
              <div className="text-sm text-muted-foreground">Models Used</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.max(...Object.values(predictions).map(modelPredictions => modelPredictions.length))}
              </div>
              <div className="text-sm text-muted-foreground">Days Forecasted</div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(predictions).reduce((sum, modelPredictions) => {
                  const avg = modelPredictions.reduce((s, p) => s + p.prediction, 0) / modelPredictions.length;
                  return sum + avg;
                }, 0) / modelNames.length}
              </div>
              <div className="text-sm text-muted-foreground">Average Prediction</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};