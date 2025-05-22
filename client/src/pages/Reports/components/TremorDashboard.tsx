import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AreaChart, 
  BarChart,
  Card as TremorCard,
  Title,
  Text,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Grid,
  DonutChart,
  Legend,
  Flex,
  Metric,
  CategoryBar,
  ProgressBar
} from "@tremor/react";

// Sample data
const opportunityByPartnerData = [
  {
    partner: "Jeroen Hypotheek Advies",
    "Closed Won": 28000,
    "In Progress": 250000,
    "Discovery": 35000,
    "Negotiation": 42000,
  },
  {
    partner: "ABC Insurance Brokers",
    "Closed Won": 0,
    "In Progress": 125000,
    "Discovery": 0,
    "Negotiation": 0,
  },
  {
    partner: "Insurance Experts",
    "Closed Won": 95000,
    "In Progress": 0,
    "Discovery": 0,
    "Negotiation": 110000,
  },
  {
    partner: "Global Assurance",
    "Closed Won": 0,
    "In Progress": 0,
    "Discovery": 150000,
    "Negotiation": 200000,
  },
  {
    partner: "Regional Brokers",
    "Closed Won": 0,
    "In Progress": 65000,
    "Discovery": 0,
    "Negotiation": 0,
  },
  {
    partner: "Elite Insurance",
    "Closed Won": 250000,
    "In Progress": 0,
    "Discovery": 0,
    "Negotiation": 180000,
  },
];

// Sample regional data
const regionalData = [
  { region: "North", value: 375000 },
  { region: "South", value: 217000 },
  { region: "East", value: 358000 },
  { region: "West", value: 380000 },
  { region: "Central", value: 400000 },
];

// Sample product performance
const productPerformanceData = [
  { product: "Mortgage", value: 250000 },
  { product: "Life Insurance", value: 28000 },
  { product: "Property Insurance", value: 125000 },
  { product: "Cyber Security", value: 75000 },
  { product: "Verduurzamingslening", value: 35000 },
  { product: "Workers Compensation", value: 80000 },
  { product: "Liability Insurance", value: 95000 },
  { product: "Risk Management", value: 110000 },
  { product: "Business Interruption", value: 150000 },
  { product: "Equipment Coverage", value: 200000 },
  { product: "Professional Liability", value: 65000 },
  { product: "Commercial Property", value: 250000 },
  { product: "Fleet Insurance", value: 180000 },
  { product: "Cross-sell", value: 42000 },
];

// Sample funnel data
const funnelData = [
  { stage: "Qualification", value: 215000, percentage: 15 },
  { stage: "Discovery", value: 185000, percentage: 13 },
  { stage: "Proposal", value: 580000, percentage: 40 },
  { stage: "Negotiation", value: 332000, percentage: 23 },
  { stage: "Closed Won", value: 373000, percentage: 26 },
];

// Color palette
const customColors = ["indigo", "blue", "cyan", "emerald", "violet", "fuchsia"];

export default function TremorDashboard() {
  const [timeFrame, setTimeFrame] = useState("ytd");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <TabGroup>
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Performance</Tab>
            <Tab>Products</Tab>
          </TabList>
        </TabGroup>
      
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select time frame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mtd">Month to Date</SelectItem>
            <SelectItem value="qtd">Quarter to Date</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Key metrics */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <TremorCard className="space-y-2">
          <Text>Opportunity Value</Text>
          <Metric>€1,730,000</Metric>
          <CategoryBar
            values={[40, 30, 20, 10]}
            colors={["emerald", "yellow", "orange", "rose"]}
            markerValue={65}
            className="mt-3"
          />
          <Text className="text-right text-xs text-gray-500">+25% from last year</Text>
        </TremorCard>
        
        <TremorCard className="space-y-2">
          <Text>Win Rate</Text>
          <Metric>26%</Metric>
          <ProgressBar value={26} color="blue" className="mt-3" />
          <Text className="text-right text-xs text-gray-500">+5 percentage points</Text>
        </TremorCard>
        
        <TremorCard className="space-y-2">
          <Text>Average Deal Size</Text>
          <Metric>€115,333</Metric>
          <CategoryBar
            values={[20, 25, 35, 20]}
            colors={["slate", "indigo", "cyan", "amber"]}
            className="mt-3"
          />
          <Text className="text-right text-xs text-gray-500">+15% from previous quarter</Text>
        </TremorCard>
        
        <TremorCard className="space-y-2">
          <Text>Deals in Pipeline</Text>
          <Metric>15</Metric>
          <ProgressBar value={70} color="indigo" className="mt-3" />
          <Text className="text-right text-xs text-gray-500">70% of yearly target</Text>
        </TremorCard>
      </Grid>
      
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <TremorCard>
          <Title>Opportunity by Partner</Title>
          <BarChart
            className="mt-4 h-72"
            data={opportunityByPartnerData}
            index="partner"
            categories={["Closed Won", "In Progress", "Discovery", "Negotiation"]}
            colors={["emerald", "blue", "amber", "indigo"]}
            valueFormatter={(number) => `€${Intl.NumberFormat("en").format(number).toString()}`}
            stack={true}
          />
        </TremorCard>
        
        <TremorCard>
          <Title>Regional Distribution</Title>
          <DonutChart
            className="mt-4 h-72"
            data={regionalData}
            category="value"
            index="region"
            valueFormatter={(number) => `€${Intl.NumberFormat("en").format(number).toString()}`}
            colors={customColors}
          />
        </TremorCard>
      </Grid>
      
      <TremorCard>
        <Title>Sales Pipeline</Title>
        <Flex className="mt-4">
          <Text>Stage</Text>
          <Text>Opportunity Value</Text>
        </Flex>
        {funnelData.map((item) => (
          <div key={item.stage} className="space-y-2 mt-3">
            <Flex>
              <Text>{item.stage}</Text>
              <Text>€{Intl.NumberFormat("en").format(item.value)}</Text>
            </Flex>
            <ProgressBar value={item.percentage} color="indigo" tooltip={`${item.percentage}%`} />
          </div>
        ))}
      </TremorCard>
      
      <TremorCard>
        <Title>Product Performance</Title>
        <AreaChart
          className="mt-4 h-72"
          data={productPerformanceData.sort((a, b) => b.value - a.value).slice(0, 7)}
          index="product"
          categories={["value"]}
          colors={["indigo"]}
          valueFormatter={(number) => `€${Intl.NumberFormat("en").format(number).toString()}`}
        />
      </TremorCard>
    </div>
  );
}