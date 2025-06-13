import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, Code, Play, Save, FileCode, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface TransformationScript {
  id: number;
  name: string;
  description?: string;
  entityType: string;
  environmentId: string;
  scriptContent: string;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface TransformationStepProps {
  uploadType: string;
  stepName: string;
  currentStep: number;
  onNext: (scriptInfo: { id: number; name: string } | null) => void;
  onBack: () => void;
}

const defaultScript = ``;

const exampleScripts = [
  {
    title: "Skip Rows to Find Headers",
    description: "Handle CSV files where the actual data starts after several empty rows",
    code: `import pandas as pd

def transform_csv(df):
    # Skip rows until you find the actual header (e.g., start from row 5)
    if len(df) > 5:
        df = df.iloc[4:].reset_index(drop=True)
        df.columns = df.iloc[0]  # Use first row as headers
        df = df.drop(df.index[0]).reset_index(drop=True)
    
    return df

transformed_df = transform_csv(df)`
  },
  {
    title: "Clean Empty Rows and Columns",
    description: "Remove completely empty rows and unnamed columns",
    code: `import pandas as pd

def transform_csv(df):
    # Remove completely empty rows
    df = df.dropna(how='all')
    
    # Remove unnamed columns (usually empty columns from Excel)
    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
    
    return df

transformed_df = transform_csv(df)`
  },
  {
    title: "Filter Specific Columns",
    description: "Keep only the columns you need for processing",
    code: `import pandas as pd

def transform_csv(df):
    # Define which columns to keep
    columns_to_keep = ['Customer Name', 'Product', 'Amount', 'Date']
    
    # Filter to only keep specified columns
    df = df[columns_to_keep]
    
    return df

transformed_df = transform_csv(df)`
  },
  {
    title: "Filter Rows by Criteria",
    description: "Remove unwanted rows based on specific conditions",
    code: `import pandas as pd

def transform_csv(df):
    # Remove cancelled or inactive items
    df = df[df['Status'] != 'Cancelled']
    df = df[df['Active'] == 'Yes']
    
    # Remove rows with missing critical data
    df = df[df['Customer Name'].notna()]
    
    return df

transformed_df = transform_csv(df)`
  },
  {
    title: "Clean and Standardize Data",
    description: "Normalize phone numbers, emails, and other data formats",
    code: `import pandas as pd

def transform_csv(df):
    # Clean phone numbers (keep only digits and +)
    if 'Phone' in df.columns:
        df['Phone'] = df['Phone'].str.replace(r'[^\d+]', '', regex=True)
    
    # Normalize emails
    if 'Email' in df.columns:
        df['Email'] = df['Email'].str.lower().str.strip()
    
    # Standardize names
    if 'Name' in df.columns:
        df['Name'] = df['Name'].str.title().str.strip()
    
    return df

transformed_df = transform_csv(df)`
  },
  {
    title: "Handle Complex CSV Structure",
    description: "For files with data starting at a specific cell (e.g., D5)",
    code: `import pandas as pd

def transform_csv(df):
    # Find where actual data starts (look for a specific header)
    start_row = None
    start_col = None
    
    for idx, row in df.iterrows():
        for col_idx, cell in enumerate(row):
            if str(cell).strip() == 'Customer Name':  # Your expected header
                start_row = idx
                start_col = col_idx
                break
        if start_row is not None:
            break
    
    if start_row is not None:
        # Extract data from the found position
        df = df.iloc[start_row:, start_col:].reset_index(drop=True)
        df.columns = df.iloc[0]  # Use first row as headers
        df = df.drop(df.index[0]).reset_index(drop=True)
    
    return df

transformed_df = transform_csv(df)`
  }
];

export default function TransformationStep({ 
  uploadType, 
  stepName, 
  currentStep, 
  onNext, 
  onBack 
}: TransformationStepProps) {
  const [selectedScriptId, setSelectedScriptId] = useState<string>('new');
  const [scriptName, setScriptName] = useState('');
  const [scriptDescription, setScriptDescription] = useState('');
  const [scriptContent, setScriptContent] = useState(defaultScript);
  const [isModified, setIsModified] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors?: string[];
  } | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Determine environment ID - for special formats like 'degoudse', use that as environment
  const environmentId = uploadType.includes('-') || ['salesforce', 'brio', 'degoudse'].includes(uploadType) 
    ? uploadType 
    : 'degoudse'; // Default environment

  // Query transformation scripts
  const { data: scripts = [], isLoading } = useQuery<TransformationScript[]>({
    queryKey: [`/api/${environmentId}/transformation-scripts`],
    enabled: true,
    onSuccess: (data) => {
      console.log('Loaded transformation scripts:', data);
    }
  });

  // Save script mutation
  const saveScriptMutation = useMutation({
    mutationFn: async (scriptData: {
      name: string;
      description?: string;
      entityType: string;
      scriptContent: string;
    }) => {
      const response = await fetch(`/api/${environmentId}/transformation-scripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...scriptData,
          isActive: true,
          createdBy: 1 // TODO: Get from user context
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save script');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Script Saved",
        description: "Your transformation script has been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/${environmentId}/transformation-scripts`] });
      setIsModified(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save script",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update script mutation
  const updateScriptMutation = useMutation({
    mutationFn: async (scriptData: {
      id: number;
      name: string;
      description?: string;
      scriptContent: string;
    }) => {
      const response = await fetch(`/api/${environmentId}/transformation-scripts/${scriptData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scriptData.name,
          description: scriptData.description,
          scriptContent: scriptData.scriptContent
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update script');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Script Updated",
        description: "Your transformation script has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/${environmentId}/transformation-scripts`] });
      setIsModified(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update script",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle script selection
  const handleScriptSelect = (scriptId: string) => {
    setSelectedScriptId(scriptId);
    
    if (scriptId === 'new') {
      setScriptName('');
      setScriptDescription('');
      setScriptContent(defaultScript);
      setIsModified(false);
    } else {
      const script = scripts.find(s => s.id.toString() === scriptId);
      console.log('Selected script:', script);
      if (script) {
        setScriptName(script.name);
        setScriptDescription(script.description || '');
        setScriptContent(script.scriptContent || '');
        setIsModified(false);
      }
    }
    setValidationResult(null);
  };

  // Handle script content change
  const handleScriptChange = (value: string) => {
    setScriptContent(value);
    setIsModified(true);
    setValidationResult(null);
  };

  // Validate script syntax
  const validateScript = () => {
    // Basic Python syntax validation
    const errors: string[] = [];
    
    // Check for basic Python syntax issues
    const lines = scriptContent.split('\n');
    let indentLevel = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (trimmed === '') continue;
      
      // Check for basic syntax issues
      if (trimmed.includes('def ') && !trimmed.endsWith(':')) {
        errors.push(`Line ${i + 1}: Function definition should end with ':'`);
      }
      
      if (trimmed.includes('if ') && !trimmed.endsWith(':') && !trimmed.includes('if ') === false) {
        errors.push(`Line ${i + 1}: If statement should end with ':'`);
      }
    }
    
    // Check if required function exists
    if (!scriptContent.includes('def transform_csv(df)')) {
      errors.push('Script must contain a transform_csv(df) function');
    }
    
    // Check if df is returned
    if (!scriptContent.includes('return df') && !scriptContent.includes('transformed_df')) {
      errors.push('Script should return the transformed DataFrame');
    }
    
    const isValid = errors.length === 0;
    setValidationResult({ isValid, errors: isValid ? undefined : errors });
    
    return isValid;
  };

  // Save current script
  const handleSaveScript = () => {
    if (!scriptName.trim()) {
      toast({
        title: "Script name required",
        description: "Please enter a name for your script.",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateScript()) {
      toast({
        title: "Script validation failed",
        description: "Please fix the script errors before saving.",
        variant: "destructive"
      });
      return;
    }
    
    saveScriptMutation.mutate({
      name: scriptName.trim(),
      description: scriptDescription.trim() || undefined,
      entityType: uploadType,
      scriptContent: scriptContent
    });
  };

  // Save as new script
  const handleSaveAsNew = () => {
    if (!scriptName.trim()) {
      toast({
        title: "Script name required",
        description: "Please enter a name for your script.",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateScript()) {
      toast({
        title: "Script validation failed",
        description: "Please fix the script errors before saving.",
        variant: "destructive"
      });
      return;
    }
    
    saveScriptMutation.mutate({
      name: scriptName.trim(),
      description: scriptDescription.trim() || undefined,
      entityType: uploadType,
      scriptContent: scriptContent
    });
  };

  // Update existing script
  const handleUpdateScript = () => {
    const script = scripts.find(s => s.id.toString() === selectedScriptId);
    if (!script) return;
    
    if (!validateScript()) {
      toast({
        title: "Script validation failed",
        description: "Please fix the script errors before updating.",
        variant: "destructive"
      });
      return;
    }
    
    updateScriptMutation.mutate({
      id: script.id,
      name: scriptName.trim(),
      description: scriptDescription.trim() || undefined,
      scriptContent: scriptContent
    });
  };

  // Copy example code to editor
  const copyExampleToEditor = (exampleCode: string) => {
    setScriptContent(exampleCode);
    setIsModified(true);
    setValidationResult(null);
    toast({
      title: "Example copied",
      description: "The example code has been copied to the editor."
    });
  };

  // Proceed to next step
  const handleNext = () => {
    if (isModified) {
      toast({
        title: "Unsaved changes",
        description: "Please save your script before proceeding to the next step.",
        variant: "destructive"
      });
      return;
    }
    
    // Pass selected script information to the next step
    if (selectedScriptId !== 'new') {
      const selectedScript = scripts.find(s => s.id.toString() === selectedScriptId);
      if (selectedScript) {
        onNext({ id: selectedScript.id, name: selectedScript.name });
        return;
      }
    }
    
    // No script selected or new script without content
    onNext(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transformation scripts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">CSV Transformation</h3>
        </div>
        <p className="text-sm text-gray-600">
          Apply Python transformations to your CSV data before column mapping. 
          This is useful for cleaning data, removing unwanted rows/columns, or handling complex CSV structures.
        </p>
      </div>

      {/* Script Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Transformation Script</CardTitle>
          <CardDescription>
            Choose an existing script or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="script-select">Transformation Script</Label>
              <Select value={selectedScriptId} onValueChange={handleScriptSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a script" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Create New Script</SelectItem>
                  {scripts.map(script => (
                    <SelectItem key={script.id} value={script.id.toString()}>
                      {script.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedScriptId !== 'new' && (
              <div className="text-sm text-gray-600">
                {scripts.find(s => s.id.toString() === selectedScriptId)?.description}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Script Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Python Script Editor</CardTitle>
              <CardDescription>
                Write Python code to transform your CSV data
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={validateScript}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Validate
              </Button>
              {isModified && (
                <Badge variant="secondary" className="text-xs">
                  Modified
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Script Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="script-name">Script Name</Label>
              <Input
                id="script-name"
                value={scriptName}
                onChange={(e) => {
                  setScriptName(e.target.value);
                  if (selectedScriptId !== 'new') setIsModified(true);
                }}
                placeholder="Enter script name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="script-description">Description (optional)</Label>
              <Input
                id="script-description"
                value={scriptDescription}
                onChange={(e) => {
                  setScriptDescription(e.target.value);
                  if (selectedScriptId !== 'new') setIsModified(true);
                }}
                placeholder="Brief description of the transformation"
              />
            </div>
          </div>

          <Separator />

          {/* Code Editor */}
          <div className="space-y-2">
            <Label htmlFor="script-content">Python Code</Label>
            <Textarea
              id="script-content"
              value={scriptContent}
              onChange={(e) => handleScriptChange(e.target.value)}
              className="font-mono text-sm min-h-[400px] resize-y"
              placeholder="Enter your Python transformation code here..."
            />
          </div>

          {/* Validation Results */}
          {validationResult && (
            <Alert className={validationResult.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {validationResult.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {validationResult.isValid ? (
                  "Script validation passed successfully."
                ) : (
                  <div>
                    <div className="font-medium mb-2">Script validation failed:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.errors?.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Code Examples Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Code Examples</CardTitle>
              <CardDescription>
                Ready-to-use Python code snippets for common CSV transformations
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExamples(!showExamples)}
              className="gap-2"
            >
              {showExamples ? (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Hide Examples
                </>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4" />
                  Show Examples
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showExamples && (
          <CardContent className="space-y-4">
            {exampleScripts.map((example, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{example.title}</h4>
                    <p className="text-sm text-gray-600">{example.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyExampleToEditor(example.code)}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Use This Example
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                  <pre className="text-sm overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex gap-2">
          {selectedScriptId === 'new' && (
            <Button
              onClick={handleSaveScript}
              disabled={saveScriptMutation.isPending || !scriptName.trim()}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Script
            </Button>
          )}
          
          {selectedScriptId !== 'new' && isModified && (
            <>
              <Button
                variant="outline"
                onClick={handleSaveAsNew}
                disabled={saveScriptMutation.isPending || !scriptName.trim()}
                className="gap-2"
              >
                <FileCode className="h-4 w-4" />
                Save As New
              </Button>
              <Button
                onClick={handleUpdateScript}
                disabled={updateScriptMutation.isPending}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Update Script
              </Button>
            </>
          )}
          
          <Button onClick={handleNext} className="gap-2">
            Next: Upload
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}