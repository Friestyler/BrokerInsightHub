// Types for the UI components

export type ToolCardProps = {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  isSelected: boolean;
};

export type NewsItemType = {
  id: number;
  title: string;
  content: string;
  summary: string;
  source: string;
  imageUrl: string;
  publishedDate: string;
  category: string;
};

export type ClientType = {
  id: number;
  fullName: string;
  type: string;
  products: string[];
};

export type OpportunityType = {
  id: number;
  clientId: number;
  opportunityType: string;
  probability: number;
  potentialValue: string;
  client?: ClientType;
};

export type ActiveTool = 'news' | 'compare' | 'predict';

export type Metric = {
  icon: string;
  label: string;
  value: string;
  change: string;
  bgColor: string;
  iconBgColor: string;
  iconTextColor: string;
  changeColor: string;
};
