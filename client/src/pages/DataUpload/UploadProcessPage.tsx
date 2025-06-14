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
import TransformationStep from './TransformationStep';

interface UploadProcessProps {
  entityType?: string;
  formatType?: string;
}

const capitalizeUploadType = (type: string) => {
  if (!type) return '';
  
  // Handle special cases with spaces
  const specialCases: { [key: string]: string } = {
    'degoudse': 'De Goudse',
    'de-goudse': 'De Goudse',
    'salesforce': 'Salesforce',
    'brio': 'Brio',
    'axa-verzekeringen': 'AXA Verzekeringen',
    'ing-bank': 'ING Bank'
  };
  
  const lowerType = type.toLowerCase();
  if (specialCases[lowerType]) {
    return specialCases[lowerType];
  }
  
  // Handle hyphenated names - convert to spaces and capitalize each word
  if (type.includes('-')) {
    return type.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Handle underscore names - convert to spaces and capitalize each word
  if (type.includes('_')) {
    return type.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Default capitalization
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const getSteps = (uploadType: string) => {
  // For entity-upload flow, skip transformation and go directly from entity selection to upload
  if (uploadType === 'entity-upload') {
    return [
      { id: 1, name: 'Entity Selection', description: 'Choose the type of data you want to upload' },
      { id: 2, name: 'Upload', description: 'Upload your CSV file' },
      { id: 3, name: 'Mapping', description: 'Map CSV columns to entity attributes' },
      { id: 4, name: 'Processing', description: 'Review and validate your data before processing' },
      { id: 5, name: 'Complete', description: 'Review results' }
    ];
  }
  
  // For special formats with transformation
  return [
    { id: 1, name: 'Transformation', description: 'Configure data transformation' },
    { id: 2, name: 'Upload', description: 'Upload your CSV file' },
    { id: 3, name: 'Mapping', description: `Map CSV columns to ${uploadType ? capitalizeUploadType(uploadType) : 'entity'} attributes` },
    { id: 4, name: 'Processing', description: 'Review and validate your data before processing' },
    { id: 5, name: 'Complete', description: 'Review results' }
  ];
};

export default function UploadProcessPage() {
  const [location, setLocation] = useLocation();
  const [match2, params2] = useRoute('/data-upload-2/process/:type');
  const [match3, params3] = useRoute('/data-upload-3/process/:type');
  
  // Use params from whichever route matched
  const params = params2 || params3;
  const uploadType = params?.type || '';
  
  // Determine if this is a special format (contains hyphen) or entity
  const isEntityUpload = uploadType === 'entity-upload';
  const isSpecialFormat = !isEntityUpload && (uploadType.includes('-') || ['salesforce', 'brio', 'degoudse'].includes(uploadType));
  const entityType = isSpecialFormat ? undefined : uploadType;
  const formatType = isSpecialFormat ? uploadType : undefined;
  
  // Get dynamic steps based on upload type
  const steps = getSteps(uploadType);
  
  const [currentStep, setCurrentStep] = useState(1); // Always start at step 1
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [attributeMappings, setAttributeMappings] = useState<Array<{
    attribute: string;
    csvColumn: string;
    isRequired: boolean;
  }>>([]);
  const [selectedTransformationScript, setSelectedTransformationScript] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [processingResults, setProcessingResults] = useState<{
    recordsCreated: number;
    recordsSkipped: number;
    recordsProcessed: number;
    errors: any[];
  } | null>(null);

  // For entity-upload, show all steps. For special formats, show all steps. For regular entities, skip transformation.
  const visibleSteps = isEntityUpload || isSpecialFormat ? steps : steps.slice(1);
  const totalSteps = visibleSteps.length;
  
  const currentStepData = (isEntityUpload || isSpecialFormat) ? steps[currentStep - 1] : visibleSteps[currentStep - 1];
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  // Calculate display step number to match progress indicator
  // For special formats: use currentStep directly (1,2,3,4,5)
  // For regular entities: currentStep maps to visible step position (1=Upload, 2=Mapping, 3=Processing, 4=Complete)
  const displayStepNumber = currentStep;

  const handleFileUpload = (file: File) => {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      setUploadedFile(file);
      
      // Extract CSV headers
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          const lines = text.split('\n');
          if (lines.length > 0) {
            const headers = lines[0].split(',').map(header => 
              header.trim().replace(/"/g, '')
            ).filter(header => header.length > 0);
            setCsvHeaders(headers);
          }
        }
      };
      reader.readAsText(file);
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
    // Detect which upload section we came from based on current path
    const currentPath = window.location.pathname;
    const isFromDataUpload3 = currentPath.includes('/data-upload-3/');
    
    // Navigate back to the main page and trigger the appropriate section
    setLocation('/');
    // Use a small delay to ensure page loads before triggering section change
    setTimeout(() => {
      const targetSection = isFromDataUpload3 ? 'data-upload-3' : 'data-upload-2';
      window.dispatchEvent(new CustomEvent('navigate-to-section', { detail: targetSection }));
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
              {formatType ? `${capitalizeUploadType(formatType)} Format Upload` : `${capitalizeUploadType(entityType || '')} Upload`}
            </h1>
            <p className="text-gray-600">
              {formatType 
                ? `Upload and transform ${capitalizeUploadType(formatType)} format data`
                : `Upload ${capitalizeUploadType(entityType || '')} data with attribute mapping`
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
      <Card className="mb-6 shadow-sm border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-3">
              <span>Step {currentStep} of {isSpecialFormat ? 5 : 4}</span>
              <span className="text-blue-600 font-semibold">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-gray-100" />
          </div>
          
          <div className="flex justify-between">
            {visibleSteps.map((step, index) => {
              const stepNumber = isSpecialFormat ? step.id : index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              
              // Generate metadata for completed steps
              const getStepMetadata = () => {
                if (!isCompleted) return step.description;
                
                switch (step.id) {
                  case 1:
                    if (isEntityUpload && selectedEntityType) {
                      const entityLabels: Record<string, string> = {
                        'opportunities': 'Opportunities',
                        'partners': 'Partners', 
                        'customers': 'Customers',
                        'products': 'Products',
                        'vendors': 'Vendors',
                        'contacts': 'Contacts'
                      };
                      return entityLabels[selectedEntityType as keyof typeof entityLabels] || selectedEntityType;
                    }
                    if (selectedTransformationScript) {
                      return selectedTransformationScript.name;
                    }
                    return step.description;
                  case 2:
                    if (uploadedFile) {
                      const sizeInMB = (uploadedFile.size / 1024 / 1024).toFixed(1);
                      return `${uploadedFile.name.split('.')[0]} (${sizeInMB}MB)`;
                    }
                    return step.description;
                  case 3:
                    if (csvHeaders.length > 0 && attributeMappings.length > 0) {
                      return `${csvHeaders.length} columns, ${attributeMappings.length} mapped`;
                    }
                    return step.description;
                  case 4:
                    if (processingResults) {
                      return `${processingResults.recordsCreated} records created`;
                    }
                    return step.description;
                  default:
                    return step.description;
                }
              };
              
              return (
                <div key={step.id} className="flex flex-col items-center text-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-3 transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                      : isActive 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 scale-110' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                  </div>
                  <div className="min-h-[3rem] flex flex-col justify-center">
                    <div className={`text-sm font-medium transition-colors ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </div>
                    <div className={`text-xs mt-1 max-w-28 transition-colors ${
                      isCompleted ? 'text-green-600 font-medium' : 'text-gray-500'
                    }`}>
                      {getStepMetadata()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="shadow-sm border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold text-gray-900">Step {displayStepNumber}: {currentStepData?.name}</CardTitle>
          <CardDescription className="text-gray-600 text-base">{currentStepData?.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Entity Selection Step (Entity Upload Only) */}
          {currentStep === 1 && isEntityUpload && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium mb-2">Choose Entity Type</h3>
                <p className="text-gray-600">Select the type of data you want to upload</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {[
                  { value: 'opportunities', label: 'Opportunities', icon: '🎯', color: 'blue', description: 'Sales opportunities and deals' },
                  { value: 'partners', label: 'Partners', icon: '🤝', color: 'green', description: 'Business partners and relationships' },
                  { value: 'customers', label: 'Customers', icon: '👥', color: 'purple', description: 'Customer information and contacts' },
                  { value: 'products', label: 'Products', icon: '📦', color: 'orange', description: 'Product catalog and inventory' },
                  { value: 'vendors', label: 'Vendors', icon: '🏭', color: 'red', description: 'Vendor and supplier information' },
                  { value: 'contacts', label: 'Contacts', icon: '📞', color: 'gray', description: 'Contact details and communication' }
                ].map((entity) => (
                  <div
                    key={entity.value}
                    onClick={() => setSelectedEntityType(entity.value)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedEntityType === entity.value
                        ? `border-${entity.color}-500 bg-${entity.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{entity.icon}</div>
                      <h4 className="font-medium mb-1">{entity.label}</h4>
                      <p className="text-sm text-gray-600">{entity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousStep} disabled={currentStep <= 1}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={goToNextStep}
                  disabled={!selectedEntityType}
                >
                  Continue to Upload
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Transformation Step (Special Formats Only) */}
          {currentStep === 1 && isSpecialFormat && (
            <TransformationStep 
              uploadType={uploadType}
              stepName={currentStepData?.name || 'Transformation'}
              currentStep={currentStep}
              onNext={(scriptInfo) => {
                setSelectedTransformationScript(scriptInfo || null);
                goToNextStep();
              }}
              onBack={goToPreviousStep}
            />
          )}

          {/* Upload Step */}
          {((currentStep === 2 && (isSpecialFormat || isEntityUpload)) || (currentStep === 1 && !isSpecialFormat && !isEntityUpload)) && (
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
          {((currentStep === 3 && (isSpecialFormat || isEntityUpload)) || (currentStep === 2 && !isSpecialFormat && !isEntityUpload)) && (
            <AttributeMappingStep 
              uploadedFile={uploadedFile}
              csvHeaders={csvHeaders}
              uploadType={isEntityUpload ? selectedEntityType : uploadType || ''}
              stepName={currentStepData?.name || 'Attribute Mapping'}
              currentStep={currentStep}
              selectedTransformationScript={selectedTransformationScript}
              selectedEntityType={selectedEntityType}
              onNext={(mappings) => {
                setAttributeMappings(mappings);
                goToNextStep();
              }}
              onBack={goToPreviousStep}
            />
          )}

          {/* Processing Step */}
          {((currentStep === 4 && (isSpecialFormat || isEntityUpload)) || (currentStep === 3 && !isSpecialFormat && !isEntityUpload)) && (
            <ProcessingStep 
              uploadedFile={uploadedFile}
              attributeMappings={attributeMappings}
              uploadType={isEntityUpload ? selectedEntityType : uploadType || ''}
              stepName={currentStepData?.name || 'Processing'}
              currentStep={currentStep}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              onProcessingComplete={(results) => {
                setProcessingResults({
                  recordsCreated: results.recordsCreated,
                  recordsSkipped: results.recordsSkipped,
                  recordsProcessed: results.recordsProcessed,
                  errors: results.errors
                });
              }}
            />
          )}

          {/* Results Step */}
          {((currentStep === 5 && (isSpecialFormat || isEntityUpload)) || (currentStep === 4 && !isSpecialFormat && !isEntityUpload)) && (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Processing Complete!</h3>
              
              {processingResults && (
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    {processingResults.recordsCreated} {isEntityUpload ? selectedEntityType : uploadType} records have been successfully processed.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto mb-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{processingResults.recordsCreated}</div>
                      <div className="text-sm text-gray-600">Created</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">{processingResults.recordsSkipped}</div>
                      <div className="text-sm text-gray-600">Skipped</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{processingResults.recordsProcessed}</div>
                      <div className="text-sm text-gray-600">Total Processed</div>
                    </div>
                  </div>
                </div>
              )}
              
              {!processingResults && (
                <p className="text-gray-600 mb-6">Your {isEntityUpload ? selectedEntityType : uploadType} data has been successfully processed and imported.</p>
              )}
              
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Process Another File
                </Button>
                <Button onClick={goBack}>
                  Back to Upload Options
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}