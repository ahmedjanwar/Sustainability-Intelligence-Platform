import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Dataset {
  id: string;
  filename: string;
  original_filename: string;
  rows_count: number;
  columns: any;
  status: string;
  created_at: string;
  processed_at: string | null;
}

interface DatasetData {
  row_number: number;
  data: any;
}

export const useUploadedDatasets = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [datasetData, setDatasetData] = useState<DatasetData[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all datasets
  const fetchDatasets = async () => {
    try {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('status', 'processed')
        .order('created_at', { ascending: false })
        .limit(10); // Limit to most recent 10 to avoid clutter

      if (error) throw error;
      setDatasets(data || []);
      
      // Auto-select the most recent dataset if none selected
      if (data && data.length > 0 && !selectedDataset) {
        setSelectedDataset(data[0]);
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
    }
  };

  // Fetch data for selected dataset
  const fetchDatasetData = async (datasetId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dataset_data')
        .select('*')
        .eq('dataset_id', datasetId)
        .order('row_number', { ascending: true });

      if (error) throw error;
      setDatasetData(data || []);
    } catch (error) {
      console.error('Error fetching dataset data:', error);
      setDatasetData([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate sustainability metrics from dataset data
  const calculateMetricsFromDataset = (data: DatasetData[]) => {
    if (!data.length) {
      return {
        sustainabilityScore: 0,
        energyReduction: 0,
        emissionsReduction: 0,
        supplierCompliance: 0,
        totalSuppliers: 0,
        totalEnergyConsumption: 0,
        totalCO2Emissions: 0,
        avgRenewablePercentage: 0
      };
    }

    const rows = data.map(d => d.data);
    let totalEnergy = 0;
    let totalCO2 = 0;
    let totalRenewable = 0;
    let totalRecycled = 0;
    let totalFleetEV = 0;
    let validRows = 0;
    const suppliers = new Set();

    rows.forEach(row => {
      // Handle various column name formats
      const energy = parseFloat(
        row['Energy_Consumption_kWh'] || 
        row['energy_consumption_kwh'] || 
        row['Energy Consumption (kWh)'] ||
        row['energy'] || 0
      );
      
      const co2 = parseFloat(
        row['CO2_Emissions_kg'] || 
        row['co2_emissions_kg'] || 
        row['CO2 Emissions (kg)'] ||
        row['emissions'] || 0
      );
      
      const renewable = parseFloat(
        row['Renewable_Energy_Percentage'] || 
        row['renewable_energy_percentage'] || 
        row['Renewable Energy (%)'] ||
        row['renewable'] || 0
      );
      
      const recycled = parseFloat(
        row['Recycled_Waste_Percentage'] || 
        row['recycled_waste_percentage'] || 
        row['Recycled Waste (%)'] ||
        row['recycled'] || 0
      );
      
      const fleetEV = parseFloat(
        row['Fleet_EV_Percentage'] || 
        row['fleet_ev_percentage'] || 
        row['Fleet EV (%)'] ||
        row['ev_fleet'] || 0
      );

      const supplier = row['Supplier'] || row['supplier'] || row['Company'] || row['company'];

      if (energy > 0 || co2 > 0 || renewable > 0) {
        totalEnergy += energy;
        totalCO2 += co2;
        totalRenewable += renewable;
        totalRecycled += recycled;
        totalFleetEV += fleetEV;
        validRows++;
      }

      if (supplier) {
        suppliers.add(supplier);
      }
    });

    const avgRenewable = validRows > 0 ? totalRenewable / validRows : 0;
    const avgRecycled = validRows > 0 ? totalRecycled / validRows : 0;
    const avgFleetEV = validRows > 0 ? totalFleetEV / validRows : 0;

    // Calculate sustainability score
    const sustainabilityScore = Math.round((avgRenewable + avgRecycled + avgFleetEV) / 3);

    return {
      sustainabilityScore,
      energyReduction: Number(avgRenewable.toFixed(1)),
      emissionsReduction: Number(avgRecycled.toFixed(1)),
      supplierCompliance: Number(avgFleetEV.toFixed(1)),
      totalSuppliers: suppliers.size,
      totalEnergyConsumption: totalEnergy,
      totalCO2Emissions: totalCO2,
      avgRenewablePercentage: avgRenewable
    };
  };

  // Delete a specific dataset
  const deleteDataset = async (datasetId: string) => {
    try {
      // Delete dataset data first
      await supabase
        .from('dataset_data')
        .delete()
        .eq('dataset_id', datasetId);
      
      // Delete sustainability metrics
      await supabase
        .from('sustainability_metrics')
        .delete()
        .eq('dataset_id', datasetId);
      
      // Delete the dataset
      const { error } = await supabase
        .from('datasets')
        .delete()
        .eq('id', datasetId);

      if (error) throw error;

      // Refresh datasets list
      await fetchDatasets();
      
      // Clear selected dataset if it was deleted
      if (selectedDataset?.id === datasetId) {
        setSelectedDataset(null);
        setDatasetData([]);
      }
    } catch (error) {
      console.error('Error deleting dataset:', error);
      throw error;
    }
  };

  // Delete all datasets
  const deleteAllDatasets = async () => {
    try {
      const datasetIds = datasets.map(d => d.id);
      
      // Delete all dataset data
      for (const id of datasetIds) {
        await supabase
          .from('dataset_data')
          .delete()
          .eq('dataset_id', id);
        
        await supabase
          .from('sustainability_metrics')
          .delete()
          .eq('dataset_id', id);
      }
      
      // Delete all datasets
      const { error } = await supabase
        .from('datasets')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      // Clear state
      setDatasets([]);
      setSelectedDataset(null);
      setDatasetData([]);
    } catch (error) {
      console.error('Error deleting all datasets:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    if (selectedDataset) {
      fetchDatasetData(selectedDataset.id);
    }
  }, [selectedDataset]);

  return {
    datasets,
    selectedDataset,
    setSelectedDataset,
    datasetData,
    loading,
    calculateMetricsFromDataset,
    refreshDatasets: fetchDatasets,
    deleteDataset,
    deleteAllDatasets
  };
};