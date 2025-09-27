import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileUpload from "./FileUpload";
import SustainabilityScore from "./SustainabilityScore";
import EmissionsChart from "./charts/EmissionsChart";
import EnergyChart from "./charts/EnergyChart";
import SupplierChart from "./charts/SupplierChart";

import { useUploadedDatasets } from "@/hooks/useUploadedDatasets";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Zap, 
  Factory, 
  Truck, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Trash2,
  TrendingDown,
  BarChart3,
  Cog
} from "lucide-react";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const { 
    datasets, 
    selectedDataset, 
    setSelectedDataset, 
    datasetData, 
    loading, 
    calculateMetricsFromDataset,
    refreshDatasets,
    deleteDataset,
    deleteAllDatasets
  } = useUploadedDatasets();
  const { toast } = useToast();

  // Refresh datasets when upload is successful
  const handleUploadSuccess = (datasetId: string) => {
    refreshDatasets();
    toast({
      title: "Upload successful",
      description: "Your dataset has been processed and is ready for analysis.",
    });
  };

  // Calculate metrics from uploaded dataset
  const metrics = selectedDataset ? 
    calculateMetricsFromDataset(datasetData) : 
    {
      sustainabilityScore: 0,
      energyReduction: 0,
      emissionsReduction: 0,
      supplierCompliance: 0,
      totalSuppliers: 0
    };

  const previousScore = Math.max(0, metrics.sustainabilityScore - 5);

  const handleDeleteDataset = async (datasetId: string) => {
    if (confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      try {
        await deleteDataset(datasetId);
        toast({
          title: "Dataset deleted",
          description: "The dataset has been successfully removed.",
        });
      } catch (error) {
        toast({
          title: "Error deleting dataset",
          description: "Failed to delete the dataset. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteAllDatasets = async () => {
    if (confirm('Are you sure you want to delete ALL datasets? This action cannot be undone.')) {
      try {
        await deleteAllDatasets();
        toast({
          title: "All datasets deleted",
          description: "All datasets have been successfully removed.",
        });
      } catch (error) {
        toast({
          title: "Error deleting datasets",
          description: "Failed to delete all datasets. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const quickStats = [
    {
      title: "Energy Efficiency",
      value: `${metrics.energyReduction}%`,
      description: "Reduction this year",
      icon: Zap,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Carbon Footprint",
      value: `${metrics.emissionsReduction}%`,
      description: "Emissions reduced",
      icon: Factory,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Supplier Compliance",
      value: `${metrics.supplierCompliance}%`,
      description: "Meeting standards",
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Supply Chain",
      value: metrics.totalSuppliers.toString(),
      description: "Active suppliers",
      icon: Truck,
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Sustainability Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor your environmental impact and track sustainability goals in real-time.
        </p>
        
        {/* Dataset Selector */}
        {datasets.length > 0 && (
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Database className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground">Select Dataset:</label>
                  <Select
                    value={selectedDataset?.id || ""}
                    onValueChange={(value) => {
                      const dataset = datasets.find(d => d.id === value);
                      if (dataset) setSelectedDataset(dataset);
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a dataset to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets.filter(dataset => dataset.id).map((dataset) => {
                        const displayName = dataset.original_filename;
                        const uploadDate = new Date(dataset.created_at).toLocaleDateString();
                        const uploadTime = new Date(dataset.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        
                        return (
                          <SelectItem key={dataset.id} value={dataset.id}>
                            {displayName} - {uploadDate} {uploadTime} ({dataset.rows_count?.toLocaleString()} rows)
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  {loading && (
                    <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  )}
                  {selectedDataset && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDataset(selectedDataset.id)}
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      title="Delete selected dataset"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {datasets.length > 1 && (
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={handleDeleteAllDatasets}
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      title="Delete all datasets"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      All
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {datasets.length === 0 && (
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Start Your Sustainability Analysis</h3>
                <p className="text-muted-foreground mb-4">Upload your sustainability data to begin analyzing environmental metrics and generating insights.</p>
              </CardContent>
            </Card>
            
            <FileUpload 
              onFilesUploaded={(files) => {
                console.log('Files uploaded:', files);
              }}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        )}
      </div>

      {/* Main Dashboard Content */}
      <div className="space-y-6">
          {/* Main Score and Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SustainabilityScore 
                score={metrics.sustainabilityScore} 
                previousScore={previousScore}
              />
            </div>
            
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="hover:shadow-soft transition-all duration-200 animate-slide-up">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmissionsChart datasetData={datasetData} />
            <EnergyChart datasetData={datasetData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <SupplierChart datasetData={datasetData} />
          </div>
      </div>
    </div>
  );
};

export default Dashboard;