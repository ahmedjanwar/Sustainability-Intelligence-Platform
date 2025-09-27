import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUploadedDatasets } from '@/hooks/useUploadedDatasets';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Table, 
  Loader2,
  FileSpreadsheet,
  Image,
  TrendingUp,
  Factory,
  Zap,
  Droplets
} from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const Reports: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState<string>('sustainability_overview');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('last_30_days');
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { 
    datasets, 
    selectedDataset, 
    datasetData, 
    calculateMetricsFromDataset,
    setSelectedDataset
  } = useUploadedDatasets();

  const reportTypes = [
    { value: 'sustainability_overview', label: 'Sustainability Overview', icon: BarChart3 },
    { value: 'emissions_detailed', label: 'Emissions Analysis', icon: Factory },
    { value: 'energy_efficiency', label: 'Energy Efficiency Report', icon: Zap },
    { value: 'water_usage', label: 'Water Usage Report', icon: Droplets },
    { value: 'executive_summary', label: 'Executive Summary', icon: FileText },
  ];

  const periods = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  // Handle dataset changes
  useEffect(() => {
    if (selectedDataset) {
      console.log('Selected dataset changed:', selectedDataset);
      setIsLoadingData(true);
      
      // Show toast notification for dataset change
      toast({
        title: "Dataset Changed",
        description: `Switched to ${selectedDataset.original_filename}`,
      });
      
      // Simulate a brief loading state for better UX
      const timer = setTimeout(() => {
        setIsLoadingData(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedDataset, toast]);

  // Debug datasets
  useEffect(() => {
    console.log('Datasets updated:', datasets);
  }, [datasets]);

  // Calculate metrics for the report
  const metrics = selectedDataset ? calculateMetricsFromDataset(datasetData) : null;

  // Prepare chart data
  const emissionsData = datasetData?.slice(0, 10).map((row, index) => ({
    name: `Day ${index + 1}`,
    co2: row.data?.CO2_Emissions_kg || 0,
    energy: row.data?.Energy_Consumption_kWh || 0,
  })) || [];

  const facilitiesData = datasetData?.reduce((acc: any[], row) => {
    const facility = row.data?.Facility;
    if (facility) {
      const existing = acc.find(item => item.name === facility);
      if (existing) {
        existing.emissions += row.data?.CO2_Emissions_kg || 0;
        existing.energy += row.data?.Energy_Consumption_kWh || 0;
        existing.count += 1;
      } else {
        acc.push({
          name: facility,
          emissions: row.data?.CO2_Emissions_kg || 0,
          energy: row.data?.Energy_Consumption_kWh || 0,
          count: 1,
        });
      }
    }
    return acc;
  }, []).slice(0, 5) || [];

  const regionData = datasetData?.reduce((acc: any[], row) => {
    const region = row.data?.Region;
    if (region) {
      const existing = acc.find(item => item.name === region);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: region, value: 1 });
      }
    }
    return acc;
  }, []) || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const generateAndDownloadReport = async () => {
    if (!selectedDataset) {
      toast({
        title: "No Data Selected",
        description: "Please select a dataset to generate a report.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      // Store report in database first
      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          title: `${reportTypes.find(rt => rt.value === selectedReportType)?.label || 'Report'} - ${format(new Date(), 'MMM dd, yyyy')}`,
          description: `Generated report for ${selectedDataset.original_filename}`,
          report_type: selectedReportType,
          dataset_id: selectedDataset.id,
          language: 'en',
        })
        .select()
        .single();

      if (error) throw error;

      // Generate PDF
      await generatePDF();

      toast({
        title: "Report Generated & Downloaded",
        description: "Your sustainability report has been generated and downloaded as PDF.",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;

    try {
      // Create a temporary div for PDF generation with better styling
      const clonedElement = reportRef.current.cloneNode(true) as HTMLElement;
      
      // Create a temporary container
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      
      // Override some styles for better PDF appearance
      const style = document.createElement('style');
      style.textContent = `
        .print\\:shadow-none { box-shadow: none !important; }
        .print\\:border { border: 1px solid #e5e7eb !important; }
        .print\\:border-0 { border: none !important; }
        .print\\:break-inside-avoid { break-inside: avoid !important; }
        .print\\:space-y-4 > * + * { margin-top: 1rem !important; }
        .print\\:p-4 { padding: 1rem !important; }
        * { color: black !important; }
        .text-primary { color: #3b82f6 !important; }
        .text-green-600 { color: #059669 !important; }
        .text-blue-600 { color: #2563eb !important; }
        .text-purple-600 { color: #7c3aed !important; }
        .text-muted-foreground { color: #6b7280 !important; }
        .bg-muted { background-color: #f9fafb !important; }
        .border { border: 1px solid #e5e7eb !important; }
        table { border-collapse: collapse !important; }
        th, td { border: 1px solid #e5e7eb !important; padding: 8px !important; }
        .recharts-wrapper { margin: 10px 0 !important; }
      `;
      
      tempDiv.appendChild(style);
      tempDiv.appendChild(clonedElement);
      document.body.appendChild(tempDiv);

      // Wait a bit for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight,
        logging: false,
      });

      // Remove temporary element
      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate dimensions to fit the page
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      
      // Center the image
      const x = (pdfWidth - scaledWidth) / 2;
      const y = 10; // Small margin from top

      // If content is too tall, split into multiple pages
      if (scaledHeight > pdfHeight - 20) {
        // For very tall content, we'll just scale it to fit one page
        const maxHeight = pdfHeight - 20;
        const adjustedRatio = Math.min(pdfWidth / imgWidth, maxHeight / imgHeight);
        const adjustedWidth = imgWidth * adjustedRatio;
        const adjustedHeight = imgHeight * adjustedRatio;
        
        pdf.addImage(imgData, 'PNG', (pdfWidth - adjustedWidth) / 2, y, adjustedWidth, adjustedHeight);
      } else {
        pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      }

      // Download the PDF
      const fileName = `sustainability_report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const downloadReport = async (downloadFormat: 'pdf' | 'excel' | 'png') => {
    setDownloading(true);
    try {
      if (downloadFormat === 'pdf') {
        await generatePDF();
      } else if (downloadFormat === 'excel') {
        // For Excel, we'll create a CSV download
        const csvData = datasetData?.map(row => row.data).slice(0, 100) || [];
        if (csvData.length > 0) {
          const headers = Object.keys(csvData[0]);
          const csvContent = [
            headers.join(','),
            ...csvData.map(row => headers.map(header => row[header] || '').join(','))
          ].join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `sustainability_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }

      toast({
        title: "Download Started",
        description: `Report download in ${downloadFormat.toUpperCase()} format has been initiated.`,
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Sustainability Reports</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Generate comprehensive reports with charts, tables, and insights
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dataset</label>
              <Select 
                value={selectedDataset?.id || ''} 
                onValueChange={(datasetId) => {
                  console.log('Dataset selection changed:', datasetId);
                  console.log('Available datasets:', datasets);
                  const dataset = datasets.find(d => d.id === datasetId);
                  console.log('Found dataset:', dataset);
                  if (dataset) {
                    setSelectedDataset(dataset);
                  }
                }}
                disabled={isLoadingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a dataset" />
                  {isLoadingData && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                </SelectTrigger>
                <SelectContent>
                  {datasets.length > 0 ? (
                    datasets.map((dataset) => (
                      <SelectItem key={dataset.id} value={dataset.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="font-medium">{dataset.original_filename}</span>
                            <span className="text-xs text-muted-foreground">
                              {dataset.created_at ? format(new Date(dataset.created_at), 'MMM dd, yyyy') : 'Unknown date'}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>No datasets available</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Dataset Info */}
          {selectedDataset && (
            <div className="p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{selectedDataset.original_filename}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {datasetData?.length || 0} records
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Uploaded {selectedDataset.created_at ? format(new Date(selectedDataset.created_at), 'MMM dd, yyyy') : 'Unknown date'}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Active Dataset
                </Badge>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={generateAndDownloadReport} 
              disabled={generating || !selectedDataset}
              className="flex items-center gap-2"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
              Generate & Download PDF
            </Button>

            <Button 
              variant="outline" 
              onClick={() => downloadReport('excel')}
              disabled={downloading || !selectedDataset}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {selectedDataset && (
        <div className="space-y-6">
          {isLoadingData ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-4" />
                <h3 className="text-lg font-semibold mb-2">Loading Report Data</h3>
                <p className="text-muted-foreground">
                  Preparing report for {selectedDataset.original_filename}...
                </p>
              </CardContent>
            </Card>
          ) : (
            <div ref={reportRef} className="space-y-6 print:space-y-4">
          {/* Report Header */}
          <Card className="print:shadow-none print:border-0">
            <CardContent className="p-6 print:p-4">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-primary">
                  {reportTypes.find(rt => rt.value === selectedReportType)?.label || 'Sustainability Report'}
                </h1>
                <p className="text-muted-foreground">
                  Generated on {format(new Date(), 'MMMM dd, yyyy')} • Dataset: {selectedDataset.original_filename}
                </p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline">{datasetData?.length || 0} Records</Badge>
                  <Badge variant="outline">{periods.find(p => p.value === selectedPeriod)?.label}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Summary */}
          {metrics && (
            <Card className="print:shadow-none print:border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{metrics.sustainabilityScore}</div>
                    <div className="text-sm text-muted-foreground">Sustainability Score</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{metrics.energyReduction}%</div>
                    <div className="text-sm text-muted-foreground">Energy Reduction</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{metrics.emissionsReduction}%</div>
                    <div className="text-sm text-muted-foreground">Emissions Reduction</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{metrics.supplierCompliance}%</div>
                    <div className="text-sm text-muted-foreground">Supplier Compliance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emissions Trend Chart */}
            <Card className="print:shadow-none print:border print:break-inside-avoid">
              <CardHeader>
                <CardTitle className="text-lg">Emissions & Energy Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={emissionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="co2" stroke="#ef4444" name="CO2 Emissions (kg)" />
                    <Line type="monotone" dataKey="energy" stroke="#3b82f6" name="Energy (kWh)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Regional Distribution */}
            <Card className="print:shadow-none print:border print:break-inside-avoid">
              <CardHeader>
                <CardTitle className="text-lg">Regional Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={regionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Facilities Performance */}
          <Card className="print:shadow-none print:border print:break-inside-avoid">
            <CardHeader>
              <CardTitle className="text-lg">Facilities Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={facilitiesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="emissions" fill="#ef4444" name="CO2 Emissions (kg)" />
                  <Bar dataKey="energy" fill="#3b82f6" name="Energy Consumption (kWh)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card className="print:shadow-none print:border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Raw Data Summary (First 10 Records)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2 text-left">Facility</th>
                      <th className="border p-2 text-left">Region</th>
                      <th className="border p-2 text-right">CO2 Emissions (kg)</th>
                      <th className="border p-2 text-right">Energy (kWh)</th>
                      <th className="border p-2 text-right">Water Usage (L)</th>
                      <th className="border p-2 text-right">Renewable %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasetData?.slice(0, 10).map((row, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="border p-2">{row.data?.Facility || '-'}</td>
                        <td className="border p-2">{row.data?.Region || '-'}</td>
                        <td className="border p-2 text-right">{row.data?.CO2_Emissions_kg?.toLocaleString() || '-'}</td>
                        <td className="border p-2 text-right">{row.data?.Energy_Consumption_kWh?.toLocaleString() || '-'}</td>
                        <td className="border p-2 text-right">{row.data?.Water_Usage_Liters?.toLocaleString() || '-'}</td>
                        <td className="border p-2 text-right">{row.data?.Renewable_Energy_Percentage ? `${row.data.Renewable_Energy_Percentage}%` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Report Footer */}
          <Card className="print:shadow-none print:border-0">
            <CardContent className="p-6 print:p-4 text-center">
              <p className="text-sm text-muted-foreground">
                This report was generated automatically from uploaded sustainability data.
                For questions or support, please contact your system administrator.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Report ID: RPT-{format(new Date(), 'yyyyMMdd-HHmmss')} | Generated by Sustainability Dashboard
              </p>
            </CardContent>
          </Card>
            </div>
          )}
        </div>
      )}

      {/* No Data State */}
      {!selectedDataset && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {datasets.length === 0 ? 'No Datasets Available' : 'No Dataset Selected'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {datasets.length === 0 
                ? 'Please upload a dataset first to generate comprehensive sustainability reports.'
                : 'Please select a dataset from the dropdown above to generate reports.'
              }
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline">
                {datasets.length === 0 ? 'Upload data to get started' : 'Select a dataset to continue'}
              </Badge>
              {datasets.length > 0 && (
                <Badge variant="secondary">
                  {datasets.length} dataset{datasets.length !== 1 ? 's' : ''} available
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};