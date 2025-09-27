import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  question: string;
  datasetId?: string;
  analysisType?: 'insights' | 'recommendations' | 'trends' | 'general';
}

interface DatasetSummary {
  id: string;
  filename: string;
  rows_count: number;
  columns: string[];
  sample_data: any[];
  summary_stats: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('AI Dataset Analysis function called');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { question, datasetId, analysisType = 'general' }: AnalysisRequest = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing question: "${question}" for dataset: ${datasetId || 'all'}`);

    // Get available datasets
    let datasets: DatasetSummary[] = [];
    
    if (datasetId) {
      // Get specific dataset
      const { data: dataset, error: datasetError } = await supabase
        .from('datasets')
        .select('id, filename, rows_count, columns, sample_data, summary_stats')
        .eq('id', datasetId)
        .eq('status', 'processed')
        .single();

      if (datasetError) {
        console.error('Error fetching specific dataset:', datasetError);
        return new Response(
          JSON.stringify({ error: 'Dataset not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      datasets = [dataset];
    } else {
      // Get all processed datasets
      const { data: allDatasets, error: datasetsError } = await supabase
        .from('datasets')
        .select('id, filename, rows_count, columns, sample_data, summary_stats')
        .eq('status', 'processed')
        .order('created_at', { ascending: false })
        .limit(5);

      if (datasetsError) {
        console.error('Error fetching datasets:', datasetsError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch datasets' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      datasets = allDatasets || [];
    }

    if (datasets.length === 0) {
      return new Response(
        JSON.stringify({ 
          response: "I don't see any uploaded datasets yet. Please upload some sustainability data files first, and I'll be able to analyze them for you!",
          suggestions: [
            "Upload a CSV file with energy data",
            "Upload sustainability metrics",
            "Upload supplier compliance data"
          ]
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get sustainability metrics for these datasets
    const datasetIds = datasets.map(d => d.id);
    const { data: metrics } = await supabase
      .from('sustainability_metrics')
      .select('*')
      .in('dataset_id', datasetIds);

    // Analyze the question and generate response
    const analysisResult = analyzeDataAndQuestion(question, datasets, metrics || [], analysisType);

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify(analysisResult),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in AI dataset analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: errorMessage
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function analyzeDataAndQuestion(
  question: string, 
  datasets: DatasetSummary[], 
  metrics: any[], 
  analysisType: string
) {
  const lowerQuestion = question.toLowerCase();
  
  // Calculate aggregate metrics
  const totalRows = datasets.reduce((sum, d) => sum + d.rows_count, 0);
  const totalDatasets = datasets.length;
  
  const aggregateMetrics = metrics.reduce((acc, m) => ({
    totalEnergy: acc.totalEnergy + (m.total_energy_mwh || 0),
    totalCO2: acc.totalCO2 + (m.co2_emissions_kg || 0),
    renewableShare: acc.renewableShare + (m.renewable_share || 0),
    sustainabilityScore: acc.sustainabilityScore + (m.sustainability_score || 0),
    count: acc.count + 1
  }), { totalEnergy: 0, totalCO2: 0, renewableShare: 0, sustainabilityScore: 0, count: 0 });

  const avgSustainabilityScore = aggregateMetrics.count > 0 
    ? Math.round(aggregateMetrics.sustainabilityScore / aggregateMetrics.count) 
    : 0;
  
  const avgRenewableShare = aggregateMetrics.count > 0 
    ? Math.round(aggregateMetrics.renewableShare / aggregateMetrics.count) 
    : 0;

  // Generate contextual responses based on question content
  if (lowerQuestion.includes('carbon') || lowerQuestion.includes('co2') || lowerQuestion.includes('emission')) {
    return {
      response: `Based on your uploaded data (${totalDatasets} datasets, ${totalRows} total records), here's your carbon footprint analysis:

🌍 **Current CO2 Emissions**: ${aggregateMetrics.totalCO2.toFixed(0)} kg
📊 **Sustainability Score**: ${avgSustainabilityScore}/100
🔋 **Renewable Energy**: ${avgRenewableShare}% average across facilities

**Key Findings:**
• Your data shows ${totalRows} sustainability data points across ${totalDatasets} datasets
• Current renewable energy adoption is at ${avgRenewableShare}%
• Potential for ${100 - avgRenewableShare}% improvement in renewable energy

**Recommendations:**
• Increase renewable energy sources to reach 80%+ target
• Focus on high-emission facilities for maximum impact
• Implement energy efficiency measures in buildings`,
      suggestions: [
        "Show detailed emissions breakdown",
        "Compare facilities performance",
        "Generate carbon reduction plan",
        "What are my top emission sources?"
      ]
    };
  }

  if (lowerQuestion.includes('energy') || lowerQuestion.includes('consumption')) {
    return {
      response: `Energy analysis from your ${totalDatasets} uploaded datasets:

⚡ **Total Energy Consumption**: ${aggregateMetrics.totalEnergy.toFixed(1)} MWh
🌱 **Renewable Share**: ${avgRenewableShare}%
📈 **Efficiency Score**: ${avgSustainabilityScore}/100

**Energy Insights:**
• Analyzing ${totalRows} data points from your uploaded files
• Current renewable energy portfolio: ${avgRenewableShare}%
• Energy efficiency opportunities identified

**Quick Wins:**
• LED lighting upgrades (15-20% savings)
• Smart HVAC systems (25% reduction)
• Solar panel installation potential assessment`,
      suggestions: [
        "Show energy consumption trends",
        "Calculate solar potential",
        "Find efficiency opportunities",
        "Compare with benchmarks"
      ]
    };
  }

  if (lowerQuestion.includes('score') || lowerQuestion.includes('rating') || lowerQuestion.includes('performance')) {
    return {
      response: `Sustainability Performance Analysis:

🎯 **Overall Score**: ${avgSustainabilityScore}/100
📊 **Data Coverage**: ${totalDatasets} datasets, ${totalRows} records
🔄 **Renewable Energy**: ${avgRenewableShare}%

**Performance Breakdown:**
• Your uploaded data shows consistent tracking across multiple metrics
• Score calculation based on renewable energy, emissions, and efficiency
• Benchmarking against industry standards (average: 65-75)

**Score Drivers:**
• Renewable energy adoption: ${avgRenewableShare}%
• Data quality and coverage: Excellent (${totalRows} data points)
• Sustainability program maturity: Well-established`,
      suggestions: [
        "How to improve my score?",
        "Compare with industry peers",
        "Show improvement roadmap",
        "What's my biggest opportunity?"
      ]
    };
  }

  if (lowerQuestion.includes('trend') || lowerQuestion.includes('time') || lowerQuestion.includes('progress')) {
    const datasetInfo = datasets.map(d => `• ${d.filename}: ${d.rows_count} records`).join('\n');
    
    return {
      response: `Trend Analysis from Your Uploaded Data:

📈 **Data Overview:**
${datasetInfo}

**Trend Insights:**
• ${totalRows} total data points available for analysis
• Multiple datasets enable comprehensive trend analysis
• Current sustainability score: ${avgSustainabilityScore}/100

**Progress Indicators:**
• Data collection consistency: Excellent
• Metric coverage: Comprehensive sustainability tracking
• Improvement potential: Focus on renewable energy adoption

*Note: For detailed time-series analysis, upload data with timestamp columns for month-over-month trends.*`,
      suggestions: [
        "Upload timestamped data",
        "Show performance over time",
        "Compare recent vs older data",
        "What's my improvement rate?"
      ]
    };
  }

  if (lowerQuestion.includes('supplier') || lowerQuestion.includes('vendor') || lowerQuestion.includes('supply chain')) {
    const hasSupplierData = datasets.some(d => 
      d.columns && (
        d.columns.includes('Supplier') || 
        d.columns.includes('supplier') ||
        d.columns.includes('Vendor') ||
        d.columns.includes('vendor')
      )
    );

    if (hasSupplierData) {
      return {
        response: `Supply Chain Sustainability Analysis:

🏢 **Supplier Data Found**: Yes, in your uploaded datasets
📊 **Analysis Scope**: ${totalDatasets} datasets with supplier information

**Supplier Insights:**
• Supplier sustainability metrics detected in uploaded data
• Overall supply chain score contributes to ${avgSustainabilityScore}/100 rating
• Opportunity for supplier engagement programs

**Recommendations:**
• Implement supplier sustainability scorecards
• Set renewable energy targets for key suppliers
• Create supplier collaboration programs for emission reduction`,
        suggestions: [
          "Show supplier performance ranking",
          "Identify top sustainable suppliers",
          "Find improvement opportunities",
          "Create supplier action plan"
        ]
      };
    } else {
      return {
        response: `Supply Chain Analysis Request:

📊 **Current Data**: ${totalDatasets} datasets analyzed
⚠️ **Supplier Data**: Not detected in current uploads

**To analyze your supply chain:**
• Upload data with supplier/vendor columns
• Include supplier sustainability metrics
• Add supplier compliance information

**Meanwhile, based on your current data:**
• Overall sustainability score: ${avgSustainabilityScore}/100
• Focus on renewable energy: ${avgRenewableShare}% current adoption`,
        suggestions: [
          "Upload supplier sustainability data",
          "What data format is needed?",
          "Show general sustainability insights",
          "How to track supplier performance?"
        ]
      };
    }
  }

  // Default comprehensive analysis
  return {
    response: `Comprehensive Analysis of Your Sustainability Data:

📊 **Data Overview:**
• ${totalDatasets} datasets uploaded and processed
• ${totalRows} total sustainability data points
• Overall sustainability score: ${avgSustainabilityScore}/100

**Key Insights:**
• Renewable energy adoption: ${avgRenewableShare}%
• Total energy consumption: ${aggregateMetrics.totalEnergy.toFixed(1)} MWh
• CO2 emissions tracked: ${aggregateMetrics.totalCO2.toFixed(0)} kg

**Available Analysis:**
• Energy consumption patterns
• Carbon footprint assessment
• Renewable energy opportunities
• Performance benchmarking

**Your Data Quality**: Excellent! You have sufficient data for comprehensive sustainability analysis.`,
    suggestions: [
      "Analyze carbon footprint",
      "Show energy consumption trends",
      "Find improvement opportunities",
      "Compare with industry benchmarks"
    ]
  };
}