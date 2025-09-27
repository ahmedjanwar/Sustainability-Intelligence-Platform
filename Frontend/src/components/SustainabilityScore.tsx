import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SustainabilityScoreProps {
  score: number;
  previousScore?: number;
  className?: string;
}

const SustainabilityScore = ({ score, previousScore, className }: SustainabilityScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-success to-accent";
    if (score >= 60) return "from-warning to-yellow-400";
    return "from-destructive to-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const scoreChange = previousScore ? score - previousScore : 0;
  const isImproving = scoreChange > 0;

  return (
    <Card className={`relative overflow-hidden shadow-card border-2 hover:shadow-glow transition-all duration-300 ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${getScoreGradient(score)} opacity-5`} />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between text-xl">
          <span>Sustainability Score</span>
          {previousScore && (
            <Badge variant={isImproving ? "default" : "destructive"} className="flex items-center gap-1">
              {isImproving ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {scoreChange > 0 ? "+" : ""}{scoreChange.toFixed(1)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* Circular Progress Background */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(score / 100) * 314} 314`}
                className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
                {score}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <Badge 
            variant="outline" 
            className={`text-sm px-4 py-1 ${getScoreColor(score)} border-current`}
          >
            {getScoreLabel(score)}
          </Badge>
          
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Your overall sustainability performance across energy, emissions, and supply chain metrics.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SustainabilityScore;