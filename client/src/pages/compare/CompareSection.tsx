import { useState } from "react";
import { 
  CloudUpload, 
  Save, 
  Send, 
  Wand2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function CompareSection() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [comparisonOptions, setComparisonOptions] = useState({
    coverageDifferences: true,
    premiumChanges: true,
    termsConditions: true,
    exclusions: false
  });
  const [comparisonResults, setComparisonResults] = useState<boolean>(false);
  const [emailTemplate, setEmailTemplate] = useState("policy-comparison");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("Your Insurance Policy Update - Important Changes");
  const [message, setMessage] = useState(
    `Dear Client,

I hope this email finds you well. I'm reaching out to inform you about some important changes to your insurance policy.

Based on our recent review, we've identified several updates to your policy that I'd like to bring to your attention:

1. Added Coverage: Water damage protection has been included
2. Removed Coverage: Travel assistance in neighboring countries
3. Premium Adjustment: Your annual premium has increased from €1,240 to €1,350 (+8.9%)

These changes will be effective from your next renewal date. I'm available to discuss these changes and answer any questions you might have.

Best regards,
Your Insurance Broker`
  );

  const handleFileUpload = (file: File | null, type: 'original' | 'new') => {
    if (type === 'original') {
      setOriginalFile(file);
    } else {
      setNewFile(file);
    }
  };

  const handleComparisonOptionChange = (option: keyof typeof comparisonOptions) => {
    setComparisonOptions({
      ...comparisonOptions,
      [option]: !comparisonOptions[option]
    });
  };

  const handleRunComparison = () => {
    // For demonstration purposes, just show the results section
    setComparisonResults(true);
  };

  const handleGenerateWithAI = () => {
    // In a real app, this would call an AI service
    // For now, we'll just show a more professional message
    setMessage(
      `Dear Client,

I hope this message finds you well. I wanted to personally reach out regarding the recent updates to your insurance policy that will take effect on your upcoming renewal date.

After conducting a thorough comparison between your current and new policy, I've identified the following key changes:

✅ NEW COVERAGE ADDED:
- Comprehensive water damage protection (€500 deductible)
- This addition provides coverage for unexpected plumbing issues, flooding, and water-related damages.

❌ COVERAGE REMOVED:
- Travel assistance in neighboring countries
- Note: This service is being discontinued by the insurer for all policies in this category.

💶 PREMIUM ADJUSTMENT:
- Previous annual premium: €1,240
- New annual premium: €1,350
- Change: +8.9% (€110 increase)

These adjustments reflect current market conditions and risk assessments. I'd be happy to discuss how these changes specifically impact your situation and explore any alternative options if needed.

Please feel free to contact me with any questions or concerns. I'm available to schedule a call at your convenience.

Best regards,
John Broker
Certified Insurance Advisor
+32 XXX XXX XXX`
    );
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Compare Files & Create Email</h2>
        <div className="flex items-center">
          <Button variant="outline" className="mr-3">
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button variant="default" className="bg-primary-600 hover:bg-primary-700">
            <Send className="h-4 w-4 mr-2" /> Send Email
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Comparison Section */}
        <div className="border border-neutral-200 rounded-lg p-5">
          <h3 className="text-base font-medium text-neutral-900 mb-4">Document Comparison</h3>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-neutral-700 mb-1">Upload Documents</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary-500 cursor-pointer"
                onClick={() => document.getElementById('upload-original')?.click()}
              >
                <input 
                  id="upload-original" 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e.target.files?.[0] || null, 'original')}
                />
                <div className="mb-2 text-neutral-500">
                  <CloudUpload className="h-6 w-6 mx-auto" />
                </div>
                <p className="text-sm text-neutral-600">Upload Original Policy</p>
                <span className="text-xs text-primary-600 block mt-1">
                  {originalFile ? originalFile.name : "Browse files"}
                </span>
              </div>
              <div 
                className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary-500 cursor-pointer"
                onClick={() => document.getElementById('upload-new')?.click()}
              >
                <input 
                  id="upload-new" 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e.target.files?.[0] || null, 'new')}
                />
                <div className="mb-2 text-neutral-500">
                  <CloudUpload className="h-6 w-6 mx-auto" />
                </div>
                <p className="text-sm text-neutral-600">Upload New Policy</p>
                <span className="text-xs text-primary-600 block mt-1">
                  {newFile ? newFile.name : "Browse files"}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <Label className="block text-sm font-medium text-neutral-700 mb-1">Comparison Options</Label>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="coverage-differences" 
                  checked={comparisonOptions.coverageDifferences}
                  onCheckedChange={() => handleComparisonOptionChange('coverageDifferences')}
                />
                <label
                  htmlFor="coverage-differences"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Coverage Differences
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="premium-changes" 
                  checked={comparisonOptions.premiumChanges}
                  onCheckedChange={() => handleComparisonOptionChange('premiumChanges')}
                />
                <label
                  htmlFor="premium-changes"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Premium Changes
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms-conditions" 
                  checked={comparisonOptions.termsConditions}
                  onCheckedChange={() => handleComparisonOptionChange('termsConditions')}
                />
                <label
                  htmlFor="terms-conditions"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Terms & Conditions
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="exclusions" 
                  checked={comparisonOptions.exclusions}
                  onCheckedChange={() => handleComparisonOptionChange('exclusions')}
                />
                <label
                  htmlFor="exclusions"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Exclusions
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button 
              className="w-full bg-primary-600 hover:bg-primary-700" 
              onClick={handleRunComparison}
            >
              Run Comparison
            </Button>
          </div>

          {comparisonResults && (
            <div className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-neutral-800">Comparison Results</h4>
                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">2 files compared</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xs text-green-600">+</span>
                  </div>
                  <p className="ml-2 text-sm text-neutral-700">New coverage: Water damage protection added</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-xs text-red-600">-</span>
                  </div>
                  <p className="ml-2 text-sm text-neutral-700">Removed: Travel assistance in neighboring countries</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-xs text-yellow-600">↔</span>
                  </div>
                  <p className="ml-2 text-sm text-neutral-700">Premium changed: €1,240/year to €1,350/year (+8.9%)</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Email Creator Section */}
        <div className="border border-neutral-200 rounded-lg p-5">
          <h3 className="text-base font-medium text-neutral-900 mb-4">Email Creator</h3>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-neutral-700 mb-1">Email Template</Label>
            <Select 
              value={emailTemplate} 
              onValueChange={setEmailTemplate}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="policy-comparison">Policy Comparison Summary</SelectItem>
                <SelectItem value="new-policy">New Policy Introduction</SelectItem>
                <SelectItem value="premium-change">Premium Change Notification</SelectItem>
                <SelectItem value="coverage-update">Coverage Update</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label className="block text-sm font-medium text-neutral-700 mb-1">Recipient</Label>
            <Input 
              type="email" 
              placeholder="client@example.com" 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <Label className="block text-sm font-medium text-neutral-700 mb-1">Subject</Label>
            <Input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <Label className="block text-sm font-medium text-neutral-700 mb-1">Message</Label>
            <Textarea 
              rows={8} 
              placeholder="Type your message or use AI to generate content based on comparison results"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <div className="mt-6 flex items-center">
            <Button 
              variant="outline" 
              className="flex-1 mr-3"
              onClick={handleGenerateWithAI}
            >
              <Wand2 className="h-4 w-4 mr-2" /> Generate with AI
            </Button>
            <Button 
              variant="default" 
              className="flex-1 bg-primary-600 hover:bg-primary-700"
            >
              Preview Email
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
