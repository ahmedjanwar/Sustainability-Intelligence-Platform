import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SustainabilityData {
  timestamp?: string;
  supplier?: string;
  region?: string;
  facility?: string;
  energy_consumption_kwh?: number;
  co2_emissions_kg?: number;
  water_usage_liters?: number;
  waste_generated_kg?: number;
  heat_generation_mwh?: number;
  electricity_generation_mwh?: number;
  renewable_energy_percentage?: number;
  recycled_waste_percentage?: number;
  fleet_ev_percentage?: number;
}

export interface CO2EmissionsData {
  total_co2_cap?: number;
  agriculture?: number;
  buildings?: number;
  fuel_exploitation?: number;
  industrial_combustion?: number;
  power_industry?: number;
  processes?: number;
  transport?: number;
  waste?: number;
  category?: number;
}

export const useSustainabilityData = () => {
  const [data, setData] = useState<SustainabilityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sustainabilityData, error } = await supabase
          .from('sustainability_table')
          .select('*')
          .order('Timestamp', { ascending: false })
          .limit(100);

        if (error) throw error;

        const formattedData = sustainabilityData?.map(item => ({
          timestamp: item.Timestamp,
          supplier: item.Supplier,
          region: item.Region,
          facility: item.Facility,
          energy_consumption_kwh: item.Energy_Consumption_kWh,
          co2_emissions_kg: item.CO2_Emissions_kg,
          water_usage_liters: item.Water_Usage_Liters,
          waste_generated_kg: item.Waste_Generated_kg,
          heat_generation_mwh: item.Heat_Generation_MWh,
          electricity_generation_mwh: item.Electricity_Generation_MWh,
          renewable_energy_percentage: item.Renewable_Energy_Percentage,
          recycled_waste_percentage: item.Recycled_Waste_Percentage,
          fleet_ev_percentage: item.Fleet_EV_Percentage,
        })) || [];

        setData(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription
    const channel = supabase
      .channel('sustainability-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sustainability_table'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, loading, error };
};

export const useCO2EmissionsData = () => {
  const [data, setData] = useState<CO2EmissionsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: emissionsData, error } = await supabase
          .from('co2_emissions_table')
          .select('*')
          .limit(100);

        if (error) throw error;

        const formattedData = emissionsData?.map(item => ({
          total_co2_cap: item['Total CO2/cap'],
          agriculture: item.Agriculture,
          buildings: item.Buildings,
          fuel_exploitation: item['Fuel Exploitation'],
          industrial_combustion: item['Industrial Combustion'],
          power_industry: item['Power Industry'],
          processes: item.Processes,
          transport: item.Transport,
          waste: item.Waste,
          category: item.Category,
        })) || [];

        setData(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription
    const channel = supabase
      .channel('co2-emissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'co2_emissions_table'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, loading, error };
};