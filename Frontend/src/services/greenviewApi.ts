import { supabase } from '@/integrations/supabase/client';

// Backend API base URL - no authentication required
const BACKEND_API_BASE = 'https://greenview-api-production.up.railway.app';

export interface MetricData {
  metricName: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface MetricResponse {
  data: MetricData[];
}

// Backend API interfaces matching the actual FastAPI endpoints
export interface PredictionRequest {
  metric: string;
  forecast_days: number;
  models?: string[];
}

export interface PredictionResponse {
  metric: string;
  forecast_days: number;
  current_value: number;
  sustainability_score: number;
  predictions: {
    [modelName: string]: {
      date: string;
      prediction: number;
      days_ahead: number;
    }[];
  };
  latest_predictions: {
    [modelName: string]: number;
  };
}

class GreenViewApiService {

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BACKEND_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getMetrics(params: {
    startDate?: string;
    endDate?: string;
    filter?: string;
  } = {}): Promise<MetricResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.filter) searchParams.append('filter', params.filter);
    
    const queryString = searchParams.toString();
    const endpoint = `/metrics${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<MetricResponse>(endpoint);
  }

  async getPredictions(request: PredictionRequest): Promise<PredictionResponse> {
    // Call the actual backend ML predictions endpoint
    const endpoint = '/api/v1/ml-predictions/forecast';
    
    return this.makeRequest<PredictionResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async submitReport(reportData: {
    organizationId: string;
    reportingPeriodStart: string;
    reportingPeriodEnd: string;
    metrics: MetricData[];
  }): Promise<{ reportId: string; status: string; submittedAt: string }> {
    return this.makeRequest('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  // Transform our sustainability_table data to GreenView format
  async submitSustainabilityData(datasetId: string): Promise<void> {
    try {
      // Get data from our sustainability_table
      const { data: sustainabilityData, error } = await supabase
        .from('sustainability_table')
        .select('*')
        .limit(1000); // Adjust as needed

      if (error) throw error;

      if (!sustainabilityData || sustainabilityData.length === 0) {
        throw new Error('No sustainability data found to submit');
      }

      // Transform to GreenView format
      const metrics: MetricData[] = [];
      
      sustainabilityData.forEach((row: any) => {
        if (row.Energy_Consumption_kWh) {
          metrics.push({
            metricName: 'energy_consumption',
            value: row.Energy_Consumption_kWh,
            unit: 'kWh',
            timestamp: new Date(row.Timestamp || Date.now()).toISOString(),
          });
        }
        
        if (row.CO2_Emissions_kg) {
          metrics.push({
            metricName: 'carbon_emissions',
            value: row.CO2_Emissions_kg,
            unit: 'kgCO2e',
            timestamp: new Date(row.Timestamp || Date.now()).toISOString(),
          });
        }
        
        if (row.Water_Usage_Liters) {
          metrics.push({
            metricName: 'water_usage',
            value: row.Water_Usage_Liters,
            unit: 'L',
            timestamp: new Date(row.Timestamp || Date.now()).toISOString(),
          });
        }

        if (row.Renewable_Energy_Percentage) {
          metrics.push({
            metricName: 'renewable_energy_percentage',
            value: row.Renewable_Energy_Percentage,
            unit: '%',
            timestamp: new Date(row.Timestamp || Date.now()).toISOString(),
          });
        }
      });

      // Submit to GreenView API
      await this.submitReport({
        organizationId: `dataset_${datasetId}`,
        reportingPeriodStart: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reportingPeriodEnd: new Date().toISOString().split('T')[0],
        metrics,
      });

      console.log('Successfully submitted sustainability data to GreenView API');
    } catch (error) {
      console.error('Failed to submit sustainability data:', error);
      throw error;
    }
  }
}

export const greenviewApi = new GreenViewApiService();