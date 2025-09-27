import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUploadedDatasets } from "@/hooks/useUploadedDatasets";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useState, useEffect } from "react";

const AIInsights = () => {
  const { datasets, selectedDataset, datasetData, loading, calculateMetricsFromDataset } = useUploadedDatasets();
  const { toast } = useToast();
  
  const [aiInsights, setAiInsights] = useState<string>("");
  const [loadingInsights, setLoadingInsights] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">AI Insights</h2>
        <p className="text-muted-foreground">
          Get intelligent insights and recommendations powered by AI analysis of your sustainability data.
        </p>
      </div>

      {/* AI Insights Card */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Insights
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
    </div>
  );
};

export default AIInsights;
