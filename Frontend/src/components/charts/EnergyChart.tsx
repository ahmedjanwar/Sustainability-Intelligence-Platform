import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { Zap, TrendingUp } from "lucide-react";

interface EnergyChartProps {
  datasetData: Array<{ row_number: number; data: any }>;
}

const EnergyChart = ({ datasetData }: EnergyChartProps) => {

  // Process data for chart - aggregate by facility/region
  const processedData = datasetData.slice(0, 10).map((item, index) => {
    const data = item.data;
    return {
      facility: data.Facility || data.facility || data.Region || data.region || 
                data.Supplier || data.supplier || `Location ${index + 1}`,
      consumption: parseFloat(data.Energy_Consumption_kWh || data.energy_consumption_kwh || 
                             data['Energy Consumption (kWh)'] || 0) / 1000, // Convert to MWh
      renewable: parseFloat(data.Renewable_Energy_Percentage || data.renewable_energy_percentage || 
                           data['Renewable Energy (%)'] || 0),
      heat: parseFloat(data.Heat_Generation_MWh || data.heat_generation_mwh || 0),
      electricity: parseFloat(data.Electricity_Generation_MWh || data.electricity_generation_mwh || 0),
    };
  });

  const totalConsumption = processedData.reduce((sum, item) => sum + item.consumption, 0);
  const avgRenewable = processedData.length > 0 ? 
    processedData.reduce((sum, item) => sum + item.renewable, 0) / processedData.length : 0;

  if (!datasetData || datasetData.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Energy Consumption
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">No energy data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Color mapping based on renewable percentage
  const getBarColor = (renewable: number) => {
    if (renewable >= 80) return "hsl(var(--success))";
    if (renewable >= 60) return "hsl(var(--primary))";
    if (renewable >= 40) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  return (
    <Card className="shadow-card hover:shadow-glow transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Energy Consumption
          </div>
          <Badge variant="outline" className="flex items-center gap-1 text-success border-success/50">
            <TrendingUp className="h-3 w-3" />
            {avgRenewable.toFixed(1)}% renewable
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {totalConsumption.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">MWh</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Energy usage from uploaded data
          </p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="facility" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
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
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)} ${name === "renewable" ? "%" : "MWh"}`,
                  name === "consumption" ? "Energy Consumption" : 
                  name === "renewable" ? "Renewable %" :
                  name === "heat" ? "Heat Generation" : "Electricity Generation"
                ]}
              />
              <Bar dataKey="consumption" name="consumption" radius={[4, 4, 0, 0]}>
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.renewable)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Renewable Energy Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-muted-foreground">80%+ Renewable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-muted-foreground">60-79% Renewable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span className="text-muted-foreground">40-59% Renewable</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span className="text-muted-foreground">Below 40%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnergyChart;