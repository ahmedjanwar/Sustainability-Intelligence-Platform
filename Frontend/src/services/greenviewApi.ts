import { supabase } from '@/integrations/supabase/client';

const GREENVIEW_API_BASE = 'https://greenview-api-production.up.railway.app';

export interface MetricData {
  metricName: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface MetricResponse {
  data: MetricData[];
}

export interface PredictionRequest {
  startDate: string;
  endDate: string;
  filter?: string;
  predictionHorizon?: '7d' | '30d' | '90d' | '1y';
  scenario?: 'current_trends' | 'optimistic' | 'conservative';
}

export interface PredictionResponse {
  predictions: {
    metricName: string;
    predictedValue: number;
    confidence: number;
    predictionDate: string;
    unit: string;
  }[];
  modelInfo: {
    algorithm: string;
    accuracy: number;
    lastTrained: string;
  };
}

class GreenViewApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      // Try to get token from Supabase secrets/config
      const { data: config } = await supabase
        .from('system_config')
        .select('config_value')
        .eq('config_key', 'greenview_api_token')
        .single();
      
      if (config?.config_value) {
        const configValue = config.config_value as any;
        return configValue.token || configValue;
      }
      
      return null; // No token available, will use mock data
    } catch (error) {
      console.warn('No API token configured, using mock data:', error);
      return null;
    }
  }

  private generateMockMetrics(): MetricResponse {
    const metrics: MetricData[] = [];
    const now = new Date();
    
    // Generate mock data for the past 30 days
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      metrics.push(
        {
          metricName: 'energy_consumption',
          value: Math.floor(Math.random() * 5000) + 3000,
          unit: 'kWh',
          timestamp: date.toISOString(),
        },
        {
          metricName: 'carbon_emissions',
          value: Math.floor(Math.random() * 3000) + 1000,
          unit: 'kgCO2e',
          timestamp: date.toISOString(),
        },
        {
          metricName: 'water_usage',
          value: Math.floor(Math.random() * 50000) + 20000,
          unit: 'L',
          timestamp: date.toISOString(),
        },
        {
          metricName: 'renewable_energy_percentage',
          value: Math.floor(Math.random() * 40) + 40,
          unit: '%',
          timestamp: date.toISOString(),
        }
      );
    }
    
    return { data: metrics };
  }

  private generateMockPredictions(): PredictionResponse {
    const predictions = [];
    const now = new Date();
    
    // Generate predictions for the next 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      
      predictions.push(
        {
          metricName: 'energy_consumption',
          predictedValue: Math.floor(Math.random() * 1000) + 3500,
          confidence: 0.7 + Math.random() * 0.25,
          predictionDate: date.toISOString(),
          unit: 'kWh',
        },
        {
          metricName: 'carbon_emissions',
          predictedValue: Math.floor(Math.random() * 500) + 1200,
          confidence: 0.65 + Math.random() * 0.3,
          predictionDate: date.toISOString(),
          unit: 'kgCO2e',
        }
      );
    }
    
    return {
      predictions,
      modelInfo: {
        algorithm: 'Random Forest (Demo)',
        accuracy: 0.85,
        lastTrained: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken();
    
    if (!token) {
      // Return mock data when no token is available
      console.info('Using mock data - no API token configured');
      
      if (endpoint.includes('/metrics')) {
        return this.generateMockMetrics() as T;
      } else if (endpoint.includes('/predictions')) {
        return this.generateMockPredictions() as T;
      }
      
      throw new Error('Mock data not available for this endpoint');
    }

    const response = await fetch(`${GREENVIEW_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
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
    const searchParams = new URLSearchParams({
      startDate: request.startDate,
      endDate: request.endDate,
      ...(request.filter && { filter: request.filter }),
      ...(request.predictionHorizon && { horizon: request.predictionHorizon }),
      ...(request.scenario && { scenario: request.scenario }),
    });

    // Assuming the API has a predictions endpoint
    const endpoint = `/predictions?${searchParams.toString()}`;
    
    return this.makeRequest<PredictionResponse>(endpoint);
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
      
      sustainabilityData.forEach(row => {
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