import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Download, TrendingUp, Database, Calendar, Hash, Type } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DataPreviewProps {
  datasetId: string;
}

interface Dataset {
  id: string;
  filename: string;
  original_filename: string;
  file_size_mb: number;
  rows_count: number;
  columns: any; // JSON type from Supabase
  sample_data: any[];
  summary_stats: any;
  created_at: string;
  status: string;
}

const DataPreview = ({ datasetId }: DataPreviewProps) => {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatasetDetails();
  }, [datasetId]);

  const fetchDatasetDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch dataset metadata
      const { data: datasetData, error: datasetError } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', datasetId)
        .single();

      if (datasetError) throw datasetError;

      setDataset({
        ...datasetData,
        columns: Array.isArray(datasetData.columns) ? datasetData.columns : [],
        sample_data: Array.isArray(datasetData.sample_data) ? datasetData.sample_data : []
      });

      // Fetch sample data
      const { data: sampleRows, error: sampleError } = await supabase
        .from('dataset_data')
        .select('data')
        .eq('dataset_id', datasetId)
        .order('row_number')
        .limit(10);

      if (sampleError) throw sampleError;

      setSampleData(sampleRows?.map(row => row.data) || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dataset');
    } finally {
      setLoading(false);
    }
  };

  const getColumnIcon = (columnName: string, dataType?: string) => {
    const lowerName = columnName.toLowerCase();
    
    if (dataType === 'number' || lowerName.includes('kwh') || lowerName.includes('kg') || lowerName.includes('percentage')) {
      return <Hash className="h-4 w-4 text-primary" />;
    }
    if (dataType === 'date' || lowerName.includes('date') || lowerName.includes('time')) {
      return <Calendar className="h-4 w-4 text-accent" />;
    }
    return <Type className="h-4 w-4 text-muted-foreground" />;
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground italic">—</span>;
    }
    
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    return String(value);
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading dataset preview...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !dataset) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-8">
          <div className="text-center text-destructive">
            {error || 'Dataset not found'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dataset Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Dataset Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Filename</p>
              <p className="font-medium text-foreground">{dataset.filename}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Rows</p>
              <p className="font-medium text-foreground">{dataset.rows_count?.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Columns</p>
              <p className="font-medium text-foreground">{dataset.columns?.length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">File Size</p>
              <p className="font-medium text-foreground">{dataset.file_size_mb} MB</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Badge variant={dataset.status === 'completed' ? 'default' : 'secondary'}>
              {dataset.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Uploaded {new Date(dataset.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Column Analysis */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Column Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dataset.columns?.map((column, index) => {
              const dataType = dataset.summary_stats?.dataTypes?.[column] || 'text';
              return (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                  {getColumnIcon(column, dataType)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{column}</p>
                    <p className="text-xs text-muted-foreground capitalize">{dataType}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-accent" />
              Data Preview (First 10 rows)
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Sample
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {dataset.columns?.map((column, index) => (
                    <TableHead key={index} className="whitespace-nowrap">
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleData.map((row, index) => (
                  <TableRow key={index}>
                    {dataset.columns?.map((column, colIndex) => (
                      <TableCell key={colIndex} className="whitespace-nowrap">
                        {formatValue(row[column])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {sampleData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No data available for preview
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPreview;