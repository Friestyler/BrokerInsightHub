import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Shield, 
  Mail, 
  Users, 
  Check, 
  ChevronRight,
  Calendar,
  Info
} from "lucide-react";

interface CampaignSettingsWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
}

export default function CampaignSettingsWizard({ isOpen, onClose, onSave }: CampaignSettingsWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [settings, setSettings] = useState({
    // General Settings
    scheduleType: 'immediate',
    scheduledDate: '',
    scheduledTime: '',
    
    // Permissions
    canAddContacts: true,
    canChangeEmails: true,
    canLaunchCampaign: true,
    canAddLogo: true,
    canCustomizeTemplates: false,
    
    // Sender Settings
    senderName: '',
    replyToEmail: '',
    emailSendingType: 'qollabi_default',
    
    // Automation Settings
    automationType: 'hold_review',
    excludePreviouslySent: true,
    segmentChangeNotifications: false
  });

  const steps = [
    {
      id: 'general',
      title: 'General',
      icon: Settings,
      completed: currentStep > 0
    },
    {
      id: 'permissions',
      title: 'Permissions',
      icon: Shield,
      completed: currentStep > 1
    },
    {
      id: 'sender',
      title: 'Sender',
      icon: Mail,
      completed: currentStep > 2
    },
    {
      id: 'automation',
      title: 'Automation',
      icon: Users,
      completed: currentStep > 3
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onSave(settings);
    onClose();
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Campaign Settings Wizard</h2>
          <p className="text-gray-600 mt-1">Configure your campaign step by step</p>
        </div>

        {/* Step Navigation */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = step.completed;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-lg
                    ${isActive ? 'bg-black text-white' : 
                      isCompleted ? 'bg-green-100 text-green-600' : 
                      'bg-gray-100 text-gray-400'}
                  `}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className={`text-sm font-medium ${isActive ? 'text-black' : 'text-gray-600'}`}>
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-400 ml-6" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {/* General Settings */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule Settings
                </CardTitle>
                <p className="text-sm text-gray-600">Configure when to send your campaigns</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup 
                  value={settings.scheduleType} 
                  onValueChange={(value) => updateSetting('scheduleType', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediate" id="immediate" />
                    <Label htmlFor="immediate">Send Immediately</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scheduled" id="scheduled" />
                    <Label htmlFor="scheduled">Schedule for Later</Label>
                  </div>
                </RadioGroup>
                
                {settings.scheduleType === 'scheduled' && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="scheduledDate">Date</Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={settings.scheduledDate}
                        onChange={(e) => updateSetting('scheduledDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduledTime">Time</Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={settings.scheduledTime}
                        onChange={(e) => updateSetting('scheduledTime', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Permissions Settings */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Partner Edit Permissions</CardTitle>
                <p className="text-sm text-gray-600">Control which sections partners can customize</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'canAddContacts', label: 'Can add contacts' },
                  { key: 'canChangeEmails', label: 'Can change emails' },
                  { key: 'canLaunchCampaign', label: 'Can launch campaign' },
                  { key: 'canAddLogo', label: 'Can add logo' },
                  { key: 'canCustomizeTemplates', label: 'Can customize templates' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={key}
                        checked={settings[key as keyof typeof settings] as boolean}
                        onCheckedChange={(checked) => updateSetting(key, checked)}
                      />
                      <Label htmlFor={key} className="text-sm font-medium">
                        {label}
                      </Label>
                    </div>
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Sender Settings */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sender Information</CardTitle>
                  <p className="text-sm text-gray-600">Configure how the campaign appears to recipients</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="senderName">Sender Display Name *</Label>
                    <Input
                      id="senderName"
                      placeholder="Enter sender name"
                      value={settings.senderName}
                      onChange={(e) => updateSetting('senderName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="replyToEmail">Reply-To Email Address *</Label>
                    <Input
                      id="replyToEmail"
                      type="email"
                      placeholder="Enter reply-to email"
                      value={settings.replyToEmail}
                      onChange={(e) => updateSetting('replyToEmail', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Sending Configuration</CardTitle>
                  <p className="text-sm text-gray-600">Choose which email address will be used to send campaigns</p>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={settings.emailSendingType} 
                    onValueChange={(value) => updateSetting('emailSendingType', value)}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="qollabi_default" id="qollabi_default" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="qollabi_default" className="font-medium">
                            Use Qollabi Default Email
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              Recommended
                            </span>
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            Send campaigns from our verified Qollabi email address
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="custom_email" id="custom_email" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="custom_email" className="font-medium">
                            Connect Your Own Email
                            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              Custom
                            </span>
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            Use your own email address with SMTP configuration
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="partner_select" id="partner_select" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="partner_select" className="font-medium">
                            Let Partner Select Email
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              Flexible
                            </span>
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            Allow partners to choose their own sending email address
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Automation Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Segment Automation Settings</CardTitle>
                  <p className="text-sm text-gray-600">Control how new records entering the segment are handled</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Segment Campaign Only</span>
                    </div>
                    <p className="text-sm text-orange-700 mt-2">
                      These automation settings only apply when entire segments are selected as recipients in your campaign. 
                      Individual contact selections will not trigger these automation rules.
                    </p>
                  </div>

                  <RadioGroup 
                    value={settings.automationType} 
                    onValueChange={(value) => updateSetting('automationType', value)}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="send_automatically" id="send_automatically" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="send_automatically" className="font-medium">
                            Send Automatically
                            <span className="ml-2 px-2 py-1 bg-black text-white text-xs rounded">
                              Automated
                            </span>
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            New segment members receive the campaign immediately
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="hold_review" id="hold_review" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="hold_review" className="font-medium">
                            Hold for Review
                            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              Controlled
                            </span>
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            New segment members are added to draft for manual confirmation
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Manual Review Process</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      New segment members will be added to a draft list for your review and approval before sending.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Segment Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Exclude Previously Sent</Label>
                      <p className="text-sm text-gray-600">
                        Prevent sending duplicate campaigns to records that already received this campaign
                      </p>
                    </div>
                    <Switch
                      checked={settings.excludePreviouslySent}
                      onCheckedChange={(checked) => updateSetting('excludePreviouslySent', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Segment Change Notifications</Label>
                      <p className="text-sm text-gray-600">
                        Receive notifications when new records enter or leave the segment
                      </p>
                    </div>
                    <Switch
                      checked={settings.segmentChangeNotifications}
                      onCheckedChange={(checked) => updateSetting('segmentChangeNotifications', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} className="bg-black hover:bg-gray-800">
                Save & Next
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-black hover:bg-gray-800">
                Complete Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}