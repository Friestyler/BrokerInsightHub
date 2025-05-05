import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ToolHeader from "@/components/ToolHeader";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string | number;
  name: string;
  date: string;
  type: string;
}

interface EmailForm {
  recipient: string;
  subject: string;
  content: string;
}

interface FileUploadResponse {
  success: boolean;
  message: string;
  file: UploadedFile;
}

interface EmailResponse {
  success: boolean;
  message: string;
  details?: {
    recipient: string;
    subject: string;
  };
}

interface ComparisonResult {
  id: number;
  date: string;
  document1: {
    id: number;
    name: string;
  };
  document2: {
    id: number;
    name: string;
  };
  document3?: {
    id: number;
    name: string;
  };
  document4?: {
    id: number;
    name: string;
  };
  comparisonMode?: 'policy' | 'template';
  differencesSummary: string;
  differences: {
    addedClauses: number;
    removedClauses: number;
    modifiedClauses: number;
    details: Array<{
      type: string;
      section: string;
      description: string;
    }>;
  };
}

export default function CompareFiles() {
  // Default files that are always shown
  const defaultFiles: UploadedFile[] = [
    { id: '1', name: 'AXA_Policy_2025.pdf', date: 'yesterday', type: 'pdf' },
    { id: '2', name: 'AG_Insurance_Quote.pdf', date: '2 days ago', type: 'pdf' }
  ];
  
  const [files, setFiles] = useState<UploadedFile[]>(defaultFiles);
  const [emailType, setEmailType] = useState<'comparison' | 'recommendations'>('comparison');
  const [selectedFile1, setSelectedFile1] = useState<string | number>(defaultFiles[0].id);
  const [selectedFile2, setSelectedFile2] = useState<string | number>(defaultFiles[1].id);
  const [selectedFile3, setSelectedFile3] = useState<string | number>('');
  const [selectedFile4, setSelectedFile4] = useState<string | number>('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<'policy' | 'template'>('policy');
  const [useMultiComparison, setUseMultiComparison] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch documents from the API
  const { data: documents, isLoading: isLoadingDocuments, refetch: refetchDocuments } = useQuery<UploadedFile[]>({
    queryKey: ['/api/documents'],
    enabled: true,
  });
  
  // File upload mutation
  const uploadFileMutation = useMutation<FileUploadResponse, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      // Use fetch directly to properly handle multipart/form-data
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "File uploaded successfully",
          description: `${data.file.name} has been uploaded.`,
        });
        
        // Add the new file to our list
        setFiles(prev => [...prev, data.file]);
        
        // Refresh documents list
        refetchDocuments();
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    onError: () => {
      toast({
        title: "File upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  interface ComparisonResponse {
    success: boolean;
    message: string;
    comparison: ComparisonResult;
  }
  
  // Compare files mutation
  const compareFilesMutation = useMutation<ComparisonResponse, Error, void>({
    mutationFn: async () => {
      let payload: any = {
        document1Id: selectedFile1,
        document2Id: selectedFile2,
        comparisonMode
      };
      
      // Add additional files for multi-policy comparison if they're selected
      if (useMultiComparison && selectedFile3) {
        payload.document3Id = selectedFile3;
      }
      
      if (useMultiComparison && selectedFile4) {
        payload.document4Id = selectedFile4;
      }
      
      return apiRequest('POST', '/api/files/compare', payload);
    },
    onSuccess: (data) => {
      if (data.success) {
        setComparisonResult(data.comparison);
        
        // Update email content with comparison results
        setValue('content', generateEmailContent(data.comparison, emailType));
        
        toast({
          title: "Files compared successfully",
          description: "The comparison results are ready.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Comparison failed",
        description: "There was an error comparing the files. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsComparing(false);
    }
  });
  
  // Email sending mutation
  const sendEmailMutation = useMutation<EmailResponse, Error, EmailForm>({
    mutationFn: async (data: EmailForm) => {
      return apiRequest('POST', '/api/email/send', {
        ...data,
        comparisonId: comparisonResult?.id,
        comparisonMode: comparisonResult?.comparisonMode || comparisonMode  // Pass the comparison mode to the server
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Email sent successfully",
        description: `Your email to ${data.details?.recipient} has been sent.`,
      });
    },
    onError: () => {
      toast({
        title: "Email sending failed",
        description: "There was an error sending your email. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const { register, handleSubmit, setValue, watch } = useForm<EmailForm>({
    defaultValues: {
      recipient: '',
      subject: 'Your Insurance Policy Comparison',
      content: `Dear [Client Name],

I've analyzed the policies from AXA and AG Insurance that we discussed. Here's a comparison of the key coverage areas and premiums:

The AXA policy offers better coverage for [Key Area 1] while the AG Insurance policy provides additional benefits for [Key Area 2].

Would you like to discuss these options further? I'm available for a call this week.

Best regards,
[Your Name]`
    }
  });
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('file', files[0]);
      uploadFileMutation.mutate(formData);
    }
  };
  
  const handleCompareClick = () => {
    setIsComparing(true);
    compareFilesMutation.mutate();
  };
  
  const generateEmailContent = (comparison: ComparisonResult, type: 'comparison' | 'recommendations'): string => {
    if (comparisonMode === 'template') {
      // Generate template checking email
      const missingItems = comparison.differences.details.filter(detail => detail.type === 'removed').length;
      
      return `Dear [Client Name],

I've reviewed the document you submitted (${comparison.document2.name}) against our template (${comparison.document1.name}).

${comparison.differencesSummary}

${missingItems > 0 ? `There are ${missingItems} missing or incomplete fields in your document that need to be addressed:
${comparison.differences.details
  .filter(detail => detail.type === 'removed')
  .map(detail => `- ${detail.description}`)
  .join('\n')}

Please complete these missing sections and resubmit the document at your earliest convenience.` : 'All required fields have been completed. Thank you for providing a thorough document.'}

If you have any questions about completing this document, please don't hesitate to contact me.

Best regards,
[Your Name]`;
    } else if (type === 'comparison') {
      // Standard policy comparison email
      return `Dear [Client Name],

Please find attached a comparison of the insurance policies we discussed (${comparison.document1.name} and ${comparison.document2.name}${comparison.document3?.name ? ', ' + comparison.document3.name : ''}${comparison.document4?.name ? ', ' + comparison.document4.name : ''}).

${comparison.differencesSummary}

Key differences:
${comparison.differences.details.map(detail => `- ${detail.section}: ${detail.description}`).join('\n')}

I would recommend reviewing these differences carefully before making a decision.

Let me know if you have any questions.

Best regards,
[Your Name]`;
    } else {
      // Recommendations email
      return `Dear [Client Name],

Based on our comparison of ${comparison.document1.name} and ${comparison.document2.name}${comparison.document3?.name ? ' and ' + comparison.document3.name : ''}${comparison.document4?.name ? ' and ' + comparison.document4.name : ''}, I would like to offer the following recommendations:

1. Policy Recommendation: I recommend selecting the policy with better coverage that aligns with your specific needs.

2. Coverage Analysis: 
${comparison.differences.details.map(detail => `- ${detail.section}: ${detail.description}`).join('\n')}

3. Cost-Benefit Assessment: The policy with higher premiums offers more comprehensive coverage, which may be worth considering given your particular risk profile.

Would you like to schedule a call to discuss these recommendations in more detail?

Best regards,
[Your Name]`;
    }
  };
  
  const onSubmit = (data: EmailForm) => {
    sendEmailMutation.mutate(data);
  };

  const headerActions = (
    <Button size="sm">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
      How it works
    </Button>
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white rounded-xl p-6 border border-neutral-200">
          <ToolHeader 
            title="Compare Files & Create Email" 
            actions={headerActions}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-neutral-200 rounded-lg p-5">
              <h3 className="font-medium mb-4 text-neutral-800">Upload Insurance Documents</h3>
              
              {/* Comparison mode selection */}
              <div className="mb-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <h4 className="font-medium mb-3 text-sm text-neutral-700">Comparison Mode</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={comparisonMode === 'policy' ? 'secondary' : 'outline'}
                    className={comparisonMode === 'policy' ? 'bg-primary-100 text-primary-700 border-primary-200 hover:bg-primary-200' : ''}
                    onClick={() => setComparisonMode('policy')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                      <path d="M10 9H8" />
                    </svg>
                    Policy Comparison
                  </Button>
                  <Button
                    type="button"
                    variant={comparisonMode === 'template' ? 'secondary' : 'outline'}
                    className={comparisonMode === 'template' ? 'bg-primary-100 text-primary-700 border-primary-200 hover:bg-primary-200' : ''}
                    onClick={() => setComparisonMode('template')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                      <line x1="9" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="15" x2="21" y2="15" />
                    </svg>
                    Template Checker
                  </Button>
                </div>
                
                {comparisonMode === 'policy' && (
                  <div className="mt-4">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="multi-comparison"
                        checked={useMultiComparison}
                        onChange={(e) => setUseMultiComparison(e.target.checked)}
                        className="mr-2"
                      />
                      <Label htmlFor="multi-comparison" className="text-xs font-medium text-neutral-700">
                        Compare multiple policies (up to 4)
                      </Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <Label className="block text-xs font-medium text-neutral-700 mb-1">Policy 1</Label>
                        <select
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                          value={String(selectedFile1)}
                          onChange={(e) => setSelectedFile1(e.target.value)}
                        >
                          {files.map(file => (
                            <option key={`file1-${file.id}`} value={String(file.id)}>
                              {file.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="block text-xs font-medium text-neutral-700 mb-1">Policy 2</Label>
                        <select
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                          value={String(selectedFile2)}
                          onChange={(e) => setSelectedFile2(e.target.value)}
                        >
                          {files.map(file => (
                            <option key={`file2-${file.id}`} value={String(file.id)}>
                              {file.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {useMultiComparison && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label className="block text-xs font-medium text-neutral-700 mb-1">Policy 3 (Optional)</Label>
                          <select
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                            value={String(selectedFile3)}
                            onChange={(e) => setSelectedFile3(e.target.value)}
                          >
                            <option value="">-- Select a file --</option>
                            {files.map(file => (
                              <option key={`file3-${file.id}`} value={String(file.id)}>
                                {file.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="block text-xs font-medium text-neutral-700 mb-1">Policy 4 (Optional)</Label>
                          <select
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                            value={String(selectedFile4)}
                            onChange={(e) => setSelectedFile4(e.target.value)}
                          >
                            <option value="">-- Select a file --</option>
                            {files.map(file => (
                              <option key={`file4-${file.id}`} value={String(file.id)}>
                                {file.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleCompareClick} 
                      disabled={isComparing || selectedFile1 === selectedFile2 || (selectedFile1 === selectedFile3 && selectedFile3 !== '') || (selectedFile1 === selectedFile4 && selectedFile4 !== '') || (selectedFile2 === selectedFile3 && selectedFile3 !== '') || (selectedFile2 === selectedFile4 && selectedFile4 !== '') || (selectedFile3 === selectedFile4 && selectedFile3 !== '' && selectedFile4 !== '')}
                      className="w-full mt-2"
                    >
                      {isComparing ? 'Comparing Policies...' : 'Compare Policies'}
                    </Button>
                    
                    {(selectedFile1 === selectedFile2 || (selectedFile1 === selectedFile3 && selectedFile3 !== '') || (selectedFile1 === selectedFile4 && selectedFile4 !== '') || (selectedFile2 === selectedFile3 && selectedFile3 !== '') || (selectedFile2 === selectedFile4 && selectedFile4 !== '') || (selectedFile3 === selectedFile4 && selectedFile3 !== '' && selectedFile4 !== '')) && (
                      <p className="text-xs text-red-500 mt-2">Please select different files for each policy</p>
                    )}
                  </div>
                )}
                
                {comparisonMode === 'template' && (
                  <div className="mt-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <Label className="block text-xs font-medium text-neutral-700 mb-1">Template Document</Label>
                        <select
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                          value={String(selectedFile1)}
                          onChange={(e) => setSelectedFile1(e.target.value)}
                        >
                          {files.map(file => (
                            <option key={`template-${file.id}`} value={String(file.id)}>
                              {file.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-neutral-500 mt-1">The original template with fields to be filled</p>
                      </div>
                      <div>
                        <Label className="block text-xs font-medium text-neutral-700 mb-1">Client Document</Label>
                        <select
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                          value={String(selectedFile2)}
                          onChange={(e) => setSelectedFile2(e.target.value)}
                        >
                          {files.map(file => (
                            <option key={`client-${file.id}`} value={String(file.id)}>
                              {file.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-neutral-500 mt-1">The document received from the client</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleCompareClick} 
                      disabled={isComparing || selectedFile1 === selectedFile2}
                      className="w-full mt-2"
                    >
                      {isComparing ? 'Checking Template...' : 'Check Template Completion'}
                    </Button>
                    
                    {selectedFile1 === selectedFile2 && (
                      <p className="text-xs text-red-500 mt-2">Template and client document must be different</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center bg-neutral-50">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="text-neutral-600 mb-4">Drag and drop files here or click to browse</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={handleFileInputChange}
                />
                <Button onClick={() => fileInputRef.current?.click()} disabled={uploadFileMutation.isPending}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  {uploadFileMutation.isPending ? 'Uploading...' : 'Select Files'}
                </Button>
                <p className="text-xs text-neutral-500 mt-4">Supported formats: PDF, DOCX, XLSX (Max 10MB)</p>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3 text-sm text-neutral-700">Recently Uploaded</h4>
                <div className="space-y-3">
                  {files.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-md border border-neutral-200">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mr-3">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <path d="M9 15h6" />
                          <path d="M9 11h6" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-neutral-800">{file.name}</p>
                          <p className="text-xs text-neutral-500">Uploaded {file.date}</p>
                        </div>
                      </div>
                      <button className="text-neutral-400 hover:text-neutral-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            <Card className="border border-neutral-200 rounded-lg p-5">
              <h3 className="font-medium mb-4 text-neutral-800">
                {(comparisonResult?.comparisonMode === 'template' || (!comparisonResult && comparisonMode === 'template')) 
                  ? 'Generate Template Feedback Email' 
                  : 'Generate Policy Comparison Email'}
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Only show email type options for policy comparisons */}
                {(comparisonResult?.comparisonMode === 'policy' || (!comparisonResult && comparisonMode === 'policy')) && (
                  <div>
                    <Label className="block text-sm font-medium text-neutral-700 mb-1">Email Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        type="button"
                        variant={emailType === 'comparison' ? 'secondary' : 'outline'} 
                        className={emailType === 'comparison' ? 'bg-primary-100 text-primary-700 border-primary-200 hover:bg-primary-200' : ''}
                        onClick={() => setEmailType('comparison')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <path d="M16 13H8" />
                          <path d="M16 17H8" />
                          <path d="M10 9H8" />
                        </svg>
                        Policy Comparison
                      </Button>
                      <Button 
                        type="button"
                        variant={emailType === 'recommendations' ? 'secondary' : 'outline'}
                        className={emailType === 'recommendations' ? 'bg-primary-100 text-primary-700 border-primary-200 hover:bg-primary-200' : ''}
                        onClick={() => setEmailType('recommendations')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        Recommendations
                      </Button>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="recipient" className="block text-sm font-medium text-neutral-700 mb-1">Recipient</Label>
                  <Input 
                    id="recipient" 
                    placeholder="Enter client email" 
                    {...register('recipient')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-1">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="Enter email subject" 
                    {...register('subject')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="content" className="block text-sm font-medium text-neutral-700 mb-1">Email Content</Label>
                  <Textarea 
                    id="content"
                    className="min-h-[150px] border border-neutral-300 rounded-md p-3 bg-neutral-50 text-neutral-600 text-sm"
                    {...register('content')}
                  />
                </div>
                
                {/* Comparison Results Section */}
                {comparisonResult && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium mb-2 text-sm text-blue-800">Comparison Results</h4>
                    <p className="text-sm text-blue-700 mb-2">{comparisonResult.differencesSummary}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full">+{comparisonResult.differences.addedClauses} Additions</span>
                      <span className="text-xs bg-red-100 text-red-800 py-1 px-2 rounded-full">-{comparisonResult.differences.removedClauses} Removals</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 py-1 px-2 rounded-full">~{comparisonResult.differences.modifiedClauses} Changes</span>
                    </div>
                    <ul className="text-xs text-blue-700 space-y-1">
                      {comparisonResult.differences.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className={`
                            inline-block w-4 h-4 rounded-full mr-2 flex-shrink-0 mt-0.5
                            ${detail.type === 'addition' ? 'bg-green-200' : 
                            detail.type === 'removal' ? 'bg-red-200' : 'bg-yellow-200'}
                          `}></span>
                          <span>{detail.section}: {detail.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="mr-2"
                    onClick={() => {
                      if (comparisonResult) {
                        // Switch template type
                        const newType = emailType === 'comparison' ? 'recommendations' : 'comparison';
                        setEmailType(newType);
                        setValue('content', generateEmailContent(comparisonResult, newType));
                      }
                    }}
                    disabled={!comparisonResult}
                  >
                    Switch Template
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={sendEmailMutation.isPending}
                  >
                    {sendEmailMutation.isPending ? 'Sending...' : 'Send Email'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}
