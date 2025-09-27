import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "./FileUpload";
import SustainabilityScore from "./SustainabilityScore";
import EmissionsChart from "./charts/EmissionsChart";
import EnergyChart from "./charts/EnergyChart";
import SupplierChart from "./charts/SupplierChart";
import { MLPredictions } from "./MLPredictions";
import { Reports } from "./Reports";

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
  Brain,
  Sparkles,
  TrendingDown,
  BarChart3,
  FileText,
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
  
  const [aiInsights, setAiInsights] = useState<string>("");
  const [loadingInsights, setLoadingInsights] = useState(false);

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

  // Generate AI insights for dashboard
  useEffect(() => {
    if (selectedDataset && datasetData.length > 0) {
      generateDashboardInsights();
    }
  }, [selectedDataset, datasetData]);

  const generateDashboardInsights = async () => {
    setLoadingInsights(true);
    try {
      const response = await supabase.functions.invoke('ai-insights', {
        body: {
          type: 'dashboard_insights',
          metrics
        }
      });

      if (response.data?.insight) {
        setAiInsights(response.data.insight);
      }
    } catch (error) {
      console.error('Error generating dashboard insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

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

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            ML Predictions
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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
        </TabsContent>

        {/* ML Predictions Tab */}
        <TabsContent value="predictions">
          <MLPredictions />
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInsights ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin mr-3" />
                  <span className="text-muted-foreground">Analyzing sustainability data...</span>
                </div>
              ) : aiInsights ? (
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-5 border border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-primary">AI-Powered Insights</h4>
                        <div className="px-2 py-1 bg-primary/10 rounded-full">
                          <span className="text-xs font-medium text-primary">Strategic Analysis</span>
                        </div>
                      </div>
                      <div className="text-sm text-foreground leading-relaxed space-y-2">
                        {aiInsights.split('\n').map((paragraph, index) => {
                          if (paragraph.trim() === '') return null;
                          
                          // Clean up markdown formatting more thoroughly
                          let cleanText = paragraph.trim()
                            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
                            .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
                            .replace(/^#+\s*/, '') // Remove markdown headers
                            .replace(/^[\-\•\*]+\s*/, '') // Remove bullet points
                            .replace(/^\d+\.\s*/, ''); // Remove numbered lists
                          
                          // Check if it's a header (contains numbers like 1., 2., etc.)
                          const isHeader = /^\d+\./.test(paragraph.trim()) || /^#+\s/.test(paragraph.trim());
                          // Check if it's a bullet point
                          const isBullet = /^[\-\•\*]+\s/.test(paragraph.trim());
                          
                          if (isHeader) {
                            return (
                              <div key={index} className="flex items-center gap-2 pt-2">
                                <TrendingUp className="h-3 w-3 text-primary flex-shrink-0" />
                                <p className="font-medium text-primary text-sm">
                                  {cleanText}
                                </p>
                              </div>
                            );
                          }
                          
                          if (isBullet) {
                            return (
                              <div key={index} className="flex items-start gap-2 ml-4">
                                <div className="w-1 h-1 bg-accent rounded-full mt-2 flex-shrink-0" />
                                <p className="text-sm text-foreground">
                                  {cleanText}
                                </p>
                              </div>
                            );
                          }
                          
                          return (
                            <p key={index} className="text-sm text-foreground">
                              {cleanText}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                  <Brain className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">AI Insights Ready</p>
                  <p className="text-xs text-muted-foreground">Upload sustainability data to get AI-powered insights and recommendations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Reports />
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default Dashboard;