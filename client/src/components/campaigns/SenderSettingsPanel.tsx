import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SenderSettingsPanelProps {
  fromName: string;
  fromEmail: string;
  emailSendingType: string;
  onFromNameChange: (value: string) => void;
  onFromEmailChange: (value: string) => void;
  onEmailSendingTypeChange: (value: string) => void;
  isPartnerMode?: boolean;
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
              
              {isPartnerMode && (
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
              )}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}