import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Edit, ArrowLeft, ArrowRight, CheckCircle, X, Trash2, Minus, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface AttributeMappingStepProps {
  uploadedFile: File | null;
  csvHeaders: string[];
  uploadType: string;
  stepName: string;
  currentStep: number;
  selectedTransformationScript?: { id: number; name: string } | null;
  onNext: (mappings: AttributeMapping[]) => void;
  onBack: () => void;
}

interface AttributeMapping {
  attribute: string;
  csvColumn: string;
  isRequired: boolean;
  customCode?: string;
  isCodeBased?: boolean;
}

interface Template {
  id: number;
  name: string;
  description: string;
  entity_type: string;
  column_mappings: string | AttributeMapping[];
  is_shared: boolean;
  created_by: number;
  environment_id: string;
}

export default function AttributeMappingStep({ 
  uploadedFile, 
  csvHeaders,
  uploadType, 
  stepName, 
  currentStep,
  selectedTransformationScript,
  onNext, 
  onBack 
}: AttributeMappingStepProps) {
  const [attributeMappings, setAttributeMappings] = useState<AttributeMapping[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [templateName, setTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const [selectedNewAttribute, setSelectedNewAttribute] = useState<string>('');
  const [extractedHeaders, setExtractedHeaders] = useState<string[]>([]);
  const [showCodeEditor, setShowCodeEditor] = useState<{ [key: number]: boolean }>({});
  const [codeEditorContent, setCodeEditorContent] = useState<{ [key: number]: string }>({});
  const [codeValidation, setCodeValidation] = useState<{ [key: number]: { isValid: boolean; error?: string } }>({});
  const [codePreview, setCodePreview] = useState<{ [key: number]: string[] }>({});
  const [csvData, setCsvData] = useState<any[]>([]);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<{ [key: number]: string }>({});
  const [isGeneratingCode, setIsGeneratingCode] = useState<{ [key: number]: boolean }>({});
  const [codeExplanation, setCodeExplanation] = useState<{ [key: number]: string }>({});
  const [showAiInterface, setShowAiInterface] = useState<{ [key: number]: boolean }>({});
  const [templateLoaded, setTemplateLoaded] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Environment and entity detection
  const environmentId = 'degoudse'; // Default environment
  const isEntityUpload = uploadType === 'entity-upload';

  return (
    <div className="space-y-6">
      {/* Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Template functionality will be restored after fixing syntax issues.</p>
          </div>
        </CardContent>
      </Card>

      {/* Main Mapping Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Column Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Column Headers */}
          <div className="grid grid-cols-2 gap-8 mb-3">
            <h4 className="font-medium text-sm text-muted-foreground">Entity Attributes</h4>
            <h4 className="font-medium text-sm text-muted-foreground">CSV Column Mapping</h4>
          </div>
          
          {/* Mapping Rows */}
          <div className="space-y-3">
            {attributeMappings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No attributes configured for this upload type.</p>
                <p className="text-sm mt-1">You can add optional attributes using the button below.</p>
              </div>
            )}
            
            {attributeMappings.map((mapping, index) => (
              <div key={`mapping-row-${index}`} className="space-y-4">
                <div className="grid grid-cols-2 gap-8 items-stretch">
                  {/* Left: Entity Attribute */}
                  <div className={`p-3 rounded-lg border flex items-center justify-between ${
                    mapping.isRequired 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{mapping.attribute}</span>
                      {mapping.isRequired && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {!mapping.isRequired && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Right: CSV Column Dropdown */}
                  <div className={`p-3 rounded-lg border ${
                    mapping.isRequired 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Select 
                          value={mapping.csvColumn} 
                          onValueChange={(value) => {
                            // Update mapping logic will be restored
                            console.log('Updating mapping:', value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select CSV column" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[270px] p-0">
                            <div className="p-1">
                              <SelectItem value="CODE" className="bg-purple-50 text-purple-700 font-medium">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    <span className="text-purple-500">&lt;/&gt;</span>
                                    Code (Custom Logic)
                                  </div>
                                  {mapping.customCode && mapping.customCode.trim() && (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <CheckCircle className="h-3 w-3" />
                                      <span className="text-xs">Applied</span>
                                    </div>
                                  )}
                                </div>
                              </SelectItem>
                              {csvHeaders.filter(header => header && header.trim().length > 0).map(header => (
                                <SelectItem key={header} value={header}>{header}</SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Edit Code Button - shows when CODE is selected and has custom code */}
                      {mapping.csvColumn === 'CODE' && mapping.customCode && mapping.customCode.trim() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCodeEditor(prev => ({ ...prev, [index]: true }))}
                          className="shrink-0 gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit Code
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Code Editor Section - appears when "Code" is selected */}
                {showCodeEditor[index] && mapping.csvColumn === 'CODE' && (
                  <div className="mt-4 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Clean Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <span className="text-purple-600 text-lg font-bold">&lt;/&gt;</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Custom Logic</h3>
                            <p className="text-sm text-gray-600">Transform data with AI or code</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {codeValidation[index]?.isValid && (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                              <CheckCircle className="h-4 w-4" />
                              <span className="font-medium">Applied</span>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCodeEditor(prev => ({ ...prev, [index]: false }))}
                            className="rounded-full h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* AI Assistant */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Sparkles className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">AI Assistant</h4>
                              <p className="text-sm text-gray-600">Describe what you want</p>
                            </div>
                          </div>
                          <Button
                            variant={showAiInterface[index] ? "default" : "outline"}
                            onClick={() => setShowAiInterface(prev => ({ ...prev, [index]: !prev[index] }))}
                            className="rounded-full"
                          >
                            {showAiInterface[index] ? 'Close' : 'Use AI'}
                          </Button>
                        </div>

                        {showAiInterface[index] && (
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-4">
                            <textarea
                              value={aiPrompt[index] || ''}
                              onChange={(e) => setAiPrompt(prev => ({ ...prev, [index]: e.target.value }))}
                              placeholder="Example: Combine first and last name with an underscore"
                              className="w-full h-20 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            />
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                Try: "Combine columns", "Add prefix", "Make uppercase"
                              </div>
                              <Button
                                onClick={() => {
                                  // AI generation logic will be restored
                                  console.log('Generating AI code for:', aiPrompt[index]);
                                }}
                                disabled={isGeneratingCode[index] || !aiPrompt[index]?.trim()}
                                className="rounded-full bg-blue-600 hover:bg-blue-700"
                              >
                                {isGeneratingCode[index] ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generate
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Success feedback */}
                            {codeExplanation[index] && (
                              <div className="bg-white rounded-lg border border-green-200 p-4">
                                <div className="flex items-start gap-3">
                                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-green-800">Generated successfully!</p>
                                    <p className="text-sm text-green-700 mt-1">{codeExplanation[index]}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Code Editor */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Edit className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Code Editor</h4>
                              <p className="text-sm text-gray-600">Edit transformation code</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCodeEditorContent(prev => ({ ...prev, [index]: '' }));
                              setAttributeMappings(prev => prev.map((mapping, i) => 
                                i === index ? { ...mapping, customCode: '' } : mapping
                              ));
                            }}
                            className="rounded-full"
                          >
                            Clear
                          </Button>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-1">
                          <textarea
                            value={codeEditorContent[index] || ''}
                            onChange={(e) => {
                              setCodeEditorContent(prev => ({ ...prev, [index]: e.target.value }));
                              setAttributeMappings(prev => prev.map((mapping, i) => 
                                i === index && mapping.isCodeBased ? { ...mapping, customCode: e.target.value } : mapping
                              ));
                            }}
                            className="w-full h-32 p-4 bg-white border-0 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Write transformation code here...
Example: column_first_name + ' ' + column_last_name"
                          />
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 text-sm font-bold">◎</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Preview</h4>
                            <p className="text-sm text-gray-600">Sample results from your data</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-4 min-h-24">
                          {codePreview[index] && codePreview[index].length > 0 ? (
                            <div className="space-y-2">
                              {codePreview[index].map((preview, previewIndex) => {
                                const isError = preview.includes('Error') || preview.includes('Function-based') || preview.includes('Add simple');
                                return (
                                  <div key={previewIndex} className={`flex items-center gap-3 p-3 rounded-lg ${
                                    isError ? 'bg-yellow-50' : 'bg-white border border-gray-200'
                                  }`}>
                                    {isError ? (
                                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                                    ) : (
                                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 text-xs font-bold">{previewIndex + 1}</span>
                                      </div>
                                    )}
                                    <span className="text-sm font-medium">{preview}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-16 text-gray-400">
                              <div className="text-center">
                                <div className="text-sm">Preview will appear here</div>
                                <div className="text-xs mt-1">Write code or use AI to see results</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Attribute Section */}
          <div className="mt-6 grid grid-cols-2 gap-8">
            <div>
              {!showAddAttribute ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddAttribute(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Optional Attribute
                </Button>
              ) : (
                <div className="space-y-3">
                  <Select 
                    value={selectedNewAttribute} 
                    onValueChange={setSelectedNewAttribute}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select attribute to add" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="description">Description</SelectItem>
                      <SelectItem value="value">Value</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        if (selectedNewAttribute) {
                          setAttributeMappings(prev => [...prev, {
                            attribute: selectedNewAttribute,
                            csvColumn: '',
                            isRequired: false,
                          }]);
                          setSelectedNewAttribute('');
                          setShowAddAttribute(false);
                        }
                      }}
                      disabled={!selectedNewAttribute}
                      size="sm"
                    >
                      Add
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddAttribute(false);
                        setSelectedNewAttribute('');
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {/* Empty space on the right to maintain alignment */}
            <div></div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={() => onNext(attributeMappings)} 
          disabled={attributeMappings.length === 0}
        >
          Continue to Processing
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}