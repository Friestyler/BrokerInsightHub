import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ToolHeader from "@/components/ToolHeader";
import { Textarea } from "@/components/ui/textarea";

interface UploadedFile {
  id: string;
  name: string;
  date: string;
  type: string;
}

interface EmailForm {
  recipient: string;
  subject: string;
  content: string;
}

export default function CompareFiles() {
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: '1', name: 'AXA_Policy_2025.pdf', date: 'yesterday', type: 'pdf' },
    { id: '2', name: 'AG_Insurance_Quote.pdf', date: '2 days ago', type: 'pdf' }
  ]);
  
  const [emailType, setEmailType] = useState<'comparison' | 'recommendations'>('comparison');
  
  const { register, handleSubmit } = useForm<EmailForm>({
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
  
  const onSubmit = (data: EmailForm) => {
    console.log('Email data:', data);
    // Here you would typically send the email data to the backend
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
              
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center bg-neutral-50">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="text-neutral-600 mb-4">Drag and drop files here or click to browse</p>
                <Button>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  Select Files
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
              <h3 className="font-medium mb-4 text-neutral-800">Generate Client Email</h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                
                <div className="flex justify-end">
                  <Button type="button" variant="secondary" className="mr-2">
                    Save Draft
                  </Button>
                  <Button type="submit">
                    Send Email
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
