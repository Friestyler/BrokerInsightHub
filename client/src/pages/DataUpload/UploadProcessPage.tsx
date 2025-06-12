import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import MappingStep from './MappingStep';
import AttributeMappingStep from './AttributeMappingStep';
import ProcessingStep from './ProcessingStep';

interface UploadProcessProps {
  entityType?: string;
  formatType?: string;
}

const steps = [
  { id: 1, name: 'Transformation', description: 'Configure data transformation' },
  { id: 2, name: 'Upload', description: 'Upload your CSV file' },
  { id: 3, name: 'Mapping', description: 'Map columns to attributes' },
  { id: 4, name: 'Processing', description: 'Process and validate data' },
  { id: 5, name: 'Complete', description: 'Review results' }
];

export default function UploadProcessPage() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute('/data-upload-2/process/:type');
  
  const uploadType = params?.type;
  
  // Determine if this is a special format (contains hyphen) or entity
  const isSpecialFormat = uploadType?.includes('-') || ['salesforce', 'brio', 'degoudse'].includes(uploadType || '');
  const entityType = isSpecialFormat ? undefined : uploadType;
  const formatType = isSpecialFormat ? uploadType : undefined;
  
  const [currentStep, setCurrentStep] = useState(1); // Always start at step 1
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [attributeMappings, setAttributeMappings] = useState<Array<{
    attribute: string;
    csvColumn: string;
    isRequired: boolean;
  }>>([]);

  const visibleSteps = isSpecialFormat ? steps : steps.slice(1); // Skip transformation for regular entities
  const totalSteps = visibleSteps.length;
  
  const currentStepData = isSpecialFormat ? steps[currentStep - 1] : steps[currentStep]; // Adjust for hidden transformation step
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const handleFileUpload = (file: File) => {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      setUploadedFile(file);
    } else {
      alert('Please upload a CSV file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goBack = () => {
    // Navigate back to the main page and trigger the data-upload-2 section
    setLocation('/');
    // Use a small delay to ensure page loads before triggering section change
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigate-to-section', { detail: 'data-upload-2' }));
    }, 100);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="outline" size="sm" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Upload Options
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {formatType ? `${formatType} Format Upload` : `${entityType} Upload`}
            </h1>
            <p className="text-gray-600">
              {formatType 
                ? `Upload and transform ${formatType} format data`
                : `Upload ${entityType} data with field mapping`
              }
            </p>
          </div>
          
          {isSpecialFormat && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Special Format
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Step {currentStep} of {isSpecialFormat ? 5 : 4}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="flex justify-between">
            {visibleSteps.map((step, index) => {
              const stepNumber = isSpecialFormat ? step.id : index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center text-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 max-w-24">
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStepData?.name}</CardTitle>
          <CardDescription>{currentStepData?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Transformation Step (Special Formats Only) */}
          {currentStep === 1 && isSpecialFormat && (
            <div className="space-y-6">
              <Alert>
                <AlertDescription>
                  Transformation scripts will be implemented in the next phase. 
                  For now, proceed directly to file upload.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end">
                <Button onClick={goToNextStep}>
                  Skip to Upload
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Upload Step */}
          {((currentStep === 2 && isSpecialFormat) || (currentStep === 1 && !isSpecialFormat)) && (
            <div className="space-y-6">
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : uploadedFile 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {uploadedFile ? (
                  <div className="space-y-4">
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-green-600" />
                    <div>
                      <h3 className="text-lg font-medium text-green-800">{uploadedFile.name}</h3>
                      <p className="text-sm text-green-600">
                        File size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setUploadedFile(null)}
                      className="text-green-700 border-green-300 hover:bg-green-100"
                    >
                      Choose Different File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium">Upload your CSV file</h3>
                      <p className="text-gray-600">Drag and drop your file here, or click to browse</p>
                    </div>
                    <Button 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.csv';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleFileUpload(file);
                        };
                        input.click();
                      }}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>

              {uploadedFile && (
                <div className="flex justify-between">
                  <Button variant="outline" onClick={goToPreviousStep} disabled={currentStep <= 1}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button onClick={goToNextStep}>
                    Continue to Mapping
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Attribute Mapping Step */}
          {((currentStep === 3 && isSpecialFormat) || (currentStep === 2 && !isSpecialFormat)) && (
            <AttributeMappingStep 
              uploadedFile={uploadedFile}
              csvHeaders={[]} // Will be extracted from file in the component
              uploadType={uploadType || ''}
              stepName={currentStepData?.name || 'Attribute Mapping'}
              currentStep={currentStep}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
            />
          )}

          {/* Additional steps */}
          {currentStep > (isSpecialFormat ? 3 : 2) && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Step {currentStep}: {currentStepData?.name}</h3>
              <p className="text-gray-600 mb-6">This step will be implemented in the next phase.</p>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                {currentStep < totalSteps && (
                  <Button onClick={goToNextStep}>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}