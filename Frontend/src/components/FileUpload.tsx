import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, X, AlertCircle, Database, BarChart3, Zap } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

interface FileUploadProps {
  onFilesUploaded?: (files: File[]) => void;
  onUploadSuccess?: (datasetId: string) => void;
}

const FileUpload = ({ onFilesUploaded, onUploadSuccess }: FileUploadProps) => {
  const { uploadedFiles, uploadFile, removeFile, clearAll } = useFileUpload(onUploadSuccess);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      uploadFile(file);
    });
    onFilesUploaded?.(acceptedFiles);
  }, [uploadFile, onFilesUploaded]);


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'application/json': ['.json']
    },
    maxSize: 20 * 1024 * 1024, // 20MB
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Upload Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Upload Sustainability Data</h2>
          <p className="text-muted-foreground">
            Upload your CSV files for analysis and insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            {...getRootProps()}
            className="cursor-pointer"
          >
            <input {...getInputProps()} />
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>
      </div>

      {/* File format info */}
      <Card className="shadow-card bg-muted/30">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Supported formats:</strong> CSV, Excel (.xlsx, .xls), TXT, JSON files up to 20MB each
          </p>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Uploaded Files ({uploadedFiles.length})
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAll}
                className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
              >
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadedFiles.map((fileData, index) => {
              console.log('Rendering file:', fileData.file.name, 'Status:', fileData.status);
              return (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {fileData.status === "success" && (
                        <CheckCircle className="h-5 w-5 text-success" />
                      )}
                      {fileData.status === "error" && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                      {(fileData.status === "uploading" || fileData.status === "processing") && (
                        <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {fileData.file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileData.file.size)}
                        </p>
                        {(fileData.status === "uploading" || fileData.status === "processing") && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-1.5 max-w-24">
                              <div 
                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${fileData.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{fileData.progress}%</span>
                          </div>
                        )}
                        {fileData.error && (
                          <p className="text-xs text-destructive">{fileData.error}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant={
                      fileData.status === "success" ? "default" :
                      fileData.status === "error" ? "destructive" : "secondary"
                    }>
                      {fileData.status === "success" && "Complete"}
                      {fileData.status === "error" && "Failed"}
                      {fileData.status === "uploading" && "Uploading"}
                      {fileData.status === "processing" && "Processing"}
                    </Badge>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Delete button clicked for:', fileData.file.name);
                        removeFile(fileData.file);
                      }}
                      className="h-8 w-8 p-1 bg-red-500 hover:bg-red-600 text-white rounded border border-red-600 flex items-center justify-center"
                      title="Delete file"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Processing Pipeline Info - Simplified */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Data Processing</h3>
                  <p className="text-xs text-muted-foreground">Validates and stores securely</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Metrics Calculation</h3>
                  <p className="text-xs text-muted-foreground">Generates insights</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Live Dashboard</h3>
                  <p className="text-xs text-muted-foreground">Updates charts instantly</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FileUpload;