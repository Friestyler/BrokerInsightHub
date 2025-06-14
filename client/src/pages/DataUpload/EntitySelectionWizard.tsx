import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Users, 
  User, 
  Package, 
  Building2, 
  Phone,
  Check,
  ArrowLeft,
  ChevronRight
} from "lucide-react";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface EntityType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}

const entityTypes: EntityType[] = [
  {
    id: 'opportunities',
    title: 'Opportunities',
    description: 'Sales opportunities and deals',
    icon: <Target className="h-8 w-8" />,
    color: 'bg-gray-100',
    hoverColor: 'hover:bg-green-50 hover:border-green-200'
  },
  {
    id: 'partners',
    title: 'Partners',
    description: 'Business partners and relationships',
    icon: <Users className="h-8 w-8" />,
    color: 'bg-gray-100',
    hoverColor: 'hover:bg-green-50 hover:border-green-200'
  },
  {
    id: 'customers',
    title: 'Customers',
    description: 'Customer information and contacts',
    icon: <User className="h-8 w-8" />,
    color: 'bg-gray-100',
    hoverColor: 'hover:bg-blue-50 hover:border-blue-200'
  },
  {
    id: 'products',
    title: 'Products',
    description: 'Product catalog and inventory',
    icon: <Package className="h-8 w-8" />,
    color: 'bg-gray-100',
    hoverColor: 'hover:bg-purple-50 hover:border-purple-200'
  },
  {
    id: 'vendors',
    title: 'Vendors',
    description: 'Vendor and supplier information',
    icon: <Building2 className="h-8 w-8" />,
    color: 'bg-gray-100',
    hoverColor: 'hover:bg-orange-50 hover:border-orange-200'
  },
  {
    id: 'contacts',
    title: 'Contacts',
    description: 'Contact details and communication',
    icon: <Phone className="h-8 w-8" />,
    color: 'bg-gray-100',
    hoverColor: 'hover:bg-yellow-50 hover:border-yellow-200'
  }
];

const getSelectedStyles = (entityId: string) => {
  switch (entityId) {
    case 'opportunities':
      return 'bg-green-50 border-green-500 ring-2 ring-green-200';
    case 'partners':
      return 'bg-green-50 border-green-500 ring-2 ring-green-200';
    case 'customers':
      return 'bg-blue-50 border-blue-500 ring-2 ring-blue-200';
    case 'products':
      return 'bg-purple-50 border-purple-500 ring-2 ring-purple-200';
    case 'vendors':
      return 'bg-orange-50 border-orange-500 ring-2 ring-orange-200';
    case 'contacts':
      return 'bg-yellow-50 border-yellow-500 ring-2 ring-yellow-200';
    default:
      return 'bg-gray-50 border-gray-500 ring-2 ring-gray-200';
  }
};

const getSelectedIconColor = (entityId: string) => {
  switch (entityId) {
    case 'opportunities':
    case 'partners':
      return 'text-green-600';
    case 'customers':
      return 'text-blue-600';
    case 'products':
      return 'text-purple-600';
    case 'vendors':
      return 'text-orange-600';
    case 'contacts':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};

export default function EntitySelectionWizard() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const totalSteps = 5;

  const handleEntitySelect = (entityId: string) => {
    setSelectedEntity(entityId);
  };

  const handleContinue = () => {
    if (selectedEntity) {
      setCurrentStep(2);
      // Navigate to next step
      setLocation(`/data-upload/wizard?entity=${selectedEntity}&step=2`);
    }
  };

  const handleBack = () => {
    setLocation('/data-upload');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Partner Pilot</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/data-upload">Data Upload</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Upload Wizard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Data Upload Wizard</h1>
            <p className="text-gray-600">Step {currentStep} of {totalSteps}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-blue-600">0% Complete</div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-blue-600">Entity Selection</div>
              <div className="text-xs text-gray-500">Choose the type of data you want to upload</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-400">Upload</div>
              <div className="text-xs text-gray-400">Upload your CSV file</div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-400">Mapping</div>
              <div className="text-xs text-gray-400">Map CSV columns to entity attributes</div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-medium">
              4
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-400">Processing</div>
              <div className="text-xs text-gray-400">Review and validate your data before processing</div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center text-sm font-medium">
              5
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-400">Complete</div>
              <div className="text-xs text-gray-400">Review results</div>
            </div>
          </div>
        </div>
        
        <Progress value={20} className="w-full" />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-xl">Step 1: Entity Selection</CardTitle>
            <CardDescription>Choose the type of data you want to upload</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="text-center mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Choose Entity Type</h2>
              <p className="text-gray-600">Select the type of data you want to upload</p>
            </div>

            {/* Entity Selection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              {entityTypes.map((entity) => {
                const isSelected = selectedEntity === entity.id;
                
                return (
                  <button
                    key={entity.id}
                    onClick={() => handleEntitySelect(entity.id)}
                    className={`
                      relative p-6 border-2 rounded-lg transition-all duration-200 cursor-pointer
                      ${isSelected 
                        ? getSelectedStyles(entity.id)
                        : `border-gray-200 ${entity.hoverColor} hover:shadow-sm`
                      }
                    `}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`
                      w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center
                      ${isSelected ? entity.color : 'bg-gray-100'}
                    `}>
                      <div className={isSelected ? getSelectedIconColor(entity.id) : 'text-gray-400'}>
                        {entity.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h3 className={`
                        text-lg font-medium mb-2
                        ${isSelected ? 'text-gray-900' : 'text-gray-700'}
                      `}>
                        {entity.title}
                      </h3>
                      <p className={`
                        text-sm
                        ${isSelected ? 'text-gray-600' : 'text-gray-500'}
                      `}>
                        {entity.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Continue Button */}
            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <Button 
                onClick={handleContinue}
                disabled={!selectedEntity}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continue to Upload
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}