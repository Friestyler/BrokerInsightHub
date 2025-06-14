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
  Wand2, Upload
} from "lucide-react";

interface EmailBlock {
  id: string;
  type: 'text' | 'heading' | 'quote' | 'divider' | 'image' | 'button' | 'spacer';
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
  };
}

interface Email {
  id: string;
  subject: string;
  preheader: string;
  blocks: EmailBlock[];
  followUpDays: number;
  leftLogo: string;
  rightLogo: string;
}

interface EnhancedEmailBuilderProps {
  emails: Email[];
  activeEmailIndex: number;
  entityType: string;
  onEmailsChange: (emails: Email[]) => void;
  onActiveEmailChange: (index: number) => void;
}

export default function EnhancedEmailBuilder({ 
  emails, 
  activeEmailIndex, 
  entityType,
  onEmailsChange, 
  onActiveEmailChange 
}: EnhancedEmailBuilderProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
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

  const addBlock = (type: EmailBlock['type']) => {
    const newEmails = [...emails];
    const newBlock: EmailBlock = {
      id: generateBlockId(),
      type,
      content: '',
      properties: {}
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
      followUpDays: 7
    });
    onEmailsChange(newEmails);
    onActiveEmailChange(newEmails.length - 1);
  };

  const contentBlocks = [
    { id: 'highlights', icon: Trophy, title: 'Highlights', description: 'Success stories and achievements' },
    { id: 'lowlights', icon: AlertTriangle, title: 'Lowlights', description: 'Challenges and areas for improvement' },
    { id: 'product-launches', icon: Rocket, title: 'Product launches', description: 'New product announcements' },
    { id: 'kpis', icon: BarChart3, title: 'KPIs', description: 'Key performance indicators' },
    { id: 'fundraising', icon: DollarSign, title: 'Fundraising updates', description: 'Investment and funding news' },
    { id: 'team', icon: UserPlus, title: 'Team', description: 'Team updates and hiring' },
    { id: 'asks', icon: HelpCircle, title: 'Asks', description: 'Requests for help or support' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-medium text-gray-900 mb-2">Email Builder</h2>
        <p className="text-gray-600">Create professional email sequences with AI assistance</p>
      </div>
      
      {/* Email Sequence Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {emails.map((email, index) => (
            <button
              key={email.id}
              onClick={() => onActiveEmailChange(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeEmailIndex === index
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Email {index + 1}
              {email.followUpDays > 0 && (
                <span className="ml-1 text-xs opacity-70">
                  (+{email.followUpDays}d)
                </span>
              )}
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={addNewEmail} className="gap-1">
            <PlusIcon className="h-3 w-3" />
            Add Email
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Wand2 className="h-4 w-4" />
            AI Assistant
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Paperclip className="h-4 w-4" />
            Attachments
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Email Builder */}
        <div className="col-span-8 space-y-6">
          {/* Email Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
              <Input
                placeholder="Enter email subject..."
                value={currentEmail.subject}
                onChange={(e) => {
                  const newEmails = [...emails];
                  newEmails[activeEmailIndex].subject = e.target.value;
                  onEmailsChange(newEmails);
                }}
                className="h-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preheader Text</label>
              <Input
                placeholder="Preview text..."
                value={currentEmail.preheader}
                onChange={(e) => {
                  const newEmails = [...emails];
                  newEmails[activeEmailIndex].preheader = e.target.value;
                  onEmailsChange(newEmails);
                }}
                className="h-10"
              />
            </div>
          </div>

          {/* Content Builder */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Email Content</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Generate Content
                </Button>
              </div>
            </div>

            <div className="border rounded-lg bg-white min-h-[500px] p-6">
              {currentEmail.blocks.map((block, index) => (
                <div
                  key={block.id}
                  className="group relative mb-4 p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
                  draggable
                  onDragStart={() => setDraggedBlock(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedBlock !== null && draggedBlock !== index) {
                      moveBlock(draggedBlock, index);
                      setDraggedBlock(null);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 absolute -left-8 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                  </div>
                  
                  <div className="flex items-center gap-2 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeBlock(index)} className="h-6 w-6 p-0">
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                  
                  {block.type === 'text' && (
                    <Textarea
                      value={block.content}
                      onChange={(e) => updateBlockContent(index, e.target.value)}
                      placeholder="Enter paragraph text... Use {{name}}, {{company}} for dynamic fields"
                      className="border-none p-0 resize-none min-h-[80px] focus:ring-0"
                    />
                  )}
                  {block.type === 'heading' && (
                    <Input
                      value={block.content}
                      onChange={(e) => updateBlockContent(index, e.target.value)}
                      placeholder="Enter heading... Use {{name}} for personalization"
                      className="border-none p-0 text-lg font-semibold focus:ring-0"
                    />
                  )}
                  {block.type === 'quote' && (
                    <div className="border-l-4 border-blue-500 pl-4">
                      <Textarea
                        value={block.content}
                        onChange={(e) => updateBlockContent(index, e.target.value)}
                        placeholder="Enter quote or testimonial..."
                        className="border-none p-0 resize-none min-h-[80px] italic focus:ring-0"
                      />
                    </div>
                  )}
                  {block.type === 'button' && (
                    <div className="space-y-3">
                      <Input
                        value={block.content}
                        onChange={(e) => updateBlockContent(index, e.target.value)}
                        placeholder="Button text..."
                        className="border-none p-0 font-medium focus:ring-0"
                      />
                      <Input
                        value={block.properties?.url || ''}
                        onChange={(e) => updateBlockProperties(index, { url: e.target.value })}
                        placeholder="Button URL..."
                        className="text-sm text-blue-600"
                      />
                    </div>
                  )}
                  {block.type === 'image' && (
                    <div className="space-y-3">
                      <Input
                        value={block.properties?.imageUrl || ''}
                        onChange={(e) => updateBlockProperties(index, { imageUrl: e.target.value })}
                        placeholder="Image URL..."
                        className="border-none p-0 focus:ring-0"
                      />
                      <Input
                        value={block.properties?.imageAlt || ''}
                        onChange={(e) => updateBlockProperties(index, { imageAlt: e.target.value })}
                        placeholder="Alt text..."
                        className="text-sm"
                      />
                    </div>
                  )}
                  {block.type === 'divider' && (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-full h-px bg-gray-300"></div>
                    </div>
                  )}
                  {block.type === 'spacer' && (
                    <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                      <div className="border-2 border-dashed border-gray-200 rounded w-full text-center py-4">
                        Spacer ({block.properties?.spacerHeight || 20}px)
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {currentEmail.blocks.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="mb-4">Start building your email by adding content blocks</p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => addBlock('text')} className="gap-2">
                      <Type className="h-4 w-4" />
                      Text
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock('heading')} className="gap-2">
                      <Heading className="h-4 w-4" />
                      Heading
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Content Block Tools */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-medium text-gray-700">Add Content Block</h4>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" size="sm" onClick={() => addBlock('text')} className="gap-2 justify-start">
                  <Type className="h-4 w-4" />
                  Text
                </Button>
                <Button variant="outline" size="sm" onClick={() => addBlock('heading')} className="gap-2 justify-start">
                  <Heading className="h-4 w-4" />
                  Heading
                </Button>
                <Button variant="outline" size="sm" onClick={() => addBlock('quote')} className="gap-2 justify-start">
                  <Quote className="h-4 w-4" />
                  Quote
                </Button>
                <Button variant="outline" size="sm" onClick={() => addBlock('button')} className="gap-2 justify-start">
                  <Link className="h-4 w-4" />
                  Button
                </Button>
                <Button variant="outline" size="sm" onClick={() => addBlock('image')} className="gap-2 justify-start">
                  <Image className="h-4 w-4" />
                  Image
                </Button>
                <Button variant="outline" size="sm" onClick={() => addBlock('divider')} className="gap-2 justify-start">
                  <Minus className="h-4 w-4" />
                  Divider
                </Button>
                <Button variant="outline" size="sm" onClick={() => addBlock('spacer')} className="gap-2 justify-start">
                  <PlusIcon className="h-4 w-4" />
                  Spacer
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-4 space-y-6">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="space-y-4">
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Email Preview</h3>
                  <div className="flex items-center gap-1">
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      Desktop
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      Mobile
                    </Button>
                  </div>
                </div>
                
                <div className={`border rounded bg-white p-4 ${previewMode === 'mobile' ? 'max-w-xs mx-auto' : ''}`}>
                  <div className="text-sm border-b pb-3 mb-4">
                    <div className="font-semibold">{currentEmail.subject || 'Subject Line'}</div>
                    {currentEmail.preheader && (
                      <div className="text-gray-500 text-xs mt-1">{currentEmail.preheader}</div>
                    )}
                  </div>
                  
                  {currentEmail.blocks.map((block, index) => (
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
                  
                  {currentEmail.blocks.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-8">Email preview will appear here...</p>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3">Dynamic Fields</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-2 py-1 rounded text-xs font-mono">{'{{name}}'}</code>
                    <span className="text-blue-700">Contact name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-2 py-1 rounded text-xs font-mono">{'{{company}}'}</code>
                    <span className="text-blue-700">Company name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-2 py-1 rounded text-xs font-mono">{'{{title}}'}</code>
                    <span className="text-blue-700">Job title</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-2 py-1 rounded text-xs font-mono">{'{{email}}'}</code>
                    <span className="text-blue-700">Email address</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Content Blocks</h3>
                <div className="space-y-2">
                  {contentBlocks.map((block) => {
                    const IconComponent = block.icon;
                    return (
                      <button
                        key={block.id}
                        onClick={() => {
                          const aiContent = generateAIContent(entityType, block.id);
                          addBlock('text');
                          setTimeout(() => {
                            const newEmails = [...emails];
                            const lastBlockIndex = newEmails[activeEmailIndex].blocks.length - 1;
                            if (lastBlockIndex >= 0) {
                              newEmails[activeEmailIndex].blocks[lastBlockIndex].content = aiContent;
                              onEmailsChange(newEmails);
                            }
                          }, 100);
                        }}
                        className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 bg-gray-100 rounded">
                          <IconComponent className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{block.title}</div>
                          <div className="text-xs text-gray-500">{block.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}