import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Type, Image, Quote, Minus, Link, FileText, X, 
  GripVertical, Copy, Trash2, Plus as PlusIcon, 
  Lightbulb, Rocket, Heading2 as Heading, ChevronDown,
  ChevronUp, Mail, Sparkles, BarChart3, AlertTriangle, 
  UserPlus, HelpCircle, Trophy, DollarSign, Paperclip,
  Upload, Edit3, Eye
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

interface Email {
  id: string;
  subject: string;
  blocks: EmailBlock[];
  followUpDays: number;
  leftLogo: File | null;
  rightLogo: File | null;
}

interface CleanEmailBuilderProps {
  emails: Email[];
  activeEmailIndex: number;
  entityType: string;
  onEmailsChange: (emails: Email[]) => void;
  onActiveEmailChange: (index: number) => void;
}

export default function CleanEmailBuilder({ 
  emails, 
  activeEmailIndex, 
  entityType,
  onEmailsChange, 
  onActiveEmailChange 
}: CleanEmailBuilderProps) {
  const [expandedEmailIndex, setExpandedEmailIndex] = useState(-1); // Start collapsed
  const [draggedBlock, setDraggedBlock] = useState<number | null>(null);
  
  const currentEmail = emails[activeEmailIndex];

  const generateBlockId = () => Math.random().toString(36).substr(2, 9);

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

  const updateEmailField = (field: keyof Email, value: string | number) => {
    const newEmails = [...emails];
    (newEmails[activeEmailIndex] as any)[field] = value;
    onEmailsChange(newEmails);
  };

  const updateBlockContent = (blockIndex: number, content: string) => {
    const newEmails = [...emails];
    if (newEmails[activeEmailIndex].blocks[blockIndex]) {
      newEmails[activeEmailIndex].blocks[blockIndex].content = content;
      onEmailsChange(newEmails);
    }
  };

  const updateBlockProperties = (blockIndex: number, properties: EmailBlock['properties']) => {
    const newEmails = [...emails];
    if (newEmails[activeEmailIndex].blocks[blockIndex]) {
      newEmails[activeEmailIndex].blocks[blockIndex].properties = {
        ...newEmails[activeEmailIndex].blocks[blockIndex].properties,
        ...properties
      };
      onEmailsChange(newEmails);
    }
  };

  const addBlock = (type: EmailBlock['type'], aiType?: string) => {
    const newEmails = [...emails];
    const newBlock: EmailBlock = {
      id: generateBlockId(),
      type,
      content: type === 'ai' && aiType ? generateAIContent(entityType, aiType) : '',
      properties: aiType ? { aiType } : {}
    };
    newEmails[activeEmailIndex].blocks.push(newBlock);
    onEmailsChange(newEmails);
  };

  const removeBlock = (blockIndex: number) => {
    const newEmails = [...emails];
    newEmails[activeEmailIndex].blocks.splice(blockIndex, 1);
    onEmailsChange(newEmails);
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newEmails = [...emails];
    const blocks = newEmails[activeEmailIndex].blocks;
    const [removed] = blocks.splice(fromIndex, 1);
    blocks.splice(toIndex, 0, removed);
    onEmailsChange(newEmails);
  };

  const addNewEmail = () => {
    const newEmails = [...emails];
    newEmails.push({
      id: (newEmails.length + 1).toString(),
      subject: '',
      preheader: '',
      blocks: [],
      followUpDays: 7,
      leftLogo: '',
      rightLogo: ''
    });
    onEmailsChange(newEmails);
    onActiveEmailChange(newEmails.length - 1);
    setExpandedEmailIndex(newEmails.length - 1);
  };

  const saveEmail = (emailIndex: number) => {
    setExpandedEmailIndex(-1);
    if (emailIndex === 0 && emails.length === 1) {
      // Show suggestion for second email
      setTimeout(() => {
        const shouldAddSecond = window.confirm("Great! Your first email is saved. Would you like to add a follow-up email?");
        if (shouldAddSecond) {
          addNewEmail();
        }
      }, 500);
    }
  };

  const contentBlocks = [
    { id: 'text', icon: Type, title: 'Text', description: 'Add paragraph text' },
    { id: 'heading', icon: Heading, title: 'Heading', description: 'Add section heading' },
    { id: 'quote', icon: Quote, title: 'Quote', description: 'Add testimonial or quote' },
    { id: 'button', icon: Link, title: 'Button', description: 'Add call-to-action button' },
    { id: 'image', icon: Image, title: 'Image', description: 'Add image or graphic' },
    { id: 'divider', icon: Minus, title: 'Divider', description: 'Add visual separator' },
    { id: 'spacer', icon: PlusIcon, title: 'Spacer', description: 'Add white space' }
  ];

  const aiContentBlocks = [
    { id: 'highlights', icon: Trophy, title: 'Highlights', description: 'Success stories and achievements' },
    { id: 'lowlights', icon: AlertTriangle, title: 'Lowlights', description: 'Challenges and areas for improvement' },
    { id: 'product-launches', icon: Rocket, title: 'Product launches', description: 'New product announcements' },
    { id: 'kpis', icon: BarChart3, title: 'KPIs', description: 'Key performance indicators' },
    { id: 'fundraising', icon: DollarSign, title: 'Fundraising updates', description: 'Investment and funding news' },
    { id: 'team', icon: UserPlus, title: 'Team', description: 'Team updates and hiring' },
    { id: 'asks', icon: HelpCircle, title: 'Asks', description: 'Requests for help or support' }
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-medium text-gray-900 mb-2">Email Builder</h2>
        <p className="text-gray-600">Create your email sequence step by step</p>
      </div>

      <div className="space-y-4">
        {emails.map((email, index) => (
          <div key={email.id} className="border rounded-lg bg-white">
            {/* Collapsed Email Header */}
            {expandedEmailIndex !== index && (
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50" 
                   onClick={() => setExpandedEmailIndex(index)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Email {index + 1}
                      {email.followUpDays > 0 && (
                        <span className="ml-2 text-sm text-gray-500">
                          (+{email.followUpDays} days)
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {email.subject || 'No subject set'} • {email.blocks.length} blocks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}

            {/* Expanded Email Builder */}
            {expandedEmailIndex === index && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Email {index + 1}
                    {email.followUpDays > 0 && (
                      <span className="ml-2 text-sm text-gray-500">
                        (+{email.followUpDays} days)
                      </span>
                    )}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setExpandedEmailIndex(-1)}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Main Email Content */}
                  <div className="col-span-2 space-y-6">
                    {/* Email Settings */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                          <Input
                            placeholder="Enter email subject..."
                            value={email.subject}
                            onChange={(e) => updateEmailField('subject', e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Preheader Text</label>
                          <Input
                            placeholder="Preview text..."
                            value={email.preheader}
                            onChange={(e) => updateEmailField('preheader', e.target.value)}
                            className="h-10"
                          />
                        </div>
                      </div>

                      {/* Logo Settings */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Left Logo URL</label>
                          <Input
                            placeholder="https://..."
                            value={email.leftLogo}
                            onChange={(e) => updateEmailField('leftLogo', e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Right Logo URL</label>
                          <Input
                            placeholder="https://..."
                            value={email.rightLogo}
                            onChange={(e) => updateEmailField('rightLogo', e.target.value)}
                            className="h-10"
                          />
                        </div>
                      </div>

                      {index > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Days</label>
                          <Input
                            type="number"
                            placeholder="7"
                            value={email.followUpDays}
                            onChange={(e) => updateEmailField('followUpDays', parseInt(e.target.value) || 0)}
                            className="h-10 w-32"
                          />
                        </div>
                      )}
                    </div>

                    {/* Content Builder */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Email Content</h4>
                      <div className="border rounded-lg bg-gray-50 min-h-[300px] p-4">
                        {email.blocks.map((block, blockIndex) => (
                          <div
                            key={block.id}
                            className="group relative mb-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                            draggable
                            onDragStart={() => setDraggedBlock(blockIndex)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (draggedBlock !== null && draggedBlock !== blockIndex) {
                                moveBlock(draggedBlock, blockIndex);
                                setDraggedBlock(null);
                              }
                            }}
                          >
                            <div className="flex items-center gap-2 absolute -left-6 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
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
                                className="border-none p-0 resize-none min-h-[60px] focus:ring-0 bg-transparent"
                              />
                            )}
                            {block.type === 'heading' && (
                              <Input
                                value={block.content}
                                onChange={(e) => updateBlockContent(blockIndex, e.target.value)}
                                placeholder="Enter heading... Use {{name}} for personalization"
                                className="border-none p-0 text-lg font-semibold focus:ring-0 bg-transparent"
                              />
                            )}
                            {block.type === 'quote' && (
                              <div className="border-l-4 border-blue-500 pl-4">
                                <Textarea
                                  value={block.content}
                                  onChange={(e) => updateBlockContent(blockIndex, e.target.value)}
                                  placeholder="Enter quote or testimonial..."
                                  className="border-none p-0 resize-none min-h-[60px] italic focus:ring-0 bg-transparent"
                                />
                              </div>
                            )}
                            {block.type === 'ai' && (
                              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="h-4 w-4 text-purple-600" />
                                  <span className="text-sm font-medium text-purple-700">
                                    AI Content: {block.properties?.aiType}
                                  </span>
                                </div>
                                <Textarea
                                  value={block.content}
                                  onChange={(e) => updateBlockContent(blockIndex, e.target.value)}
                                  placeholder="AI-generated content will appear here..."
                                  className="border-none p-0 resize-none min-h-[80px] focus:ring-0 bg-transparent"
                                />
                              </div>
                            )}
                            {block.type === 'button' && (
                              <div className="space-y-2">
                                <Input
                                  value={block.content}
                                  onChange={(e) => updateBlockContent(blockIndex, e.target.value)}
                                  placeholder="Button text..."
                                  className="border-none p-0 font-medium focus:ring-0 bg-transparent"
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
                              <div className="space-y-2">
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
                              <div className="flex items-center justify-center py-2">
                                <div className="w-full h-px bg-gray-300"></div>
                              </div>
                            )}
                            {block.type === 'spacer' && (
                              <div className="flex items-center justify-center py-4 text-gray-400 text-sm">
                                <div className="border-2 border-dashed border-gray-200 rounded w-full text-center py-2">
                                  Spacer ({block.properties?.spacerHeight || 20}px)
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {email.blocks.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                            <p className="mb-3">Add content blocks to build your email</p>
                            <Button variant="outline" size="sm" onClick={() => addBlock('text')} className="gap-2">
                              <Type className="h-4 w-4" />
                              Add Text Block
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button onClick={() => saveEmail(index)} className="gap-2">
                        Save Email {index + 1}
                      </Button>
                      {index === emails.length - 1 && (
                        <Button variant="outline" onClick={addNewEmail} className="gap-2">
                          <PlusIcon className="h-4 w-4" />
                          Add Follow-up Email
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Content Blocks */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Content Blocks</h4>
                      <div className="space-y-2">
                        {contentBlocks.map((block) => {
                          const IconComponent = block.icon;
                          return (
                            <button
                              key={block.id}
                              onClick={() => addBlock(block.id as EmailBlock['type'])}
                              className="w-full flex items-center gap-2 p-2 text-left border border-gray-200 rounded hover:border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                              <IconComponent className="h-4 w-4 text-gray-600" />
                              <div className="flex-1">
                                <div className="text-sm font-medium">{block.title}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Content Blocks */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
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
                              className="w-full flex items-center gap-2 p-2 text-left border border-purple-200 rounded hover:border-purple-300 hover:bg-purple-50 transition-colors"
                            >
                              <IconComponent className="h-4 w-4 text-purple-600" />
                              <div className="flex-1">
                                <div className="text-sm font-medium">{block.title}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dynamic Fields */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Dynamic Fields</h4>
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

                {/* Preview Section */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Email Preview</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="bg-white rounded border p-4 max-w-2xl">
                      {/* Logo Header */}
                      {(email.leftLogo || email.rightLogo) && (
                        <div className="flex items-center justify-between mb-4 pb-3 border-b">
                          {email.leftLogo && (
                            <div className="h-8 w-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                              Left Logo
                            </div>
                          )}
                          {email.rightLogo && (
                            <div className="h-8 w-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                              Right Logo
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Email Header */}
                      <div className="text-sm border-b pb-3 mb-4">
                        <div className="font-semibold">{email.subject || 'Subject Line'}</div>
                        {email.preheader && (
                          <div className="text-gray-500 text-xs mt-1">{email.preheader}</div>
                        )}
                      </div>
                      
                      {/* Email Content */}
                      {email.blocks.map((block, index) => (
                        <div key={block.id} className="mb-3">
                          {block.type === 'text' && (
                            <p className="text-sm leading-relaxed">{block.content || 'Paragraph text...'}</p>
                          )}
                          {block.type === 'heading' && (
                            <h3 className="font-semibold text-lg mb-2">{block.content || 'Heading...'}</h3>
                          )}
                          {block.type === 'quote' && (
                            <blockquote className="border-l-2 border-blue-500 pl-3 italic text-sm text-gray-600">
                              {block.content || 'Quote...'}
                            </blockquote>
                          )}
                          {block.type === 'ai' && (
                            <div className="bg-purple-50 border border-purple-200 rounded p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-3 w-3 text-purple-600" />
                                <span className="text-xs font-medium text-purple-700">
                                  {block.properties?.aiType}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed">{block.content || 'AI content...'}</p>
                            </div>
                          )}
                          {block.type === 'button' && (
                            <div className="text-center">
                              <button className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium">
                                {block.content || 'Button Text'}
                              </button>
                            </div>
                          )}
                          {block.type === 'image' && block.properties?.imageUrl && (
                            <div className="text-center">
                              <div className="bg-gray-100 rounded h-32 flex items-center justify-center text-gray-500 text-sm">
                                Image: {block.properties.imageAlt || 'No alt text'}
                              </div>
                            </div>
                          )}
                          {block.type === 'divider' && <hr className="my-4" />}
                          {block.type === 'spacer' && (
                            <div style={{ height: block.properties?.spacerHeight || 20 }}></div>
                          )}
                        </div>
                      ))}
                      
                      {email.blocks.length === 0 && (
                        <p className="text-gray-400 text-sm text-center py-8">Email preview will appear here...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add First Email Button */}
        {emails.length === 0 && (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Email Sequence</h3>
            <p className="text-gray-600 mb-4">Create your first email to get started</p>
            <Button onClick={addNewEmail} className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Create First Email
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}