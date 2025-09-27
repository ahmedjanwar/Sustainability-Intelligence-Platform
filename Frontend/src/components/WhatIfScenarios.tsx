import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Target, 
  RotateCcw, 
  Zap, 
  Factory, 
  Truck, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Upload,
  Lightbulb,
  BarChart3,
  Sparkles,
  TrendingDown,
  Minus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUploadedDatasets } from "@/hooks/useUploadedDatasets";
import { supabase } from "@/integrations/supabase/client";

interface ScenarioParams {
  renewableEnergy: number;
  emissionReduction: number;
  supplyChainScore: number;
}

interface ScoreImpact {
  original: number;
  new: number;
  change: number;
}

const WhatIfScenarios = () => {
  const { toast } = useToast();
  const { datasets, selectedDataset, datasetData, loading, calculateMetricsFromDataset } = useUploadedDatasets();
  
  // Calculate metrics from current dataset
  const metrics = datasetData.length > 0 ? calculateMetricsFromDataset(datasetData) : null;
  
  // Calculate initial values from uploaded data
  const getInitialParams = (): ScenarioParams => {
    if (metrics) {
      return {
        renewableEnergy: Math.round(metrics.avgRenewablePercentage || 0),
        emissionReduction: Math.round(metrics.totalCO2Emissions || 0),
        supplyChainScore: Math.round(metrics.supplierCompliance || 0)
      };
    }
    // Fallback values when no data is uploaded
    return {
      renewableEnergy: 0,
      emissionReduction: 0,
      supplyChainScore: 0
    };
  };

  const [originalParams, setOriginalParams] = useState<ScenarioParams>(getInitialParams());
  const [currentParams, setCurrentParams] = useState<ScenarioParams>(originalParams);
  const [scoreImpact, setScoreImpact] = useState<ScoreImpact>({
    original: Math.round(metrics?.sustainabilityScore || 0),
    new: Math.round(metrics?.sustainabilityScore || 0),
    change: 0
  });
  
  const [impactBreakdown, setImpactBreakdown] = useState<string>("");
  const [aiRecommendations, setAiRecommendations] = useState<string>("");
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Update parameters when new data is uploaded
  useEffect(() => {
    if (metrics) {
      const newParams = getInitialParams();
      setOriginalParams(newParams);
      setCurrentParams(newParams);
      setScoreImpact({
        original: Math.round(metrics.sustainabilityScore || 0),
        new: Math.round(metrics.sustainabilityScore || 0),
        change: 0
      });
    }
  }, [datasetData.length]); // Only trigger when dataset actually changes

  // Calculate score impact when parameters change
  useEffect(() => {
    const calculateImpact = () => {
      // Simplified scoring algorithm
      const renewableWeight = 0.4;
      const emissionWeight = 0.35;
      const supplyChainWeight = 0.25;

      const renewableScore = (currentParams.renewableEnergy / 100) * 100;
      const emissionScore = Math.max(0, 100 - ((currentParams.emissionReduction - 50) / 70) * 100);
      const supplyScore = currentParams.supplyChainScore;

      const newScore = Math.round(
        renewableScore * renewableWeight +
        emissionScore * emissionWeight +
        supplyScore * supplyChainWeight
      );

      const change = newScore - scoreImpact.original;

      setScoreImpact(prev => ({
        original: prev.original,
        new: newScore,
        change: change
      }));
    };

    calculateImpact();
    generateAIInsights();
  }, [currentParams]);

  // Generate AI insights when parameters change
  const generateAIInsights = async () => {
    if (!currentParams || !originalParams) return;
    
    const hasChanges = 
      currentParams.renewableEnergy !== originalParams.renewableEnergy ||
      currentParams.emissionReduction !== originalParams.emissionReduction ||
      currentParams.supplyChainScore !== originalParams.supplyChainScore;
    
    if (!hasChanges) {
      setImpactBreakdown("");
      setAiRecommendations("");
      return;
    }

    setLoadingInsights(true);
    try {
      // Generate Impact Breakdown
      const impactResponse = await supabase.functions.invoke('ai-insights', {
        body: {
          type: 'impact_breakdown',
          currentParams,
          originalParams,
          scoreChange: scoreImpact.change
        }
      });

      if (impactResponse.data?.insight) {
        setImpactBreakdown(impactResponse.data.insight);
      }

      // Generate Recommendations
      const recsResponse = await supabase.functions.invoke('ai-insights', {
        body: {
          type: 'recommendations',
          currentParams,
          originalParams,
          scoreChange: scoreImpact.change
        }
      });

      if (recsResponse.data?.insight) {
        setAiRecommendations(recsResponse.data.insight);
      }

    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleReset = () => {
    setCurrentParams(originalParams);
    toast({
      title: "Parameters reset",
      description: "All scenarios have been reset to current values.",
    });
  };


  // Show upload prompt if no data is available
  if (!datasets.length && !loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Data Available</h2>
          <p className="text-muted-foreground mb-4">
            Upload a CSV file with sustainability data to start exploring what-if scenarios
          </p>
          <Button 
            onClick={() => window.location.href = '#'}
            className="bg-primary hover:bg-primary/90"
          >
            Upload Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-success" />
            <h1 className="text-2xl font-semibold text-foreground">What-If Scenarios</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Adjust parameters to see how changes impact your sustainability score
            {selectedDataset && ` • Analyzing: ${selectedDataset.filename}`}
          </p>
        </div>
        <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Renewable Energy */}
          <Card className="border border-border">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-success" />
                    <div>
                      <h3 className="font-medium text-foreground">Renewable Energy</h3>
                      <p className="text-xs text-muted-foreground">Current: {originalParams.renewableEnergy}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">{currentParams.renewableEnergy}%</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Slider
                    value={[currentParams.renewableEnergy]}
                    onValueChange={(value) => 
                      setCurrentParams(prev => ({ ...prev, renewableEnergy: value[0] }))
                    }
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emission Reduction */}
          <Card className="border border-border">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Factory className="h-4 w-4 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">Emission Reduction</h3>
                      <p className="text-xs text-muted-foreground">Current: {originalParams.emissionReduction} tons CO2</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">{currentParams.emissionReduction} tons CO2</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Slider
                    value={[currentParams.emissionReduction]}
                    onValueChange={(value) => 
                      setCurrentParams(prev => ({ ...prev, emissionReduction: value[0] }))
                    }
                    min={0}
                    max={Math.max(originalParams.emissionReduction * 2, 200)}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 tons</span>
                    <span>{Math.max(originalParams.emissionReduction * 2, 200)} tons</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supply Chain Score */}
          <Card className="border border-border">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-accent" />
                    <div>
                      <h3 className="font-medium text-foreground">Supply Chain Score</h3>
                      <p className="text-xs text-muted-foreground">Current: {originalParams.supplyChainScore} score</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">{currentParams.supplyChainScore} score</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Slider
                    value={[currentParams.supplyChainScore]}
                    onValueChange={(value) => 
                      setCurrentParams(prev => ({ ...prev, supplyChainScore: value[0] }))
                    }
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score Impact Panel */}
        <div className="space-y-4">
          {/* Score Impact */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Score Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-4xl font-bold text-warning">{scoreImpact.original}</span>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <span className="text-4xl font-bold text-warning">{scoreImpact.new}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {scoreImpact.change.toFixed(1)} points
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Breakdown */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Impact Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingInsights ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2" />
                    <span className="text-muted-foreground">Analyzing impact...</span>
                  </div>
                ) : impactBreakdown ? (
                  <div className="space-y-4">
                    {/* Impact Visualization */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {/* Renewable Energy Impact */}
                      <div className="bg-success/5 rounded-lg p-3 border border-success/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-success" />
                          <span className="text-xs font-medium text-success">Renewable Energy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentParams.renewableEnergy > originalParams.renewableEnergy ? (
                            <TrendingUp className="h-3 w-3 text-success" />
                          ) : currentParams.renewableEnergy < originalParams.renewableEnergy ? (
                            <TrendingDown className="h-3 w-3 text-warning" />
                          ) : (
                            <Minus className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="text-sm font-semibold text-foreground">
                            {currentParams.renewableEnergy > originalParams.renewableEnergy ? '+' : ''}{currentParams.renewableEnergy - originalParams.renewableEnergy}%
                          </span>
                        </div>
                      </div>

                      {/* Emissions Impact */}
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Factory className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium text-primary">Emissions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentParams.emissionReduction < originalParams.emissionReduction ? (
                            <TrendingDown className="h-3 w-3 text-success" />
                          ) : currentParams.emissionReduction > originalParams.emissionReduction ? (
                            <TrendingUp className="h-3 w-3 text-warning" />
                          ) : (
                            <Minus className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="text-sm font-semibold text-foreground">
                            {currentParams.emissionReduction - originalParams.emissionReduction} tons
                          </span>
                        </div>
                      </div>

                      {/* Supply Chain Impact */}
                      <div className="bg-accent/5 rounded-lg p-3 border border-accent/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="h-4 w-4 text-accent" />
                          <span className="text-xs font-medium text-accent">Supply Chain</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentParams.supplyChainScore > originalParams.supplyChainScore ? (
                            <TrendingUp className="h-3 w-3 text-success" />
                          ) : currentParams.supplyChainScore < originalParams.supplyChainScore ? (
                            <TrendingDown className="h-3 w-3 text-warning" />
                          ) : (
                            <Minus className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="text-sm font-semibold text-foreground">
                            {currentParams.supplyChainScore > originalParams.supplyChainScore ? '+' : ''}{currentParams.supplyChainScore - originalParams.supplyChainScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-primary mb-2">AI Analysis</p>
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{impactBreakdown}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                    <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Adjust parameters to see impact analysis</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Actions */}
          <div className="w-full flex justify-center mt-6">
            <Card className="border border-border w-full max-w-6xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loadingInsights ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin mr-2" />
                      <span className="text-muted-foreground">Generating recommendations...</span>
                    </div>
                  ) : aiRecommendations ? (
                    <div className="bg-gradient-to-r from-accent/5 to-success/5 rounded-lg p-4 border border-accent/20">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-accent/10">
                          <Lightbulb className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-accent mb-2">AI Recommendations</p>
                          <div className="text-sm text-foreground leading-relaxed">
                            <p>{aiRecommendations
                            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
                            .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
                            .replace(/^#+\s*/gm, '') // Remove markdown headers
                            .replace(/^[\-\•\*]+\s*/gm, '') // Remove bullet points
                            .replace(/^\d+\.\s*/gm, '') // Remove numbered lists
                            }</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : scoreImpact.change === 0 ? (
                    <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                      <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">No recommendations yet</p>
                      <p className="text-xs text-muted-foreground">Adjust the sliders above to get AI-powered recommendations</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentParams.renewableEnergy > originalParams.renewableEnergy && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                          <p className="text-sm text-foreground">
                            Increase renewable energy adoption to {currentParams.renewableEnergy}%
                          </p>
                        </div>
                      )}
                      {currentParams.emissionReduction < originalParams.emissionReduction && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                          <p className="text-sm text-foreground">
                            Reduce emissions to {currentParams.emissionReduction} tons CO2
                          </p>
                        </div>
                      )}
                      {currentParams.emissionReduction > originalParams.emissionReduction && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                          <TrendingUp className="h-4 w-4 mt-0.5 text-warning flex-shrink-0" />
                          <p className="text-sm text-foreground">
                            Increased emissions to {currentParams.emissionReduction} tons CO2 will negatively impact your score
                          </p>
                        </div>
                      )}
                      {currentParams.supplyChainScore > originalParams.supplyChainScore && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                          <p className="text-sm text-foreground">
                            Improve supply chain score to {currentParams.supplyChainScore}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recommended Actions - Full Width */}
      <div className="w-full flex justify-center mt-6">
        <Card className="border border-border w-full max-w-6xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loadingInsights ? (
                <div className="flex items-center justify-center py-6">
                  <div className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin mr-2" />
                  <span className="text-muted-foreground">Generating recommendations...</span>
                </div>
              ) : aiRecommendations ? (
                <div className="bg-gradient-to-r from-accent/5 to-success/5 rounded-lg p-4 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-accent/10">
                      <Lightbulb className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-accent mb-2">AI Recommendations</p>
                      <div className="text-sm text-foreground leading-relaxed">
                        <p>{aiRecommendations
                        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
                        .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
                        .replace(/^#+\s*/gm, '') // Remove markdown headers
                        .replace(/^[\-\•\*]+\s*/gm, '') // Remove bullet points
                        .replace(/^\d+\.\s*/gm, '') // Remove numbered lists
                        }</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : scoreImpact.change === 0 ? (
                <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                  <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">No recommendations yet</p>
                  <p className="text-xs text-muted-foreground">Adjust the sliders above to get AI-powered recommendations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Conditional recommendation blocks */}
                  {currentParams.renewableEnergy > originalParams.renewableEnergy && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                      <p className="text-sm text-foreground">
                        Increase renewable energy adoption to {currentParams.renewableEnergy}%
                      </p>
                    </div>
                  )}
                  {currentParams.emissionReduction < originalParams.emissionReduction && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                      <p className="text-sm text-foreground">
                        Reduce emissions to {currentParams.emissionReduction} tons CO2
                      </p>
                    </div>
                  )}
                  {currentParams.emissionReduction > originalParams.emissionReduction && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                      <TrendingUp className="h-4 w-4 mt-0.5 text-warning flex-shrink-0" />
                      <p className="text-sm text-foreground">
                        Increased emissions to {currentParams.emissionReduction} tons CO2 will negatively impact your score
                      </p>
                    </div>
                  )}
                  {currentParams.supplyChainScore > originalParams.supplyChainScore && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
                      <p className="text-sm text-foreground">
                        Improve supply chain score to {currentParams.supplyChainScore}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatIfScenarios;