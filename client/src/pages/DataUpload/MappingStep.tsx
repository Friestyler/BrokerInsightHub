import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface MappingStepProps {
  uploadedFile: File | null;
  uploadType: string;
  stepName: string;
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
}

export default function MappingStep({ 
  uploadedFile, 
  uploadType, 
  stepName, 
  currentStep,
  onNext, 
  onBack 
}: MappingStepProps) {
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse CSV headers when file is uploaded
  useEffect(() => {
    if (uploadedFile) {
      parseCSVHeaders();
    }
  }, [uploadedFile]);

  const parseCSVHeaders = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const text = await uploadedFile.text();
      const lines = text.split('\n');
      
      if (lines.length === 0) {
        throw new Error('File appears to be empty');
      }

      // Get first line as headers
      const headerLine = lines[0];
      const headers = headerLine.split(',').map(header => header.trim().replace(/"/g, ''));
      
      if (headers.length === 0 || headers.every(h => !h)) {
        throw new Error('No valid column headers found');
      }

      setCsvHeaders(headers.filter(h => h)); // Remove empty headers
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = csvHeaders.length > 0 && !isProcessing && !error;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Step {currentStep}: {stepName}</h3>
          <p className="text-sm text-muted-foreground">
            Review the column headers identified in your CSV file
          </p>
        </div>
      </div>

      {/* File Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Uploaded File
          </CardTitle>
        </CardHeader>
        <CardContent>
          {uploadedFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{uploadedFile.name}</span>
                <Badge variant="secondary">{uploadType}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Size: {(uploadedFile.size / 1024).toFixed(1)} KB
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No file uploaded</div>
          )}
        </CardContent>
      </Card>

      {/* CSV Headers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {isProcessing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : error ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : csvHeaders.length > 0 ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Column Headers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isProcessing ? (
            <div className="text-sm text-muted-foreground">Processing CSV file...</div>
          ) : error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : csvHeaders.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Found {csvHeaders.length} column{csvHeaders.length !== 1 ? 's' : ''}:
              </div>
              <div className="flex flex-wrap gap-2">
                {csvHeaders.map((header, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {header}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Upload a CSV file to see column headers
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!canProceed}
          className="min-w-[100px]"
        >
          {isProcessing ? 'Processing...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}