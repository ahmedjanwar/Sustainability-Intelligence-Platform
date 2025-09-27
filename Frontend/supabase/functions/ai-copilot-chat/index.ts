import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  datasetId?: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration not found');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { message, datasetId, conversationHistory }: ChatRequest = await req.json();

    console.log('AI Copilot request:', { message, datasetId, historyLength: conversationHistory.length });

    // Get dataset context if specified
    let datasetContext = '';
    let datasetMetrics = {};

    if (datasetId && datasetId !== 'all') {
      // Get dataset information
      const { data: dataset } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', datasetId)
        .single();

      if (dataset) {
        // Get sample data for context
        const { data: sampleData } = await supabase
          .from('dataset_data')
          .select('data')
          .eq('dataset_id', datasetId)
          .limit(5);

        // Get sustainability metrics if available
        const { data: metrics } = await supabase
          .from('sustainability_metrics')
          .select('*')
          .eq('dataset_id', datasetId)
          .order('calculated_at', { ascending: false })
          .limit(1);

        if (sampleData && sampleData.length > 0) {
          datasetContext = `
Dataset: ${dataset.filename} (${dataset.rows_count} rows)
Columns: ${dataset.columns ? Object.keys(dataset.columns).join(', ') : 'Unknown'}

Sample data (first 5 rows):
${sampleData.map((row, index) => `Row ${index + 1}: ${JSON.stringify(row.data)}`).join('\n')}
`;
        }

        if (metrics && metrics.length > 0) {
          datasetMetrics = metrics[0];
        }
      }
    } else {
      // Get all datasets context
      const { data: datasets } = await supabase
        .from('datasets')
        .select('filename, rows_count, columns')
        .eq('status', 'processed')
        .order('created_at', { ascending: false });

      if (datasets && datasets.length > 0) {
        datasetContext = `Available datasets:\n${datasets.map(d => 
          `- ${d.filename} (${d.rows_count} rows, columns: ${d.columns ? Object.keys(d.columns).join(', ') : 'Unknown'})`
        ).join('\n')}`;
      }
    }

    // Construct system prompt with context
    const systemPrompt = `You are a specialized Sustainability AI Assistant with expertise in environmental data analysis, carbon footprint reduction, energy efficiency, and ESG reporting. You help organizations understand and improve their sustainability performance.

Your capabilities include:
- Analyzing sustainability data and metrics
- Identifying trends and patterns in environmental performance
- Providing actionable recommendations for improvement
- Explaining complex sustainability concepts in simple terms
- Benchmarking against industry standards
- Suggesting cost-effective sustainability initiatives

Current Context:
${datasetContext}

${Object.keys(datasetMetrics).length > 0 ? `
Current Sustainability Metrics:
${JSON.stringify(datasetMetrics, null, 2)}
` : ''}

CRITICAL FORMATTING GUIDELINES:
- Keep responses short and conversational (maximum 3-4 sentences)
- NEVER use asterisks (*) for emphasis
- NEVER use hashtags (#) for headers
- Use plain text only - no markdown formatting
- Be direct and actionable
- Focus on the most important insight or recommendation
- Use natural language without special characters
- If you need emphasis, use capital letters sparingly or repeat key words

Remember: You're having a casual conversation about sustainability. Be helpful, concise, and speak naturally without any formatting symbols.`;

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI...');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 400,
        temperature: 0.6,
        presence_penalty: 0.2,
        frequency_penalty: 0.2,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Clean up any remaining markdown formatting
    aiResponse = aiResponse
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
      .replace(/^#+\s*/gm, '')         // Remove header markdown
      .replace(/`(.*?)`/g, '$1')       // Remove code markdown
      .trim();

    console.log('Generated clean AI response');

    // Generate contextual suggestions based on the conversation
    const suggestions = generateSuggestions(message, datasetContext, aiResponse);

    return new Response(JSON.stringify({
      response: aiResponse,
      suggestions: suggestions,
      hasDatasetContext: !!datasetContext,
      datasetInfo: datasetId && datasetId !== 'all' ? {
        id: datasetId,
        hasMetrics: Object.keys(datasetMetrics).length > 0
      } : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-copilot-chat function:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to process your request',
      message: error instanceof Error ? error.message : 'Unknown error',
      response: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
      suggestions: [
        "Try asking a simpler question",
        "Check your dataset upload",
        "Ask about sustainability basics",
        "Request help with data analysis"
      ]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateSuggestions(userMessage: string, datasetContext: string, aiResponse: string): string[] {
  const suggestions: string[] = [];
  
  // Context-aware suggestions based on user input and available data
  const lowerMessage = userMessage.toLowerCase();
  const hasData = !!datasetContext;
  
  if (hasData) {
    if (lowerMessage.includes('carbon') || lowerMessage.includes('emission')) {
      suggestions.push(
        "Show me emission trends over time",
        "Compare facilities by carbon footprint",
        "What are the biggest emission sources?"
      );
    } else if (lowerMessage.includes('energy')) {
      suggestions.push(
        "Analyze energy efficiency by facility",
        "Show renewable energy progress",
        "Identify energy saving opportunities"
      );
    } else if (lowerMessage.includes('supplier')) {
      suggestions.push(
        "Rank suppliers by sustainability",
        "Which suppliers need compliance review?",
        "Show supplier improvement trends"
      );
    } else if (lowerMessage.includes('water')) {
      suggestions.push(
        "Show water usage patterns",
        "Identify water conservation opportunities",
        "Compare facilities by water efficiency"
      );
    } else if (lowerMessage.includes('waste')) {
      suggestions.push(
        "Analyze waste generation trends",
        "Show recycling performance",
        "Identify waste reduction opportunities"
      );
    } else {
      // General suggestions when data is available
      suggestions.push(
        "Generate a sustainability summary",
        "Show me key performance indicators",
        "What are my biggest risks?",
        "Create an action plan"
      );
    }
  } else {
    // Suggestions when no data is available
    suggestions.push(
      "Upload sustainability data",
      "What file formats are supported?",
      "Show me example data structure",
      "Explain sustainability metrics"
    );
  }
  
  // Limit to 4 suggestions
  return suggestions.slice(0, 4);
}