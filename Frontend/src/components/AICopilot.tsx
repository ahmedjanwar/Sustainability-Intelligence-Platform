import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useUploadedDatasets } from "@/hooks/useUploadedDatasets";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  TrendingUp,
  Leaf,
  Clock,
  Database
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const AICopilot = () => {
  const { datasets } = useUploadedDatasets();
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("all");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Hello! I'm your Sustainability AI Assistant. Upload some sustainability data first, and I'll be able to analyze it and provide insights. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "How do I upload data?",
        "What file formats are supported?",
        "What metrics can you analyze?",
        "Show me an example analysis"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string = inputMessage) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      // Call the enhanced AI copilot chat function
      const { data, error } = await supabase.functions.invoke('ai-copilot-chat', {
        body: {
          message: message,
          datasetId: selectedDatasetId,
          conversationHistory: conversationHistory
        }
      });

      if (error) {
        console.error('Error calling AI copilot function:', error);
        throw error;
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.response || "I'm sorry, I couldn't process your request right now. Please try again.",
        timestamp: new Date(),
        suggestions: data.suggestions || []
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: datasets.length === 0 
          ? "I don't see any uploaded datasets yet. Please upload some sustainability data files first, and I'll be able to analyze them for you!"
          : "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
        suggestions: datasets.length === 0 ? [
          "Upload sustainability data",
          "What file formats are supported?",
          "Show me example data structure"
        ] : [
          "Try asking about carbon footprint",
          "Ask about energy efficiency",
          "Request sustainability score"
        ]
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // Update initial message when datasets change
  useEffect(() => {
    setMessages(prev => {
      const updated = [...prev];
      updated[0] = {
        ...updated[0],
        content: datasets.length > 0 
          ? `Hello! I'm your Sustainability AI Assistant. I can see you have ${datasets.length} dataset(s) uploaded. I can analyze your data, provide insights, and answer questions about your sustainability metrics. What would you like to know?`
          : "Hello! I'm your Sustainability AI Assistant. Upload some sustainability data first, and I'll be able to analyze it and provide insights. What would you like to know?",
        suggestions: datasets.length > 0 ? [
          "Analyze my carbon footprint",
          "Show energy efficiency trends", 
          "What are my sustainability risks?",
          "Generate improvement recommendations"
        ] : [
          "How do I upload data?",
          "What file formats are supported?",
          "What metrics can you analyze?",
          "Show me an example analysis"
        ]
      };
      return updated;
    });
  }, [datasets.length]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">AI Copilot</h2>
        <p className="text-muted-foreground">
          Get intelligent insights and recommendations for your sustainability journey.
        </p>
      </div>

      {/* Chat Interface */}
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm h-[600px] flex flex-col">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-3">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-card rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-lg font-semibold">AI Sustainability Assistant</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Ready to help</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Dataset Selection */}
          {datasets.length > 0 && (
            <div className="p-4 border-b border-border/50 bg-gradient-to-r from-muted/20 to-muted/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-primary/10 rounded-md">
                  <Database className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Choose dataset to analyze:</span>
              </div>
              <Select value={selectedDatasetId} onValueChange={setSelectedDatasetId}>
                <SelectTrigger className="w-full bg-card/80 border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <SelectValue placeholder="All datasets" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-sm">
                  <SelectItem value="all" className="hover:bg-primary/10">All datasets</SelectItem>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id} className="hover:bg-primary/10">
                      {dataset.filename} ({dataset.rows_count} rows)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 h-full overflow-hidden" ref={scrollAreaRef}>
            <div className="p-4 space-y-4 min-h-full">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  {message.type === 'ai' && (
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl flex items-center justify-center shadow-sm">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] space-y-2 ${message.type === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`rounded-2xl px-5 py-4 shadow-sm ${
                        message.type === 'user'
                          ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-primary/20'
                          : 'bg-card/80 backdrop-blur-sm text-foreground border border-border/50 shadow-md'
                      }`}
                    >
                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm whitespace-pre-line leading-relaxed mb-0">{message.content}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(message.timestamp)}
                    </div>

                    {/* AI Suggestions */}
                    {message.type === 'ai' && message.suggestions && (
                      <div className="space-y-3 w-full">
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <div className="p-1 bg-amber-500/10 rounded-md">
                            <Lightbulb className="h-3 w-3 text-amber-500" />
                          </div>
                          Suggested actions:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 bg-card/50 border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm hover:shadow-md"
                              onClick={() => handleSendMessage(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {message.type === 'user' && (
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-secondary/80 to-secondary rounded-xl flex items-center justify-center shadow-sm">
                      <User className="h-5 w-5 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-4 justify-start animate-fade-in">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl flex items-center justify-center shadow-sm">
                    <Bot className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl px-5 py-4 shadow-md">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border/50 bg-gradient-to-r from-muted/10 to-muted/20 p-4">
            <div className="flex gap-3">
              <Input
                placeholder="Ask about your sustainability metrics..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-card/80 border-border/50 shadow-sm focus:shadow-md transition-shadow rounded-xl"
              />
              <Button 
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className="px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-primary to-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <div className="p-1 bg-green-500/10 rounded-md">
                <Leaf className="h-3 w-3 text-green-500" />
              </div>
              <span>Powered by sustainable AI technology</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AICopilot;