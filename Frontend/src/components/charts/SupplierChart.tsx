import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from "recharts";
import { Users, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface SupplierChartProps {
  datasetData: Array<{ row_number: number; data: any }>;
}

const SupplierChart = ({ datasetData }: SupplierChartProps) => {

  // Process supplier data
  const supplierAnalysis = datasetData.reduce((acc: any, item) => {
    const data = item.data;
    const supplier = data.Supplier || data.supplier || data.Company || data.company || data.Organization;
    const renewable = parseFloat(data.Renewable_Energy_Percentage || data.renewable_energy_percentage || 
                                data['Renewable Energy (%)'] || 0);
    const wasteRecycled = parseFloat(data.Recycled_Waste_Percentage || data.recycled_waste_percentage || 
                                   data['Recycled Waste (%)'] || 0);
    
    if (supplier && renewable !== undefined) {
      if (!acc[supplier]) {
        acc[supplier] = {
          renewableAvg: 0,
          wasteRecycledAvg: 0,
          count: 0
        };
      }
      acc[supplier].renewableAvg += renewable;
      acc[supplier].wasteRecycledAvg += wasteRecycled;
      acc[supplier].count += 1;
    }
    return acc;
  }, {});

  // Calculate compliance levels
  const supplierCompliance = Object.entries(supplierAnalysis).map(([supplier, data]: [string, any]) => {
    const avgRenewable = data.renewableAvg / data.count;
    const avgWasteRecycled = data.wasteRecycledAvg / data.count;
    const score = (avgRenewable + avgWasteRecycled) / 2;
    
    let compliance = "Non-Compliant";
    if (score >= 70) compliance = "Fully Compliant";
    else if (score >= 40) compliance = "Partially Compliant";
    
    return { supplier, score, compliance };
  });

  const complianceData = [
    { 
      name: "Fully Compliant", 
      value: supplierCompliance.filter(s => s.compliance === "Fully Compliant").length,
      color: "hsl(var(--success))", 
      icon: CheckCircle 
    },
    { 
      name: "Partially Compliant", 
      value: supplierCompliance.filter(s => s.compliance === "Partially Compliant").length,
      color: "hsl(var(--warning))", 
      icon: AlertTriangle 
    },
    { 
      name: "Non-Compliant", 
      value: supplierCompliance.filter(s => s.compliance === "Non-Compliant").length,
      color: "hsl(var(--destructive))", 
      icon: XCircle 
    },
  ];

  const totalSuppliers = complianceData.reduce((sum, item) => sum + item.value, 0);
  const complianceRate = totalSuppliers > 0 ? (complianceData[0].value / totalSuppliers * 100) : 0;

  if (!datasetData || datasetData.length === 0 || totalSuppliers === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Supplier Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No supplier data available in uploaded dataset
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-soft">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} suppliers ({((data.value / totalSuppliers) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-card hover:shadow-glow transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Supplier Compliance
          </div>
          <Badge variant="outline" className="flex items-center gap-1 text-success border-success/50">
            <CheckCircle className="h-3 w-3" />
            {complianceRate.toFixed(1)}% compliant
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Supplier Stats */}
          <div className="space-y-4">
            <div className="text-center lg:text-left">
              <div className="flex items-baseline gap-2 justify-center lg:justify-start">
                <span className="text-3xl font-bold text-foreground">
                  {totalSuppliers}
                </span>
                <span className="text-sm text-muted-foreground">total suppliers</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Active sustainability partners
              </p>
            </div>

            {/* Compliance Breakdown */}
            <div className="space-y-3">
              {complianceData.map((item, index) => {
                const Icon = item.icon;
                const percentage = totalSuppliers > 0 ? (item.value / totalSuppliers * 100) : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" style={{ color: item.color }} />
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-foreground">{item.value}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Key Metrics */}
            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-success">{complianceData[0].value}</div>
                  <div className="text-xs text-muted-foreground">Certified Partners</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-warning">{complianceData[1].value}</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierChart;