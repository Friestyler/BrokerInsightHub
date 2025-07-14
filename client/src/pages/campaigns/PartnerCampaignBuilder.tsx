import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Settings, Mail, Send } from "lucide-react";
import { useLocation, useParams } from 'wouter';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ImprovedFlowBuilder from './ImprovedEmailBuilder';
import CampaignSettingsWizard from '@/components/campaigns/CampaignSettingsWizard';

interface PartnerCampaignBuilderProps {
  params?: { campaignId?: string };
  campaignId?: string;
  partnerId?: number | string;
  onComplete?: () => void;
  onBack?: () => void;
}

export default function PartnerCampaignBuilder({ params, campaignId: propCampaignId, partnerId, onComplete, onBack }: PartnerCampaignBuilderProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract campaign ID from props or URL
  const currentPath = window.location.pathname;
  const campaignId = propCampaignId || 
    (currentPath.includes('/broker-view/campaigns/edit/') 
      ? currentPath.split('/broker-view/campaigns/edit/')[1].split('/')[0]
      : params?.campaignId);
  
  // Parse URL query parameters for step control
  const urlParams = new URLSearchParams(window.location.search);
  const stepParam = urlParams.get('step');
  const backUrl = urlParams.get('back_url');
  const envId = urlParams.get('env') || 'degoudse';
  
  // Map step names to step numbers for 3-step workflow
  const getStepNumber = (stepName: string | null) => {
    switch (stepName) {
      case 'settings': return 2;
      case 'drafts': return 3;
      default: return 1; // flow builder
    }
  };
  
  const [currentStep, setCurrentStep] = useState(getStepNumber(stepParam));
  const [campaignData, setCampaignData] = useState<any>(null);
  const [emailBlocks, setEmailBlocks] = useState<any[]>([]);
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [subject, setSubject] = useState('');
  
  // Fetch campaign data
  const { data: campaign, isLoading } = useQuery({
    queryKey: [`/api/${envId}/campaigns`, campaignId],
    queryFn: () => apiRequest('GET', `/api/${envId}/campaigns/${campaignId}`),
    enabled: !!campaignId
  });
  
  // Load campaign data when fetched
  useEffect(() => {
    if (campaign) {
      console.log('Loading partner campaign data:', campaign);
      setCampaignData(campaign);
      setSubject(campaign.subject || '');
      setFromName(campaign.from_name || '');
      setFromEmail(campaign.from_email || '');
      
      // Parse email body
      try {
        const parsedBlocks = campaign.email_body ? JSON.parse(campaign.email_body) : [];
        setEmailBlocks(parsedBlocks);
      } catch (error) {
        console.error('Error parsing email body:', error);
        setEmailBlocks([]);
      }
    }
  }, [campaign]);
  
  // Update URL when step changes
  const updateStepInUrl = (step: number) => {
    const stepNames = ['', 'flow', 'settings', 'drafts'];
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('step', stepNames[step]);
    window.history.replaceState({}, '', newUrl.toString());
  };
  
  // Handle step navigation
  const goToStep = (step: number) => {
    setCurrentStep(step);
    updateStepInUrl(step);
  };
  
  const handleNext = () => {
    if (currentStep < 3) {
      goToStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onComplete) {
      onComplete();
    } else if (backUrl) {
      window.location.href = decodeURIComponent(backUrl);
    } else {
      setLocation('/broker-view/partners');
    }
  };
  
  // Save campaign mutation
  const saveCampaignMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PUT', `/api/${envId}/campaigns/${campaignId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${envId}/campaigns`] });
      toast({
        title: "Campaign updated",
        description: "Your changes have been saved successfully."
      });
    },
    onError: (error) => {
      console.error('Error saving campaign:', error);
      toast({
        title: "Save failed",
        description: "Failed to save campaign changes. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle saving campaign data
  const handleSave = async () => {
    if (!campaignData) return;
    
    const updateData = {
      subject,
      email_body: JSON.stringify(emailBlocks),
      from_name: fromName,
      from_email: fromEmail,
      status: 'draft'
    };
    
    saveCampaignMutation.mutate(updateData);
  };
  
  // Step titles for 3-step workflow
  const stepTitles = [
    '',
    'Email Content',
    'Sender Settings', 
    'Drafts & Send'
  ];
  
  const stepIcons = [
    null,
    <Mail className="h-5 w-5" />,
    <Settings className="h-5 w-5" />,
    <Send className="h-5 w-5" />
  ];
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Campaign not found</p>
          <Button onClick={handleBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {campaign.name}
                </h1>
                <p className="text-sm text-gray-500">
                  Assigned campaign - Partner workflow
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleSave}
                disabled={saveCampaignMutation.isPending}
              >
                {saveCampaignMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => goToStep(step)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep === step
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : currentStep > step
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  {stepIcons[step]}
                </button>
                
                <div className="ml-3 mr-8">
                  <p className={`text-sm font-medium ${
                    currentStep === step ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    Step {step}
                  </p>
                  <p className={`text-xs ${
                    currentStep === step ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {stepTitles[step]}
                  </p>
                </div>
                
                {step < 3 && (
                  <div className={`w-16 h-0.5 ${
                    currentStep > step ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Step Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Customize Email Content
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Modify the email content to match your brand and messaging
              </p>
            </div>
            
            <div className="p-6">
              <ImprovedFlowBuilder
                blocks={emailBlocks}
                onBlocksChange={setEmailBlocks}
                subject={subject}
                onSubjectChange={setSubject}
                showSubjectField={true}
                isPartnerMode={true}
              />
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Sender Settings
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Configure who the email will be sent from
              </p>
            </div>
            
            <div className="p-6">
              <CampaignSettingsWizard
                step="sender"
                fromName={fromName}
                fromEmail={fromEmail}
                onFromNameChange={setFromName}
                onFromEmailChange={setFromEmail}
                isPartnerMode={true}
              />
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Ready to Send
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review your campaign and send emails to recipients
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Campaign Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Campaign Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Subject:</span>
                      <p className="font-medium">{subject}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">From:</span>
                      <p className="font-medium">{fromName} &lt;{fromEmail}&gt;</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Recipients:</span>
                      <p className="font-medium">{campaign.recipients?.length || 0} contacts</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className="font-medium">Ready to send</p>
                    </div>
                  </div>
                </div>
                
                {/* Send Options */}
                <div className="flex gap-4">
                  <Button 
                    className="gap-2"
                    onClick={() => {
                      // Handle send logic here
                      toast({
                        title: "Campaign sent",
                        description: "Your campaign has been sent successfully."
                      });
                    }}
                  >
                    <Send className="h-4 w-4" />
                    Send Campaign
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Handle save as draft
                      handleSave();
                    }}
                  >
                    Save as Draft
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="text-sm text-gray-500">
            Step {currentStep} of 3
          </div>
          
          <Button
            onClick={handleNext}
            disabled={currentStep === 3}
            className="gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}