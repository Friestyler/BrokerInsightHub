import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Type, Image, Quote, Minus, Link, FileText, X, 
  GripVertical, Copy, Trash2, Plus as PlusIcon, 
  Lightbulb, Rocket, Heading2 as Heading, ChevronDown,
  ChevronUp, Mail, Sparkles, BarChart3, AlertTriangle, 
  UserPlus, HelpCircle, Trophy, DollarSign, Paperclip,
  Upload, Edit3, Eye, GitBranch, Clock, MousePointer,
  Code, Zap
} from "lucide-react";

interface EmailBlock {
  id: string;
  type: 'text' | 'heading' | 'quote' | 'divider' | 'image' | 'button' | 'spacer' | 'ai';
  content: string;
  properties?: {
    alignment?: 'left' | 'center' | 'right';
    fontSize?: 'small' | 'medium' | 'large';
    color?: string;
    backgroundColor?: string;
    url?: string;
    buttonText?: string;
    imageUrl?: string;
    imageAlt?: string;
    spacerHeight?: number;
    aiType?: string;
  };
}

interface EmailCondition {
  type: 'not_clicked' | 'always' | 'not_opened' | 'custom';
  customPrompt?: string;
  generatedLogic?: string;
}

interface Email {
  id: string;
  subject: string;
  blocks: EmailBlock[];
  followUpDays: number;
  leftLogo: File | null;
  rightLogo: File | null;
  condition?: EmailCondition;
}

interface ImprovedEmailBuilderProps {
  emails: Email[];
  activeEmailIndex: number;
  entityType: string;
  onEmailsChange: (emails: Email[]) => void;
  onActiveEmailChange: (index: number) => void;
}

export default function ImprovedEmailBuilder({ 
  emails, 
  activeEmailIndex, 
  entityType,
  onEmailsChange, 
  onActiveEmailChange 
}: ImprovedEmailBuilderProps) {
  const [expandedEmailIndex, setExpandedEmailIndex] = useState(-1);
  const [draggedBlock, setDraggedBlock] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  const currentEmail = emails[activeEmailIndex] || emails[0];

  const generateBlockId = () => Math.random().toString(36).substr(2, 9);

  const scrollToPreview = () => {
    previewRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateAIContent = (entityType: string, blockType: string): string => {
    const entityMap = {
      'opportunities': 'sales opportunities',
      'customers': 'existing customers', 
      'partners': 'business partners',
      'internal': 'internal team'
    };
    
    const entityName = entityMap[entityType as keyof typeof entityMap] || 'contacts';
    
    const contentTemplates = {
      'highlights': `Great news to share with our ${entityName}! We've achieved significant milestones this quarter that demonstrate our continued growth and success.`,
      'lowlights': `We want to be transparent about some challenges we've faced recently. While these areas need improvement, we're committed to addressing them.`,
      'product-launches': `We're excited to announce new product developments that will benefit our ${entityName}. These innovations represent our commitment to excellence.`,
      'kpis': `Here's a summary of our key performance indicators for this period. These metrics show our progress toward our shared goals.`,
      'fundraising': `We have important updates regarding our funding and investment activities that will strengthen our partnership.`,
      'team': `We're growing our team with talented individuals who share our vision and commitment to serving our ${entityName}.`,
      'asks': `We'd like to request your support in several areas where your expertise and partnership can make a meaningful difference.`
    };
    
    return contentTemplates[blockType as keyof typeof contentTemplates] || `Content for ${entityName} regarding ${blockType}.`;
  };

  const updateEmailField = (field: keyof Email, value: string | number | File | null) => {
    const newEmails = [...emails];
    const emailIndex = expandedEmailIndex >= 0 ? expandedEmailIndex : 0;
    (newEmails[emailIndex] as any)[field] = value;
    onEmailsChange(newEmails);
  };

  const updateBlockContent = (blockIndex: number, content: string) => {
    const newEmails = [...emails];
    const emailIndex = expandedEmailIndex >= 0 ? expandedEmailIndex : 0;
    if (newEmails[emailIndex].blocks[blockIndex]) {
      newEmails[emailIndex].blocks[blockIndex].content = content;
      onEmailsChange(newEmails);
    }
  };

  const updateBlockProperties = (blockIndex: number, properties: EmailBlock['properties']) => {
    const newEmails = [...emails];
    const emailIndex = expandedEmailIndex >= 0 ? expandedEmailIndex : 0;
    if (newEmails[emailIndex].blocks[blockIndex]) {
      newEmails[emailIndex].blocks[blockIndex].properties = {
        ...newEmails[emailIndex].blocks[blockIndex].properties,
        ...properties
      };
      onEmailsChange(newEmails);
    }
  };

  const addBlock = (type: EmailBlock['type'], aiType?: string) => {
    const newEmails = [...emails];
    const emailIndex = expandedEmailIndex >= 0 ? expandedEmailIndex : 0;
    const newBlock: EmailBlock = {
      id: generateBlockId(),
      type,
      content: type === 'ai' && aiType ? generateAIContent(entityType, aiType) : '',
      properties: aiType ? { aiType } : {}
    };
    newEmails[emailIndex].blocks.push(newBlock);
    onEmailsChange(newEmails);
  };

  const removeBlock = (blockIndex: number) => {
    const newEmails = [...emails];
    const emailIndex = expandedEmailIndex >= 0 ? expandedEmailIndex : 0;
    newEmails[emailIndex].blocks.splice(blockIndex, 1);
    onEmailsChange(newEmails);
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newEmails = [...emails];
    const emailIndex = expandedEmailIndex >= 0 ? expandedEmailIndex : 0;
    const blocks = [...newEmails[emailIndex].blocks];
    const [removed] = blocks.splice(fromIndex, 1);
    blocks.splice(toIndex, 0, removed);
    newEmails[emailIndex].blocks = blocks;
    onEmailsChange(newEmails);
  };

  const addNewEmail = () => {
    const newEmails = [...emails];
    newEmails.push({
      id: (newEmails.length + 1).toString(),
      subject: '',
      blocks: [],
      followUpDays: 7,
      leftLogo: null,
      rightLogo: null,
      condition: { type: 'always' }
    });
    onEmailsChange(newEmails);
    onActiveEmailChange(newEmails.length - 1);
    setExpandedEmailIndex(newEmails.length - 1);
  };

  const generateCustomLogic = (prompt: string): string => {
    // AI-powered logic generation based on user prompt
    const logicTemplates = {
      'engagement': 'if contact_engagement_score < 50 and days_since_last_open > 3:',
      'industry': 'if contact_industry in ["finance", "insurance"] and company_size > 100:',
      'behavior': 'if email_opened and not link_clicked and days_since_send >= 2:',
      'timing': 'if current_day in ["tuesday", "wednesday", "thursday"] and current_hour between 9 and 17:',
      'geographic': 'if contact_timezone in ["EST", "PST"] and local_time between 9 and 16:'
    };

    // Simple AI logic: match keywords to templates
    const keywords = prompt.toLowerCase();
    if (keywords.includes('engagement') || keywords.includes('active')) {
      return logicTemplates.engagement;
    } else if (keywords.includes('industry') || keywords.includes('company')) {
      return logicTemplates.industry;
    } else if (keywords.includes('click') || keywords.includes('behavior')) {
      return logicTemplates.behavior;
    } else if (keywords.includes('time') || keywords.includes('day')) {
      return logicTemplates.timing;
    } else if (keywords.includes('location') || keywords.includes('timezone')) {
      return logicTemplates.geographic;
    } else {
      return `# Generated logic based on: "${prompt}"\nif contact_meets_criteria("${prompt}"):`;
    }
  };

  const updateEmailCondition = (emailIndex: number, condition: EmailCondition) => {
    const newEmails = [...emails];
    if (condition.type === 'custom' && condition.customPrompt) {
      condition.generatedLogic = generateCustomLogic(condition.customPrompt);
    }
    newEmails[emailIndex].condition = condition;
    onEmailsChange(newEmails);
  };

  const saveEmail = (emailIndex: number) => {
    setExpandedEmailIndex(-1);
    if (emailIndex === 0 && emails.length === 1) {
      setTimeout(() => {
        const shouldAddSecond = window.confirm("Great! Your first email is saved. Would you like to add a follow-up email?");
        if (shouldAddSecond) {
          addNewEmail();
        }
      }, 500);
    }
  };

  const handleFileUpload = (file: File | null, field: 'leftLogo' | 'rightLogo') => {
    updateEmailField(field, file);
  };

  const contentBlocks = [
    { id: 'text', icon: Type, title: 'Text' },
    { id: 'heading', icon: Heading, title: 'Heading' },
    { id: 'quote', icon: Quote, title: 'Quote' },
    { id: 'button', icon: Link, title: 'Button' },
    { id: 'image', icon: Image, title: 'Image' },
    { id: 'divider', icon: Minus, title: 'Divider' },
    { id: 'spacer', icon: PlusIcon, title: 'Spacer' }
  ];

  const aiContentBlocks = [
    { id: 'highlights', icon: Trophy, title: 'Highlights' },
    { id: 'lowlights', icon: AlertTriangle, title: 'Lowlights' },
    { id: 'product-launches', icon: Rocket, title: 'Product launches' },
    { id: 'kpis', icon: BarChart3, title: 'KPIs' },
    { id: 'fundraising', icon: DollarSign, title: 'Fundraising' },
    { id: 'team', icon: UserPlus, title: 'Team' },
    { id: 'asks', icon: HelpCircle, title: 'Asks' }
  ];

  const dynamicFields = [
    { field: 'name', label: 'Contact name' },
    { field: 'company', label: 'Company name' },
    { field: 'title', label: 'Job title' },
    { field: 'email', label: 'Email address' },
    { field: 'phone', label: 'Phone number' },
    { field: 'product_names', label: 'Product names' },
    { field: 'total_value', label: 'Total value' }
  ];

  const editingEmail = expandedEmailIndex >= 0 ? emails[expandedEmailIndex] : null;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-medium text-gray-900 mb-2">Email Builder</h2>
        <p className="text-gray-600">Create your email sequence step by step</p>
      </div>

      {/* Email Cards - Collapsed View */}
      {expandedEmailIndex === -1 && (
        <div className="space-y-3 mb-8">
          {emails.map((email, index) => (
            <div key={email.id}>
              {/* Email Card */}
              <div className="border rounded-lg bg-white hover:shadow-sm transition-shadow">
                <div className="p-6 flex items-center justify-between cursor-pointer" 
                     onClick={() => setExpandedEmailIndex(index)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Email {index + 1}
                        {email.followUpDays > 0 && (
                          <span className="ml-2 text-sm text-gray-500">
                            (+{email.followUpDays} days)
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-500">
                        {email.subject || 'No subject set'} • {email.blocks.length} blocks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </Button>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Logic Condition - Only show between emails (not after the last one) */}
              {index < emails.length - 1 && (
                <div className="relative py-4">
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 transform -translate-x-1/2"></div>
                  <div className="relative bg-white max-w-md mx-auto border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <GitBranch className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-900">Send Logic</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => updateEmailCondition(index + 1, { type: 'not_clicked' })}
                          className={`p-2 text-xs border rounded transition-colors ${
                            emails[index + 1]?.condition?.type === 'not_clicked'
                              ? 'bg-orange-50 border-orange-200 text-orange-700'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <MousePointer className="h-3 w-3 mx-auto mb-1" />
                          Not clicked
                        </button>
                        <button
                          onClick={() => updateEmailCondition(index + 1, { type: 'always' })}
                          className={`p-2 text-xs border rounded transition-colors ${
                            emails[index + 1]?.condition?.type === 'always'
                              ? 'bg-orange-50 border-orange-200 text-orange-700'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Clock className="h-3 w-3 mx-auto mb-1" />
                          Always
                        </button>
                        <button
                          onClick={() => updateEmailCondition(index + 1, { type: 'not_opened' })}
                          className={`p-2 text-xs border rounded transition-colors ${
                            emails[index + 1]?.condition?.type === 'not_opened'
                              ? 'bg-orange-50 border-orange-200 text-orange-700'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Eye className="h-3 w-3 mx-auto mb-1" />
                          Not opened
                        </button>
                        <button
                          onClick={() => updateEmailCondition(index + 1, { type: 'custom', customPrompt: '' })}
                          className={`p-2 text-xs border rounded transition-colors ${
                            emails[index + 1]?.condition?.type === 'custom'
                              ? 'bg-orange-50 border-orange-200 text-orange-700'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Code className="h-3 w-3 mx-auto mb-1" />
                          Custom
                        </button>
                      </div>

                      {/* Custom Logic Input */}
                      {emails[index + 1]?.condition?.type === 'custom' && (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Describe when this email should be sent... e.g., 'Send if user is from finance industry and hasn't clicked previous links'"
                            value={emails[index + 1]?.condition?.customPrompt || ''}
                            onChange={(e) => updateEmailCondition(index + 1, {
                              type: 'custom',
                              customPrompt: e.target.value
                            })}
                            className="text-xs resize-none"
                            rows={2}
                          />
                          {emails[index + 1]?.condition?.generatedLogic && (
                            <div className="bg-gray-50 rounded p-2">
                              <div className="flex items-center gap-1 mb-1">
                                <Zap className="h-3 w-3 text-purple-600" />
                                <span className="text-xs font-medium text-purple-700">Generated Logic</span>
                              </div>
                              <code className="text-xs text-gray-700 font-mono">
                                {emails[index + 1]?.condition?.generatedLogic}
                              </code>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Logic Description */}
                      <div className="text-xs text-gray-600">
                        {emails[index + 1]?.condition?.type === 'not_clicked' && 'Send if recipient didn\'t click any links in previous email'}
                        {emails[index + 1]?.condition?.type === 'always' && 'Send automatically after delay period'}
                        {emails[index + 1]?.condition?.type === 'not_opened' && 'Send if recipient didn\'t open previous email'}
                        {emails[index + 1]?.condition?.type === 'custom' && 'Send based on custom conditions using AI logic'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Email Button */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg">
            <div className="p-6 text-center">
              <PlusIcon className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Add Follow-up Email</h3>
              <p className="text-gray-600 mb-4">Create a sequence to increase engagement</p>
              <Button onClick={addNewEmail} variant="outline" className="gap-2">
                <PlusIcon className="h-4 w-4" />
                Add Email
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Email Builder */}
      {expandedEmailIndex >= 0 && editingEmail && (
        <div className="bg-white rounded-lg border">
          {/* Email Header */}
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-medium text-gray-900">
                Email {expandedEmailIndex + 1}
                {editingEmail.followUpDays > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    (+{editingEmail.followUpDays} days)
                  </span>
                )}
              </h3>
              <Button variant="outline" size="sm" onClick={scrollToPreview} className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setExpandedEmailIndex(-1)}>
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-8 p-6">
            {/* Main Content Area - 3 columns */}
            <div className="col-span-3 space-y-6">
              {/* Email Settings */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                  <Input
                    placeholder="Enter email subject..."
                    value={editingEmail.subject}
                    onChange={(e) => updateEmailField('subject', e.target.value)}
                    className="h-11"
                  />
                </div>
                {expandedEmailIndex > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Days</label>
                    <Input
                      type="number"
                      placeholder="7"
                      value={editingEmail.followUpDays}
                      onChange={(e) => updateEmailField('followUpDays', parseInt(e.target.value) || 0)}
                      className="h-11 w-32"
                    />
                  </div>
                )}
              </div>

              {/* Logo Upload */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Left Logo</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload logo</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files?.[0] || null, 'leftLogo')}
                      className="mt-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Right Logo</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload logo</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files?.[0] || null, 'rightLogo')}
                      className="mt-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Content Builder */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Email Content</h4>
                <div className="border rounded-lg min-h-[500px] p-6 bg-gray-50">
                  {editingEmail.blocks.map((block, blockIndex) => (
                    <div
                      key={block.id}
                      className="group relative mb-4 p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-all"
                      draggable
                      onDragStart={(e) => {
                        setDraggedBlock(blockIndex);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedBlock !== null && draggedBlock !== blockIndex) {
                          moveBlock(draggedBlock, blockIndex);
                          setDraggedBlock(null);
                        }
                      }}
                      onDragEnd={() => setDraggedBlock(null)}
                    >
                      <div className="flex items-center gap-2 absolute -left-8 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                      </div>
                      
                      <div className="flex items-center gap-2 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removeBlock(blockIndex)} className="h-6 w-6 p-0">
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                      
                      {block.type === 'text' && (
                        <Textarea
                          value={block.content}
                          onChange={(e) => updateBlockContent(blockIndex, e.target.value)}
                          placeholder="Enter paragraph text... Use {{name}}, {{company}} for dynamic fields"
                          className="border-none p-0 resize-none min-h-[80px] focus:ring-0 bg-transparent"
                        />
                      )}
                      {block.type === 'heading' && (
                        <Input
                          value={block.content}
                          onChange={(e) => updateBlockContent(blockIndex, e.target.value)}
                          placeholder="Enter heading... Use {{name}} for personalization"
                          className="border-none p-0 text-xl font-bold focus:ring-0 bg-transparent"
                        />
                      )}
                      {block.type === 'quote' && (
                        <div className="border-l-4 border-blue-500 pl-4">
                          <Textarea
                            value={block.content}
                            onChange={(e) => updateBlockContent(blockIndex, e.target.value)}
                            placeholder="Enter quote or testimonial..."
                            className="border-none p-0 resize-none min-h-[80px] italic focus:ring-0 bg-transparent"
                          />
                        </div>
                      )}
                      {block.type === 'ai' && (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">
                              AI Content: {block.properties?.aiType}
                            </span>
                          </div>
                          <Textarea
                            value={block.content}
                            onChange={(e) => updateBlockContent(blockIndex, e.target.value)}
                            placeholder="AI-generated content will appear here..."
                            className="border-none p-0 resize-none min-h-[100px] focus:ring-0 bg-transparent"
                          />
                        </div>
                      )}
                      {block.type === 'button' && (
                        <div className="space-y-3">
                          <Input
                            value={block.content}
                            onChange={(e) => updateBlockContent(blockIndex, e.target.value)}
                            placeholder="Button text..."
                            className="border-none p-0 font-semibold focus:ring-0 bg-transparent"
                          />
                          <Input
                            value={block.properties?.url || ''}
                            onChange={(e) => updateBlockProperties(blockIndex, { url: e.target.value })}
                            placeholder="Button URL..."
                            className="text-sm text-blue-600 bg-transparent"
                          />
                        </div>
                      )}
                      {block.type === 'image' && (
                        <div className="space-y-3">
                          <Input
                            value={block.properties?.imageUrl || ''}
                            onChange={(e) => updateBlockProperties(blockIndex, { imageUrl: e.target.value })}
                            placeholder="Image URL..."
                            className="border-none p-0 focus:ring-0 bg-transparent"
                          />
                          <Input
                            value={block.properties?.imageAlt || ''}
                            onChange={(e) => updateBlockProperties(blockIndex, { imageAlt: e.target.value })}
                            placeholder="Alt text..."
                            className="text-sm bg-transparent"
                          />
                        </div>
                      )}
                      {block.type === 'divider' && (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-full h-px bg-gray-300"></div>
                        </div>
                      )}
                      {block.type === 'spacer' && (
                        <div className="flex items-center justify-center py-6 text-gray-400 text-sm">
                          <div className="border-2 border-dashed border-gray-200 rounded w-full text-center py-4">
                            Spacer ({block.properties?.spacerHeight || 20}px)
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {editingEmail.blocks.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="mb-4 text-lg">Start building your email</p>
                      <p className="text-sm">Add content blocks from the sidebar to get started</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center gap-4 pt-4">
                <Button onClick={() => saveEmail(expandedEmailIndex)} size="lg" className="gap-2">
                  Save Email {expandedEmailIndex + 1}
                </Button>
                {expandedEmailIndex === emails.length - 1 && (
                  <Button variant="outline" onClick={addNewEmail} size="lg" className="gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Add Follow-up Email
                  </Button>
                )}
              </div>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Content Blocks */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Content Blocks</h4>
                <div className="space-y-2">
                  {contentBlocks.map((block) => {
                    const IconComponent = block.icon;
                    return (
                      <button
                        key={block.id}
                        onClick={() => addBlock(block.id as EmailBlock['type'])}
                        className="w-full flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <IconComponent className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">{block.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Content */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  AI Content
                </h4>
                <div className="space-y-2">
                  {aiContentBlocks.map((block) => {
                    const IconComponent = block.icon;
                    return (
                      <button
                        key={block.id}
                        onClick={() => addBlock('ai', block.id)}
                        className="w-full flex items-center gap-3 p-3 text-left border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <IconComponent className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">{block.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Fields */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Dynamic Fields</h4>
                <div className="space-y-1">
                  {dynamicFields.map((field) => (
                    <div
                      key={field.field}
                      className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => navigator.clipboard.writeText(`{{${field.field}}}`)}
                    >
                      <div className="flex items-center gap-2">
                        <code className="bg-white px-2 py-1 rounded text-xs font-mono">
                          {`{{${field.field}}}`}
                        </code>
                        <span className="text-xs text-gray-600">{field.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {expandedEmailIndex >= 0 && editingEmail && (
        <div ref={previewRef} className="mt-8 bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Email Preview</h4>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="bg-white rounded border p-6 max-w-2xl mx-auto">
              {/* Logo Header */}
              {(editingEmail.leftLogo || editingEmail.rightLogo) && (
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  {editingEmail.leftLogo && (
                    <div className="h-8 w-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                      Left Logo
                    </div>
                  )}
                  {editingEmail.rightLogo && (
                    <div className="h-8 w-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                      Right Logo
                    </div>
                  )}
                </div>
              )}
              
              {/* Email Header */}
              <div className="mb-6 pb-4 border-b">
                <div className="text-lg font-semibold">{editingEmail.subject || 'Subject Line'}</div>
              </div>
              
              {/* Email Content */}
              {editingEmail.blocks.map((block, index) => (
                <div key={block.id} className="mb-4">
                  {block.type === 'text' && (
                    <p className="leading-relaxed">{block.content || 'Paragraph text...'}</p>
                  )}
                  {block.type === 'heading' && (
                    <h3 className="font-bold text-xl mb-3">{block.content || 'Heading...'}</h3>
                  )}
                  {block.type === 'quote' && (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600">
                      {block.content || 'Quote...'}
                    </blockquote>
                  )}
                  {block.type === 'ai' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">
                          {block.properties?.aiType}
                        </span>
                      </div>
                      <p className="leading-relaxed">{block.content || 'AI content...'}</p>
                    </div>
                  )}
                  {block.type === 'button' && (
                    <div className="text-center">
                      <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium">
                        {block.content || 'Button Text'}
                      </button>
                    </div>
                  )}
                  {block.type === 'image' && block.properties?.imageUrl && (
                    <div className="text-center">
                      <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center text-gray-500">
                        Image: {block.properties.imageAlt || 'No alt text'}
                      </div>
                    </div>
                  )}
                  {block.type === 'divider' && <hr className="my-6" />}
                  {block.type === 'spacer' && (
                    <div style={{ height: block.properties?.spacerHeight || 20 }}></div>
                  )}
                </div>
              ))}
              
              {editingEmail.blocks.length === 0 && (
                <p className="text-gray-400 text-center py-8">Email preview will appear here...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {emails.length === 0 && (
        <div className="text-center py-16">
          <Mail className="h-16 w-16 mx-auto mb-6 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Start Building Your Email Sequence</h3>
          <p className="text-gray-600 mb-6">Create your first email to get started</p>
          <Button onClick={addNewEmail} size="lg" className="gap-2">
            <PlusIcon className="h-5 w-5" />
            Create First Email
          </Button>
        </div>
      )}
    </div>
  );
}