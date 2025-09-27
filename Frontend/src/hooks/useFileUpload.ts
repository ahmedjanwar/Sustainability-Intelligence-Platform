import { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UploadedFile {
  file: File;
  status: "uploading" | "processing" | "success" | "error";
  progress: number;
  error?: string;
  datasetId?: string;
}

export interface ProcessedData {
  headers: string[];
  rows: any[];
  summary: {
    totalRows: number;
    columns: number;
    fileSize: number;
    dataTypes: Record<string, string>;
  };
}

export const useFileUpload = (onUploadSuccess?: (datasetId: string) => void) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const processCSVFile = async (file: File): Promise<ProcessedData> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${result.errors[0].message}`));
            return;
          }

          const headers = result.meta.fields || [];
          const rows = result.data as any[];
          
          // Analyze data types
          const dataTypes: Record<string, string> = {};
          headers.forEach(header => {
            const values = rows.slice(0, 100).map(row => row[header]).filter(v => v !== null && v !== '');
            if (values.length > 0) {
              const sample = values[0];
              if (!isNaN(Number(sample)) && sample !== '') {
                dataTypes[header] = 'number';
              } else if (Date.parse(sample)) {
                dataTypes[header] = 'date';
              } else {
                dataTypes[header] = 'text';
              }
            }
          });

          resolve({
            headers,
            rows,
            summary: {
              totalRows: rows.length,
              columns: headers.length,
              fileSize: file.size,
              dataTypes
            }
          });
        },
        error: (error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      });
    });
  };

  const processJSONFile = async (file: File): Promise<ProcessedData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonContent = JSON.parse(event.target?.result as string);
          let rows: any[] = [];
          let headers: string[] = [];

          // Handle different JSON structures
          if (Array.isArray(jsonContent)) {
            rows = jsonContent;
          } else if (typeof jsonContent === 'object' && jsonContent !== null) {
            // If it's an object, try to find an array property or convert the object to an array
            const possibleArrayKeys = Object.keys(jsonContent).filter(key => Array.isArray(jsonContent[key]));
            
            if (possibleArrayKeys.length > 0) {
              // Use the first array found
              rows = jsonContent[possibleArrayKeys[0]];
            } else {
              // Convert object properties to a single row
              rows = [jsonContent];
            }
          } else {
            throw new Error('JSON file must contain an array of objects or an object with array properties');
          }

          if (rows.length === 0) {
            throw new Error('JSON file contains no data');
          }

          // Extract headers from the first object
          headers = Object.keys(rows[0] || {});

          // Analyze data types
          const dataTypes: Record<string, string> = {};
          headers.forEach(header => {
            const values = rows.slice(0, 100).map(row => row[header]).filter(v => v !== null && v !== undefined && v !== '');
            if (values.length > 0) {
              const sample = values[0];
              if (typeof sample === 'number' || (!isNaN(Number(sample)) && sample !== '')) {
                dataTypes[header] = 'number';
              } else if (typeof sample === 'string' && Date.parse(sample)) {
                dataTypes[header] = 'date';
              } else {
                dataTypes[header] = 'text';
              }
            }
          });

          resolve({
            headers,
            rows,
            summary: {
              totalRows: rows.length,
              columns: headers.length,
              fileSize: file.size,
              dataTypes
            }
          });
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Invalid JSON format'}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read JSON file'));
      };

      reader.readAsText(file);
    });
  };

  const saveDatasetToSupabase = async (file: File, processedData: ProcessedData) => {
    try {
      // Check if a dataset with the same filename already exists
      const { data: existingDatasets, error: checkError } = await supabase
        .from('datasets')
        .select('id, filename, original_filename')
        .eq('original_filename', file.name)
        .eq('status', 'processed');

      if (checkError) throw checkError;

      if (existingDatasets && existingDatasets.length > 0) {
        // Ask user if they want to replace or create new version
        const shouldReplace = confirm(
          `A dataset with the filename "${file.name}" already exists. Do you want to replace it with the new data?`
        );
        
        if (shouldReplace) {
          // Delete existing dataset and its data
          const existingDataset = existingDatasets[0];
          
          // Delete dataset data first
          await supabase
            .from('dataset_data')
            .delete()
            .eq('dataset_id', existingDataset.id);
          
          // Delete sustainability metrics
          await supabase
            .from('sustainability_metrics')
            .delete()
            .eq('dataset_id', existingDataset.id);
          
          // Delete the dataset
          await supabase
            .from('datasets')
            .delete()
            .eq('id', existingDataset.id);
        } else {
          // Create with timestamp suffix
          const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
          const extension = file.name.split('.').pop();
          file = new File([file], `${nameWithoutExt}_${timestamp}.${extension}`, { type: file.type });
        }
      }
      // Create dataset record
      const { data: dataset, error: datasetError } = await supabase
        .from('datasets')
        .insert({
          filename: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          original_filename: file.name,
          file_size_mb: Number((file.size / (1024 * 1024)).toFixed(2)),
          file_type: file.name.split('.').pop()?.toLowerCase() || 'csv',
          source_type: 'upload',
          columns: processedData.headers,
          rows_count: processedData.summary.totalRows,
          sample_data: processedData.rows.slice(0, 5), // Store first 5 rows as sample
          summary_stats: {
            dataTypes: processedData.summary.dataTypes,
            totalColumns: processedData.summary.columns,
            fileSize: processedData.summary.fileSize
          },
          status: 'processing'
        })
        .select()
        .single();

      if (datasetError) throw datasetError;

      // Store data rows in chunks
      const chunkSize = 100;
      const chunks = [];
      for (let i = 0; i < processedData.rows.length; i += chunkSize) {
        chunks.push(processedData.rows.slice(i, i + chunkSize));
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const dataRows = chunk.map((row, index) => ({
          dataset_id: dataset.id,
          row_number: (i * chunkSize) + index + 1,
          data: row
        }));

        const { error: dataError } = await supabase
          .from('dataset_data')
          .insert(dataRows);

        if (dataError) throw dataError;

        // Update progress
        const progress = Math.round(((i + 1) / chunks.length) * 100);
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === file 
              ? { ...f, progress: 50 + (progress * 0.4) } // 50-90% for data insertion
              : f
          )
        );
      }

      // Transform and save to sustainability_table
      await transformAndSaveSustainabilityData(file, dataset.id, processedData);

      // Update dataset status to completed
      const { error: updateError } = await supabase
        .from('datasets')
        .update({ 
          status: 'processed',
          processed_at: new Date().toISOString()
        })
        .eq('id', dataset.id);

      if (updateError) throw updateError;

      // Generate sustainability metrics if the data contains relevant columns
      await generateSustainabilityMetrics(dataset.id, processedData);

      return dataset.id;
    } catch (error) {
      console.error('Error saving dataset:', error);
      throw error;
    }
  };

  // Column mapping for sustainability_table
  const mapColumnToSustainabilityTable = (columnName: string): string | null => {
    const normalizedColumn = columnName.toLowerCase().replace(/[\s_-]/g, '');
    
    const columnMappings: Record<string, string> = {
      'supplier': 'Supplier',
      'facility': 'Facility',
      'region': 'Region',
      'timestamp': 'Timestamp',
      'date': 'Timestamp',
      'time': 'Timestamp',
      'energyconsumption': 'Energy_Consumption_kWh',
      'energyconsumptionkwh': 'Energy_Consumption_kWh',
      'energy': 'Energy_Consumption_kWh',
      'electricitygeneration': 'Electricity_Generation_MWh',
      'electricitygenerationmwh': 'Electricity_Generation_MWh',
      'electricity': 'Electricity_Generation_MWh',
      'heatgeneration': 'Heat_Generation_MWh',
      'heatgenerationmwh': 'Heat_Generation_MWh',
      'heat': 'Heat_Generation_MWh',
      'co2emissions': 'CO2_Emissions_kg',
      'co2emissionskg': 'CO2_Emissions_kg',
      'co2': 'CO2_Emissions_kg',
      'carbon': 'CO2_Emissions_kg',
      'emissions': 'CO2_Emissions_kg',
      'waterusage': 'Water_Usage_Liters',
      'waterusageliters': 'Water_Usage_Liters',
      'water': 'Water_Usage_Liters',
      'wastegenerated': 'Waste_Generated_kg',
      'wastegeneratedkg': 'Waste_Generated_kg',
      'waste': 'Waste_Generated_kg',
      'renewableenergy': 'Renewable_Energy_Percentage',
      'renewableenergypercentage': 'Renewable_Energy_Percentage',
      'renewable': 'Renewable_Energy_Percentage',
      'recycledwaste': 'Recycled_Waste_Percentage',
      'recycledwastepercentage': 'Recycled_Waste_Percentage',
      'recycled': 'Recycled_Waste_Percentage',
      'fleetev': 'Fleet_EV_Percentage',
      'fleetevpercentage': 'Fleet_EV_Percentage',
      'ev': 'Fleet_EV_Percentage',
      'electric': 'Fleet_EV_Percentage'
    };

    return columnMappings[normalizedColumn] || null;
  };

  const transformAndSaveSustainabilityData = async (file: File, datasetId: string, processedData: ProcessedData) => {
    try {
      // Map column headers to sustainability_table columns
      const columnMapping: Record<string, string> = {};
      let hasAnyMappableColumns = false;

      processedData.headers.forEach(header => {
        const mappedColumn = mapColumnToSustainabilityTable(header);
        if (mappedColumn) {
          columnMapping[header] = mappedColumn;
          hasAnyMappableColumns = true;
        }
      });

      if (!hasAnyMappableColumns) {
        console.log('No mappable columns found for sustainability_table');
        return;
      }

      console.log('Column mapping:', columnMapping);

      // Transform and insert data in chunks
      const chunkSize = 100;
      const chunks = [];
      for (let i = 0; i < processedData.rows.length; i += chunkSize) {
        chunks.push(processedData.rows.slice(i, i + chunkSize));
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const transformedRows = chunk.map(row => {
          const transformedRow: any = {};
          
          // Map each column to sustainability_table format
          Object.entries(columnMapping).forEach(([originalColumn, sustainabilityColumn]) => {
            let value = row[originalColumn];
            
            // Handle data type conversion
            if (value !== null && value !== undefined && value !== '') {
              // For numeric columns, convert to number
              if (['Energy_Consumption_kWh', 'Electricity_Generation_MWh', 'Heat_Generation_MWh', 
                   'CO2_Emissions_kg', 'Water_Usage_Liters', 'Waste_Generated_kg',
                   'Renewable_Energy_Percentage', 'Recycled_Waste_Percentage', 'Fleet_EV_Percentage'].includes(sustainabilityColumn)) {
                const numValue = parseFloat(String(value).replace(/,/g, ''));
                transformedRow[sustainabilityColumn] = isNaN(numValue) ? null : numValue;
              } else {
                // For text columns, keep as string
                transformedRow[sustainabilityColumn] = String(value);
              }
            }
          });

          return transformedRow;
        }).filter(row => Object.keys(row).length > 0); // Filter out empty rows

        if (transformedRows.length > 0) {
          const { error: sustainabilityError } = await supabase
            .from('sustainability_table')
            .insert(transformedRows);

          if (sustainabilityError) {
            console.error('Error inserting into sustainability_table:', sustainabilityError);
            // Continue with the process even if sustainability insertion fails
          }
        }

        // Update progress for sustainability insertion (90-95%)
        const progress = Math.round(((i + 1) / chunks.length) * 100);
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === file // Use the actual file reference passed to the function
              ? { ...f, progress: 90 + (progress * 0.05) }
              : f
          )
        );
      }

      console.log('Successfully inserted data into sustainability_table');
    } catch (error) {
      console.error('Error in transformAndSaveSustainabilityData:', error);
      // Don't throw - let the main process continue
    }
  };

  const generateSustainabilityMetrics = async (datasetId: string, processedData: ProcessedData) => {
    try {
      // Check if data contains sustainability-related columns - use more flexible matching
      const sustainabilityKeywords = [
        'energy', 'co2', 'carbon', 'emissions', 'renewable', 'water', 'waste', 'recycled'
      ];

      const hasRelevantData = sustainabilityKeywords.some(keyword => 
        processedData.headers.some(header => 
          header.toLowerCase().includes(keyword)
        )
      );

      console.log('Checking for sustainability columns:', { headers: processedData.headers, hasRelevantData });

      if (!hasRelevantData) {
        console.log('No sustainability-related columns found, skipping metrics generation');
        return;
      }

      // Calculate aggregate metrics
      const metrics = {
        total_energy_mwh: 0,
        renewable_energy_mwh: 0,
        co2_emissions_kg: 0,
        carbon_footprint: 0,
        renewable_share: 0,
        energy_efficiency: 0,
        sustainability_score: 0
      };

      // Process data to calculate metrics - use flexible column matching
      processedData.rows.forEach(row => {
        // Find energy consumption column
        const energyColumn = processedData.headers.find(h => 
          h.toLowerCase().includes('energy') && h.toLowerCase().includes('consumption')
        );
        
        // Find CO2 emissions column
        const co2Column = processedData.headers.find(h => 
          (h.toLowerCase().includes('co2') || h.toLowerCase().includes('carbon')) && 
          h.toLowerCase().includes('emission')
        );
        
        // Find renewable energy percentage column
        const renewableColumn = processedData.headers.find(h => 
          h.toLowerCase().includes('renewable') && 
          (h.toLowerCase().includes('percent') || h.toLowerCase().includes('%'))
        );

        const energyKwh = energyColumn ? parseFloat(row[energyColumn] || 0) : 0;
        const co2Kg = co2Column ? parseFloat(row[co2Column] || 0) : 0;
        const renewablePercent = renewableColumn ? parseFloat(row[renewableColumn] || 0) : 0;

        metrics.total_energy_mwh += energyKwh / 1000;
        metrics.co2_emissions_kg += co2Kg;
        if (renewablePercent > 0) {
          metrics.renewable_energy_mwh += (energyKwh * renewablePercent / 100) / 1000;
        }
      });

      console.log('Calculated metrics:', metrics);

      metrics.renewable_share = metrics.total_energy_mwh > 0 
        ? (metrics.renewable_energy_mwh / metrics.total_energy_mwh) * 100 
        : 0;
      
      metrics.carbon_footprint = metrics.co2_emissions_kg / 1000; // Convert to tonnes
      metrics.energy_efficiency = Math.min(100, Math.max(0, 100 - (metrics.co2_emissions_kg / Math.max(1, metrics.total_energy_mwh))));
      metrics.sustainability_score = Math.round((metrics.renewable_share + metrics.energy_efficiency) / 2);

      // Save metrics to database
      console.log('Saving sustainability metrics to database:', { datasetId, metrics });
      
      const { data, error } = await supabase
        .from('sustainability_metrics')
        .insert({
          dataset_id: datasetId,
          ...metrics,
          additional_metrics: {
            dataPoints: processedData.rows.length,
            calculatedAt: new Date().toISOString()
          }
        });

      if (error) {
        console.error('Error saving sustainability metrics:', error);
        throw error;
      }
      
      console.log('Successfully saved sustainability metrics:', data);

    } catch (error) {
      console.error('Error generating sustainability metrics:', error);
      // Don't throw - metrics generation is optional
    }
  };

  const uploadFile = async (file: File) => {
    const fileData: UploadedFile = {
      file,
      status: "uploading",
      progress: 0
    };

    setUploadedFiles(prev => [...prev, fileData]);

    try {
      // Update progress: Starting validation
      setUploadedFiles(prev => 
        prev.map(f => f.file === file ? { ...f, progress: 10 } : f)
      );

      // Validate file type
      const allowedTypes = ['csv', 'xlsx', 'xls', 'txt', 'json'];
      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (!fileType || !allowedTypes.includes(fileType)) {
        throw new Error('Unsupported file type. Please upload CSV, Excel, TXT, or JSON files.');
      }

      // Update progress: Processing file
      setUploadedFiles(prev => 
        prev.map(f => f.file === file ? { ...f, status: "processing", progress: 20 } : f)
      );

      let processedData: ProcessedData;

      if (fileType === 'csv' || fileType === 'txt') {
        processedData = await processCSVFile(file);
      } else if (fileType === 'json') {
        processedData = await processJSONFile(file);
      } else {
        throw new Error('Excel processing not yet implemented. Please use CSV or JSON files.');
      }

      // Update progress: Saving to database
      setUploadedFiles(prev => 
        prev.map(f => f.file === file ? { ...f, progress: 50 } : f)
      );

      const datasetId = await saveDatasetToSupabase(file, processedData);

      // Update progress: Completed
      setUploadedFiles(prev => 
        prev.map(f => f.file === file ? { 
          ...f, 
          status: "success", 
          progress: 100,
          datasetId 
        } : f)
      );

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been processed and ${processedData.summary.totalRows} rows imported.`,
      });

      // Call success callback with dataset ID
      if (onUploadSuccess && datasetId) {
        onUploadSuccess(datasetId);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setUploadedFiles(prev => 
        prev.map(f => f.file === file ? { 
          ...f, 
          status: "error", 
          progress: 0,
          error: errorMessage 
        } : f)
      );

      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove));
  };

  const clearAll = () => {
    setUploadedFiles([]);
  };

  return {
    uploadedFiles,
    uploadFile,
    removeFile,
    clearAll
  };
};