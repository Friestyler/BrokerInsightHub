import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Settings, CheckCircle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SenderSettingsPanelProps {
  fromName: string;
  fromEmail: string;
  emailSendingType: string;
  onFromNameChange: (value: string) => void;
  onFromEmailChange: (value: string) => void;
  onEmailSendingTypeChange: (value: string) => void;
  isPartnerMode?: boolean;
}

// Email Connection Tabs Component
function EmailConnectionTabs({ onConnect, isConnecting }: { onConnect: (provider: string, data: any) => void, isConnecting: boolean }) {
  const [outlookEmail, setOutlookEmail] = useState('');
  const [outlookPassword, setOutlookPassword] = useState('');
  const [gmailEmail, setGmailEmail] = useState('');
  const [gmailPassword, setGmailPassword] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [customName, setCustomName] = useState('');

  const handleOutlookConnect = () => {
    onConnect('Outlook', {
      email: outlookEmail,
      password: outlookPassword,
      name: outlookEmail.split('@')[0]
    });
  };

  const handleGmailConnect = () => {
    onConnect('Gmail', {
      email: gmailEmail,
      password: gmailPassword,
      name: gmailEmail.split('@')[0]
    });
  };

  const handleCustomConnect = () => {
    onConnect('Custom SMTP', {
      email: customEmail,
      password: customPassword,
      name: customName,
      smtpHost,
      smtpPort
    });
  };

  return (
    <Tabs defaultValue="outlook" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="outlook">Outlook</TabsTrigger>
        <TabsTrigger value="gmail">Gmail</TabsTrigger>
        <TabsTrigger value="custom">Custom</TabsTrigger>
      </TabsList>
      
      <TabsContent value="outlook" className="space-y-4">
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium mb-2">Connect with Outlook</h3>
          <p className="text-sm text-gray-600">Sign in to your Microsoft Outlook account</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="outlook-email">Email Address</Label>
            <Input
              id="outlook-email"
              type="email"
              placeholder="your-email@outlook.com"
              value={outlookEmail}
              onChange={(e) => setOutlookEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="outlook-password">Password</Label>
            <Input
              id="outlook-password"
              type="password"
              placeholder="Enter your password"
              value={outlookPassword}
              onChange={(e) => setOutlookPassword(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleOutlookConnect}
            disabled={!outlookEmail || !outlookPassword || isConnecting}
            className="w-full"
          >
            {isConnecting ? 'Connecting...' : 'Connect Outlook'}
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="gmail" className="space-y-4">
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="font-medium mb-2">Connect with Gmail</h3>
          <p className="text-sm text-gray-600">Sign in to your Google Gmail account</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="gmail-email">Email Address</Label>
            <Input
              id="gmail-email"
              type="email"
              placeholder="your-email@gmail.com"
              value={gmailEmail}
              onChange={(e) => setGmailEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gmail-password">Password</Label>
            <Input
              id="gmail-password"
              type="password"
              placeholder="Enter your password"
              value={gmailPassword}
              onChange={(e) => setGmailPassword(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleGmailConnect}
            disabled={!gmailEmail || !gmailPassword || isConnecting}
            className="w-full"
          >
            {isConnecting ? 'Connecting...' : 'Connect Gmail'}
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="custom" className="space-y-4">
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Settings className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="font-medium mb-2">Custom SMTP Settings</h3>
          <p className="text-sm text-gray-600">Configure your own email server</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="custom-name">Display Name</Label>
            <Input
              id="custom-name"
              placeholder="Your Name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="custom-email">Email Address</Label>
            <Input
              id="custom-email"
              type="email"
              placeholder="your-email@yourdomain.com"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="custom-password">Password</Label>
            <Input
              id="custom-password"
              type="password"
              placeholder="Enter your password"
              value={customPassword}
              onChange={(e) => setCustomPassword(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input
                id="smtp-host"
                placeholder="smtp.yourdomain.com"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input
                id="smtp-port"
                placeholder="587"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={handleCustomConnect}
            disabled={!customEmail || !customPassword || !smtpHost || !smtpPort || isConnecting}
            className="w-full"
          >
            {isConnecting ? 'Connecting...' : 'Connect Custom SMTP'}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default function SenderSettingsPanel({
  fromName,
  fromEmail,
  emailSendingType,
  onFromNameChange,
  onFromEmailChange,
  onEmailSendingTypeChange,
  isPartnerMode = false
}: SenderSettingsPanelProps) {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleEmailConnect = async (provider: string, emailData: any) => {
    setIsConnecting(true);
    try {
      // Simulate email connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConnectedEmail(emailData.email);
      onFromEmailChange(emailData.email);
      onFromNameChange(emailData.name || fromName);
      setIsEmailDialogOpen(false);
      
      toast({
        title: "Email connected successfully",
        description: `Your ${provider} account has been connected.`
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect email account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* Sender Information */}
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
              value={fromName}
              onChange={(e) => onFromNameChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="replyToEmail">Reply-To Email Address *</Label>
            <Input
              id="replyToEmail"
              type="email"
              placeholder="Enter reply-to email"
              value={fromEmail}
              onChange={(e) => onFromEmailChange(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      {/* Email Sending Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Email Sending Configuration</CardTitle>
          <p className="text-sm text-gray-600">Choose which email address will be used to send campaigns</p>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={emailSendingType} 
            onValueChange={onEmailSendingTypeChange}
          >
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="qollabi_default" id="qollabi_default" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="qollabi_default" className="font-medium">
                    {isPartnerMode ? 'Use Default Email' : 'Use Qollabi Default Email'}
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Default</span>
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {isPartnerMode 
                      ? 'Send campaigns from the default platform email address with professional branding'
                      : 'Send campaigns from our verified Qollabi email address'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="custom_email" id="custom_email" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="custom_email" className="font-medium">
                    {isPartnerMode ? "Use Provider's Mail (if applicable)" : 'Connect Your Own Email'}
                    <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {isPartnerMode ? 'Provider' : 'Custom'}
                    </span>
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {isPartnerMode
                      ? 'Send campaigns from the insurance provider\'s email system when available'
                      : 'Use your own email address with SMTP configuration'
                    }
                  </p>
                </div>
              </div>
              
              {isPartnerMode && (
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="partner_select" id="partner_select" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="partner_select" className="font-medium">
                      Connect your own email
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Personal
                      </span>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Connect and send campaigns from your personal or business email account
                    </p>
                    
                    {emailSendingType === 'partner_select' && (
                      <div className="mt-3">
                        {connectedEmail ? (
                          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-800">
                              Connected: {connectedEmail}
                            </span>
                          </div>
                        ) : (
                          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Connect Email Account
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Connect Your Email</DialogTitle>
                              </DialogHeader>
                              <EmailConnectionTabs onConnect={handleEmailConnect} isConnecting={isConnecting} />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}