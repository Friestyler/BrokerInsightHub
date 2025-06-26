import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, ArrowLeft, ArrowRight, CheckCircle, Target, Handshake, Users, Package, Building2, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import MappingStep from './MappingStep';
import AttributeMappingStep from './AttributeMappingStep';
import ProcessingStep from './ProcessingStep';
import TransformationStep from './TransformationStep';
import ProductMappingStep from './ProductMappingStep';
import ProductAssignmentStep from './ProductAssignmentStep';
import CategoryManagerForProducts from '@/components/CategoryManagerForProducts';

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

const getSteps = (uploadType: string, selectedEntityTypes: string[] = []) => {
  // For entity-upload flow, create dynamic steps based on selected entities
  if (uploadType === 'entity-upload') {
    const steps = [
      { id: 1, name: 'Entity Selection', description: 'Choose the types of data you want to upload' },
      { id: 2, name: 'Upload', description: 'Upload your CSV file' }
    ];
    
    let stepId = 3;
    
    // Add Product Mapping step if products are selected
    if (selectedEntityTypes.includes('products')) {
      steps.push({ id: stepId++, name: 'Product Mapping', description: 'Map products to categories' });
    }
    
    // Add mapping steps for each selected entity type (excluding products which has its own special step)
    selectedEntityTypes.filter(entityType => entityType !== 'products').forEach(entityType => {
      const entityLabels: Record<string, string> = {
        'opportunities': 'Opportunity',
        'partners': 'Partner', 
        'customers': 'Customer',
        'vendors': 'Vendor',
        'contacts': 'Contact'
      };
      const entityLabel = entityLabels[entityType] || capitalizeUploadType(entityType);
      steps.push({ id: stepId++, name: `${entityLabel} Mapping`, description: `Map CSV columns to ${entityLabel.toLowerCase()} attributes` });
    });
    
    // Add final steps
    steps.push({ id: stepId++, name: 'Processing', description: 'Review and validate your data before processing' });
    steps.push({ id: stepId, name: 'Complete', description: 'Review results' });
    
    return steps;
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
  
  const [currentStep, setCurrentStep] = useState(1); // Always start at step 1
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>(''); // Add CSV data state
  const [transformedFile, setTransformedFile] = useState<File | null>(null); // Store transformed CSV for special formats
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>([]);
  const [selectedEntityType, setSelectedEntityType] = useState<string>(''); // Keep for backward compatibility
  const [entityMappings, setEntityMappings] = useState<{ [entityType: string]: any[] }>({});
  const [productStructureSelected, setProductStructureSelected] = useState(false);
  const [productStructureType, setProductStructureType] = useState<'single-column' | 'multiple-columns' | ''>('');
  const [selectedProductColumn, setSelectedProductColumn] = useState<string>('');
  const [selectedProductColumns, setSelectedProductColumns] = useState<string[]>([]);
  
  // Get dynamic steps based on upload type and selected entities
  const steps = getSteps(uploadType, selectedEntityTypes);
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
  const [processingResults, setProcessingResults] = useState<{
    recordsCreated: number;
    recordsSkipped: number;
    recordsProcessed: number;
    errors: any[];
  } | null>(null);
  const [productCategories, setProductCategories] = useState<Array<{
    id: string;
    name: string;
    color: string;
    subcategories: Array<{
      id: string;
      name: string;
      categoryId: string;
    }>;
  }>>([]);
  const [productMappings, setProductMappings] = useState<Record<string, {
    targetId: string;
    targetType: 'category' | 'subcategory';
    productAction?: 'existing' | 'new';
    existingProductId?: string;
  }>>({});

  // For entity-upload, show all steps. For special formats, show all steps. For regular entities, skip transformation.
  const visibleSteps = isEntityUpload || isSpecialFormat ? steps : steps.slice(1);
  const totalSteps = visibleSteps.length;
  
  // Helper function to get entity type for current mapping step
  const getCurrentMappingEntityType = () => {
    if (!isEntityUpload || currentStep <= 2) return null;
    
    let stepCounter = 3;
    
    // Skip product mapping step if products are selected
    if (selectedEntityTypes.includes('products')) {
      if (currentStep === stepCounter) return null; // This is the product mapping step
      stepCounter++;
    }
    
    // Find which entity mapping step we're on (excluding products which has its own special step)
    for (const entityType of selectedEntityTypes.filter(type => type !== 'products')) {
      if (currentStep === stepCounter) {
        return entityType;
      }
      stepCounter++;
    }
    
    return null;
  };
  
  // Helper function to check if current step is product mapping
  const isCurrentStepProductMapping = () => {
    return isEntityUpload && selectedEntityTypes.includes('products') && currentStep === 3;
  };
  
  // Helper function to check if current step is entity mapping
  const isCurrentStepEntityMapping = () => {
    return getCurrentMappingEntityType() !== null;
  };
  
  // Helper function to check if current step is processing
  const isCurrentStepProcessing = () => {
    if (!isEntityUpload) return false;
    
    let stepCounter = 3;
    
    // Skip product mapping step if products are selected
    if (selectedEntityTypes.includes('products')) {
      stepCounter++;
    }
    
    // Skip entity mapping steps (excluding products which has its own special step)
    stepCounter += selectedEntityTypes.filter(entityType => entityType !== 'products').length;
    
    return currentStep === stepCounter;
  };
  
  // Helper function to check if current step is complete
  const isCurrentStepComplete = () => {
    if (!isEntityUpload) return false;
    
    let stepCounter = 3;
    
    // Skip product mapping step if products are selected
    if (selectedEntityTypes.includes('products')) {
      stepCounter++;
    }
    
    // Skip entity mapping steps (excluding products which has its own special step)
    stepCounter += selectedEntityTypes.filter(entityType => entityType !== 'products').length;
    
    // Skip processing step
    stepCounter++;
    
    return currentStep === stepCounter;
  };
  
  const currentStepData = (isEntityUpload || isSpecialFormat) ? steps[currentStep - 1] : visibleSteps[currentStep - 1];
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  // Calculate display step number to match progress indicator
  // For special formats: use currentStep directly (1,2,3,4,5)
  // For regular entities: currentStep maps to visible step position (1=Upload, 2=Mapping, 3=Processing, 4=Complete)
  const displayStepNumber = currentStep;

  const handleFileUpload = (file: File) => {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      setUploadedFile(file);
      
      // Extract CSV headers and store CSV data
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          setCsvData(text); // Store the full CSV content
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
    // Navigate back to the main page and trigger the Data Upload 3 section
    setLocation('/');
    // Use a small delay to ensure page loads before triggering section change
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigate-to-section', { detail: 'data-upload-3' }));
    }, 100);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
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
              {formatType ? `${capitalizeUploadType(formatType)} Format Upload` : isEntityUpload ? 'Upload Entity Data' : `${capitalizeUploadType(entityType || '')} Upload`}
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
              <span>Step {currentStep} of {isEntityUpload ? 6 : isSpecialFormat ? 5 : 4}</span>
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
                    if (isEntityUpload && selectedEntityTypes.length > 0) {
                      const entityLabels: Record<string, string> = {
                        'opportunities': 'Opportunities',
                        'partners': 'Partners', 
                        'customers': 'Customers',
                        'products': 'Products',
                        'vendors': 'Vendors',
                        'contacts': 'Contacts'
                      };
                      if (selectedEntityTypes.length === 1) {
                        return entityLabels[selectedEntityTypes[0] as keyof typeof entityLabels] || selectedEntityTypes[0];
                      }
                      return `${selectedEntityTypes.length} entities selected`;
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
                    <div className={`text-sm font-semibold transition-all duration-300 ${
                      isActive 
                        ? 'text-blue-700 transform scale-105' 
                        : isCompleted 
                          ? 'text-green-700 font-bold' 
                          : 'text-gray-600'
                    }`}>
                      {step.name}
                    </div>
                    <div className={`text-xs mt-1.5 max-w-32 transition-all duration-300 leading-relaxed ${
                      isActive
                        ? 'text-blue-600 font-medium opacity-100 transform translate-y-0'
                        : isCompleted 
                          ? 'text-green-600 font-semibold opacity-100 transform translate-y-0' 
                          : 'text-gray-500 opacity-75'
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

          {/* Entity Selection Step (Entity Upload Only) - Step 1 */}
          {currentStep === 1 && isEntityUpload && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium mb-2 text-foreground">Choose Entity Types</h3>
                <p className="text-muted-foreground">Select the types of data you want to upload (you can select multiple)</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[
                  { value: 'opportunities', label: 'Opportunities', icon: Target, color: 'blue', description: 'Sales opportunities and deals' },
                  { value: 'partners', label: 'Partners', icon: Handshake, color: 'green', description: 'Business partners and relationships' },
                  { value: 'customers', label: 'Customers', icon: Users, color: 'purple', description: 'Customer information and contacts' },
                  { value: 'products', label: 'Products', icon: Package, color: 'orange', description: 'Product catalog and inventory' },
                  { value: 'vendors', label: 'Vendors', icon: Building2, color: 'red', description: 'Vendor and supplier information' },
                  { value: 'contacts', label: 'Contacts', icon: Phone, color: 'gray', description: 'Contact details and communication' }
                ].map((entity) => {
                  const IconComponent = entity.icon;
                  const isSelected = selectedEntityTypes.includes(entity.value);
                  
                  return (
                    <div
                      key={entity.value}
                      onClick={() => {
                        if (isSelected) {
                          // Remove from selection
                          setSelectedEntityTypes(prev => prev.filter(type => type !== entity.value));
                          // Update backward compatibility
                          if (selectedEntityType === entity.value) {
                            setSelectedEntityType(selectedEntityTypes.filter(type => type !== entity.value)[0] || '');
                          }
                        } else {
                          // Add to selection
                          setSelectedEntityTypes(prev => [...prev, entity.value]);
                          // Update backward compatibility - set first selected as primary
                          if (!selectedEntityType) {
                            setSelectedEntityType(entity.value);
                          }
                        }
                      }}
                      className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                        isSelected
                          ? `bg-gradient-to-br from-${entity.color}-50 to-${entity.color}-100 border-2 border-${entity.color}-200 shadow-md`
                          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="text-center space-y-3">
                        <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected 
                            ? `bg-${entity.color}-500 text-white` 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}>
                          <IconComponent className="h-6 w-6" strokeWidth={2} />
                        </div>
                        <div>
                          <h4 className={`font-semibold text-sm transition-colors ${
                            isSelected ? `text-${entity.color}-900` : 'text-foreground'
                          }`}>
                            {entity.label}
                          </h4>
                          <p className={`text-xs mt-1 transition-colors ${
                            isSelected ? `text-${entity.color}-700` : 'text-muted-foreground'
                          }`}>
                            {entity.description}
                          </p>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className={`absolute -top-1 -right-1 w-6 h-6 bg-${entity.color}-500 rounded-full flex items-center justify-center`}>
                          <CheckCircle className="h-4 w-4 text-white" strokeWidth={2} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={goToPreviousStep} 
                  disabled={currentStep <= 1}
                  className="rounded-xl px-6 py-3 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={goToNextStep}
                  disabled={selectedEntityTypes.length === 0}
                  className="rounded-xl px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
          {((currentStep === 2 && isSpecialFormat) || (currentStep === 2 && isEntityUpload) || (currentStep === 1 && !isSpecialFormat && !isEntityUpload)) && (
            <div className="space-y-8">
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragOver 
                    ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 scale-105' 
                    : uploadedFile 
                      ? 'border-green-400 bg-gradient-to-br from-green-50 to-green-100 shadow-lg' 
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {uploadedFile ? (
                  <div className="space-y-6">
                    <div className="mx-auto w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileSpreadsheet className="h-8 w-8 text-white" strokeWidth={2} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-green-800">{uploadedFile.name}</h3>
                      <p className="text-green-600 font-medium">
                        {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB • Ready to process
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setUploadedFile(null)}
                      className="text-green-700 border-green-300 hover:bg-green-100 rounded-xl px-6"
                    >
                      Choose Different File
                    </Button>
                    
                    <div className="absolute top-4 right-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" strokeWidth={2} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">Upload your CSV file</h3>
                      <p className="text-muted-foreground">Drag and drop your file here, or click to browse</p>
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
                      className="rounded-xl px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>

              {uploadedFile && (
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={goToPreviousStep} 
                    disabled={currentStep <= 1}
                    className="rounded-xl px-6 py-3 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    onClick={goToNextStep}
                    className="rounded-xl px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  >
                    Continue to Mapping
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Product Mapping Step (Entity Upload Only) - Only when products are selected */}
          {isCurrentStepProductMapping() && (
            <div className="space-y-8">
              {/* Column Mapping Section for Products - First section */}
              <div>
                <Card className="border border-[#E6E7F1] shadow-sm">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Product Column Mapping</h3>
                        <p className="text-muted-foreground text-sm">Map CSV columns to product attributes</p>
                      </div>
                      
                      <AttributeMappingStep 
                        uploadedFile={uploadedFile}
                        csvHeaders={csvHeaders}
                        uploadType="products"
                        stepName="Product Column Mapping"
                        currentStep={currentStep}
                        selectedTransformationScript={selectedTransformationScript}
                        selectedEntityType="products"
                        productStructureType={productStructureType}
                        selectedProductColumn={selectedProductColumn}
                        selectedProductColumns={selectedProductColumns}
                        onNext={(mappings) => {
                          setEntityMappings(prev => ({ ...prev, products: mappings }));
                          // Don't auto-advance, let the parent component handle navigation
                        }}
                        onBack={() => {}}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Product Assignment Section */}
              <div className="space-y-6 border-t pt-8">
                <ProductAssignmentStep
                  csvData={csvData}
                  onProductMappingsChange={setProductMappings}
                  productMappings={productMappings}
                  onContinue={goToNextStep}
                />
              </div>
              
              {/* Category Management Section - Below Product Assignment */}
              <div className="border-t pt-8" data-section="product-categories">
                <Card className="border border-[#E6E7F1] shadow-sm">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Product Categories</h3>
                        <p className="text-muted-foreground text-sm">Create and organize categories for your products</p>
                      </div>
                      
                      <CategoryManagerForProducts />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-between pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={goToPreviousStep} 
                  disabled={currentStep <= 1}
                  className="rounded-xl px-6 py-3 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={goToNextStep}
                  className="rounded-xl px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  Continue to Next Entity
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Entity Mapping Steps - For each selected entity */}
          {isCurrentStepEntityMapping() && (
            <div className="space-y-6">
              {(() => {
                const entityType = getCurrentMappingEntityType();
                if (!entityType) return null;
                
                const entityLabels: Record<string, string> = {
                  'opportunities': 'Opportunity',
                  'partners': 'Partner', 
                  'customers': 'Customer',
                  'products': 'Product',
                  'vendors': 'Vendor',
                  'contacts': 'Contact'
                };
                
                const entityLabel = entityLabels[entityType] || capitalizeUploadType(entityType);
                
                return (
                  <AttributeMappingStep 
                    uploadedFile={uploadedFile}
                    csvHeaders={csvHeaders}
                    uploadType={entityType}
                    stepName={`${entityLabel} Mapping`}
                    currentStep={currentStep}
                    selectedTransformationScript={selectedTransformationScript}
                    selectedEntityType={entityType}
                    onNext={(mappings) => {
                      setEntityMappings(prev => ({ ...prev, [entityType]: mappings }));
                      goToNextStep();
                    }}
                    onBack={goToPreviousStep}
                  />
                );
              })()}
            </div>
          )}

          {/* Mapping Step (Special Formats Only) - Apply transformation and extract headers */}
          {currentStep === 3 && isSpecialFormat && (
            <MappingStep 
              uploadedFile={uploadedFile}
              uploadType={uploadType || ''}
              stepName={currentStepData?.name || 'Mapping'}
              currentStep={currentStep}
              selectedTransformationScript={selectedTransformationScript}
              onNext={(headers, transformedFile) => {
                setCsvHeaders(headers);
                if (transformedFile) {
                  setTransformedFile(transformedFile);
                }
                goToNextStep();
              }}
              onBack={goToPreviousStep}
            />
          )}

          {/* Attribute Mapping Step - Only for non-entity uploads and special formats */}
          {((currentStep === 3 && isSpecialFormat) || (currentStep === 2 && !isSpecialFormat && !isEntityUpload)) && (
            <AttributeMappingStep 
              uploadedFile={isSpecialFormat && transformedFile ? transformedFile : uploadedFile}
              csvHeaders={csvHeaders}
              uploadType={uploadType || ''}
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
          {((currentStep === 4 && isSpecialFormat) || (isCurrentStepProcessing()) || (currentStep === 3 && !isSpecialFormat && !isEntityUpload)) && (
            <ProcessingStep 
              uploadedFile={isSpecialFormat && transformedFile ? transformedFile : uploadedFile}
              attributeMappings={isEntityUpload ? Object.values(entityMappings).flat() : attributeMappings}
              uploadType={isEntityUpload ? selectedEntityTypes.join(',') : uploadType || ''}
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
          {((currentStep === 5 && isSpecialFormat) || (isCurrentStepComplete()) || (currentStep === 4 && !isSpecialFormat && !isEntityUpload)) && (
            <div className="text-center py-16">
              <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg mb-6">
                <CheckCircle className="h-10 w-10 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Processing Complete!</h3>
              
              {processingResults && (
                <div className="mb-8">
                  <p className="text-muted-foreground mb-8 text-lg">
                    {processingResults.recordsCreated} {isEntityUpload ? (selectedEntityTypes.length > 1 ? 'entity' : selectedEntityTypes[0]) : uploadType} records have been successfully processed.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-lg mx-auto mb-6">
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                      <div className="text-3xl font-bold text-green-600 mb-1">{processingResults.recordsCreated}</div>
                      <div className="text-sm font-medium text-green-700">Created</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                      <div className="text-3xl font-bold text-gray-600 mb-1">{processingResults.recordsSkipped}</div>
                      <div className="text-sm font-medium text-gray-700">Skipped</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600 mb-1">{processingResults.recordsProcessed}</div>
                      <div className="text-sm font-medium text-blue-700">Total Processed</div>
                    </div>
                  </div>
                </div>
              )}
              
              {!processingResults && (
                <p className="text-muted-foreground mb-8 text-lg">Your {isEntityUpload ? (selectedEntityTypes.length > 1 ? 'entity' : selectedEntityTypes[0]) : uploadType} data has been successfully processed and imported.</p>
              )}
              
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                  className="rounded-xl px-6 py-3 border-gray-300 hover:bg-gray-50"
                >
                  Process Another File
                </Button>
                <Button 
                  onClick={goBack}
                  className="rounded-xl px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
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