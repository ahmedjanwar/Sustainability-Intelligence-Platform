import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InsightRequest {
  type: 'impact_breakdown' | 'recommendations' | 'dashboard_insights';
  currentParams?: {
    renewableEnergy: number;
    emissionReduction: number;
    supplyChainScore: number;
  };
  originalParams?: {
    renewableEnergy: number;
    emissionReduction: number;
    supplyChainScore: number;
  };
  scoreChange?: number;
  metrics?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { type, currentParams, originalParams, scoreChange, metrics }: InsightRequest = await req.json();

    let prompt = '';
    
    switch (type) {
      case 'impact_breakdown':
        prompt = `Analyze the sustainability parameter changes and provide a detailed impact breakdown:
        
        Original Parameters:
        - Renewable Energy: ${originalParams?.renewableEnergy}%
        - Emissions: ${originalParams?.emissionReduction} tons CO2
        - Supply Chain Score: ${originalParams?.supplyChainScore}
        
        Current Parameters:
        - Renewable Energy: ${currentParams?.renewableEnergy}%
        - Emissions: ${currentParams?.emissionReduction} tons CO2
        - Supply Chain Score: ${currentParams?.supplyChainScore}
        
        Score Change: ${scoreChange} points
        
        Provide a concise analysis of:
        1. Which changes have the most impact
        2. Environmental implications
        3. Business considerations
        Keep it under 100 words and actionable.`;
        break;
        
      case 'recommendations':
        prompt = `Based on these sustainability parameter changes, provide 2-3 specific, actionable recommendations in 2-3 sentences only:
        
        Current vs Original:
        - Renewable Energy: ${currentParams?.renewableEnergy}% (was ${originalParams?.renewableEnergy}%)
        - Emissions: ${currentParams?.emissionReduction} tons CO2 (was ${originalParams?.emissionReduction} tons)
        - Supply Chain Score: ${currentParams?.supplyChainScore} (was ${originalParams?.supplyChainScore})
        
        Score Impact: ${scoreChange} points
        
        Provide specific actions they can take. Be practical, concise, and limit to 2-3 sentences total.`;
        break;
        
      case 'dashboard_insights':
        prompt = `Analyze this sustainability data and provide strategic insights:
        
        Metrics: ${JSON.stringify(metrics, null, 2)}
        
        Provide:
        1. Key performance highlights
        2. Areas for improvement
        3. Strategic recommendations
        4. Market trends alignment
        
        Keep it executive-level, under 150 words, and actionable.`;
        break;
        
      default:
        throw new Error('Invalid insight type');
    }

    console.log('Sending request to OpenAI with prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a sustainability expert providing concise, actionable insights. Be specific, practical, and professional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const insight = data.choices[0].message.content;

    console.log('Generated insight:', insight);

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-insights function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});