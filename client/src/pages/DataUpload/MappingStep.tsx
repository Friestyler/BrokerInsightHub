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
  selectedTransformationScript?: { id: number; name: string } | null;
  onNext: (csvHeaders: string[], transformedFile?: File) => void;
  onBack: () => void;
}

export default function MappingStep({ 
  uploadedFile, 
  uploadType, 
  stepName, 
  currentStep,
  selectedTransformationScript,
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
      // Check if this is a special format that needs transformation
      const isSpecialFormat = uploadType && (uploadType.includes('-') || uploadType === 'degoudse');
      
      let finalHeaders: string[] = [];
      
      if (isSpecialFormat && selectedTransformationScript) {
        // Apply transformation script for special formats using selected script ID
        try {
          let fileToTransform = uploadedFile;
          
          // Convert Excel files to CSV first if needed
          if (uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls')) {
            const XLSX = await import('xlsx');
            const arrayBuffer = await uploadedFile.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const csvData = XLSX.utils.sheet_to_csv(worksheet);
            
            // Create a new CSV file from the Excel data
            const csvBlob = new Blob([csvData], { type: 'text/csv' });
            fileToTransform = new File([csvBlob], uploadedFile.name.replace(/\.(xlsx|xls)$/, '.csv'), { type: 'text/csv' });
            console.log('Converted Excel to CSV for transformation');
          }
          
          const formData = new FormData();
          formData.append('file', fileToTransform);
          formData.append('scriptId', selectedTransformationScript.id.toString());

          // Get environment ID from URL or default to degoudse
          const getCurrentEnvironment = () => {
            const path = window.location.pathname;
            const envMatch = path.match(/\/data-upload-2\/process\/([^\/]+)/);
            return envMatch ? envMatch[1] : 'degoudse';
          };

          console.log('Executing transformation script:', selectedTransformationScript.name, 'ID:', selectedTransformationScript.id);

          const response = await fetch(`/api/${getCurrentEnvironment()}/transformation-scripts/execute`, {
            method: 'POST',
            body: formData
          });

          console.log('Transformation response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('Transformation result:', result);
            finalHeaders = result.headers || [];
            console.log('Final headers after transformation:', finalHeaders);
            
            // Create a new File object from the transformed CSV data
            if (result.transformedCsv) {
              const transformedBlob = new Blob([result.transformedCsv], { type: 'text/csv' });
              const transformedFile = new File([transformedBlob], `transformed_${uploadedFile.name}`, { type: 'text/csv' });
              
              setCsvHeaders(finalHeaders);
              setIsProcessing(false);
              onNext(finalHeaders, transformedFile);
              return;
            }
          } else {
            const errorText = await response.text();
            console.error('Transformation failed:', response.status, errorText);
            // If transformation fails, fall back to regular parsing
            const text = await uploadedFile.text();
            const lines = text.split('\n');
            if (lines.length > 0) {
              finalHeaders = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
            }
          }
        } catch (transformError) {
          console.warn('Transformation failed, using original CSV:', transformError);
          // Fall back to regular parsing
          const text = await uploadedFile.text();
          const lines = text.split('\n');
          if (lines.length > 0) {
            finalHeaders = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
          }
        }
      } else {
        // Regular parsing for standard formats
        const text = await uploadedFile.text();
        const lines = text.split('\n');
        
        if (lines.length === 0) {
          throw new Error('File appears to be empty');
        }

        finalHeaders = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
      }
      
      // Only validate headers if transformation script was not used
      // (transformation success callback handles auto-proceed)
      if (!selectedTransformationScript) {
        if (finalHeaders.length === 0 || finalHeaders.every(h => !h)) {
          throw new Error('No valid column headers found');
        }

        const validHeaders = finalHeaders.filter(h => h);
        setCsvHeaders(validHeaders);
        setIsProcessing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
      setIsProcessing(false);
    }
  };

  const canProceed = csvHeaders.length > 0 && !isProcessing && !error;

  // For special formats with transformation scripts, show loading state while processing
  if (selectedTransformationScript && isProcessing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
              <h3 className="text-lg font-semibold mb-2">Processing File</h3>
              <p className="text-sm text-muted-foreground text-center">
                Applying transformation script and extracting headers...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Debug logging to understand current state
  console.log('MappingStep render state:', {
    selectedTransformationScript: !!selectedTransformationScript,
    isProcessing,
    error,
    csvHeaders: csvHeaders.length,
    uploadType
  });

  return (
    <div className="space-y-6">

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
          onClick={() => onNext(csvHeaders)} 
          disabled={!canProceed}
          className="min-w-[100px]"
        >
          {isProcessing ? 'Processing...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}