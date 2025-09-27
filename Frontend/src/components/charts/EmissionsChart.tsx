import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { Factory, TrendingDown } from "lucide-react";

interface EmissionsChartProps {
  datasetData: Array<{ row_number: number; data: any }>;
}

const EmissionsChart = ({ datasetData }: EmissionsChartProps) => {

  // Process data for chart
  const chartData = datasetData.slice(0, 12).map((item, index) => {
    const data = item.data;
    const month = data.Timestamp || data.timestamp || data.Month || data.month || 
                 new Date(2024, index).toLocaleDateString('en', { month: 'short' });
    
    return {
      month: typeof month === 'string' && month.includes('/') ? 
        new Date(month).toLocaleDateString('en', { month: 'short' }) : 
        month,
      emissions: parseFloat(data.CO2_Emissions_kg || data.co2_emissions_kg || data['CO2 Emissions (kg)'] || 0) / 1000, // Convert to tonnes
      transport: parseFloat(data.Transport_Emissions || data.transport_emissions || 0) / 1000,
      industry: parseFloat(data.Industrial_Emissions || data.industrial_emissions || 0) / 1000,
      buildings: parseFloat(data.Building_Emissions || data.building_emissions || 0) / 1000,
    };
  });

  const currentEmissions = chartData.length > 0 ? chartData[chartData.length - 1].emissions : 0;
  const previousEmissions = chartData.length > 0 ? chartData[0].emissions : 0;
  const reduction = previousEmissions > 0 ? ((previousEmissions - currentEmissions) / previousEmissions * 100) : 0;

  if (!datasetData || datasetData.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-primary" />
            Carbon Emissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">No emissions data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card hover:shadow-glow transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-primary" />
            Carbon Emissions
          </div>
          <Badge variant="outline" className="flex items-center gap-1 text-success border-success/50">
            <TrendingDown className="h-3 w-3" />
            -{reduction.toFixed(1)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {currentEmissions.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">tonnes CO₂e</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Carbon footprint from uploaded data
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="emissionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  boxShadow: "var(--shadow-soft)"
                }}
              />
              <Area
                type="monotone"
                dataKey="emissions"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="url(#emissionsGradient)"
                name="Total CO2/cap"
              />
              <Area
                type="monotone"
                dataKey="transport"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                fill="hsl(var(--success))"
                fillOpacity={0.1}
                name="Transport"
              />
              <Area
                type="monotone"
                dataKey="industry"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fill="hsl(var(--accent))"
                fillOpacity={0.1}
                name="Power Industry"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmissionsChart;