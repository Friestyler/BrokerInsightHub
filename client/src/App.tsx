import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EnvironmentProvider } from "./contexts/EnvironmentContext";

import Layout from "@/components/Layout";
import PartnerPilot from "@/pages/PartnerPilot";
import Dashboard from "@/pages/Dashboard";
import InsuranceNews from "@/pages/InsuranceNews";
import CompareFiles from "@/pages/CompareFiles";
import PredictOpportunities from "@/pages/PredictOpportunities";
import CampaignsPage from "@/pages/Campaigns/CampaignsPage";
import CampaignBuilder from "@/pages/Campaigns/CampaignBuilder";
import CampaignDetail from "@/pages/Campaigns/CampaignDetail";
import DataUploadOptions from "@/pages/DataUpload/DataUploadOptions";
import BrioUploadFlow from "@/pages/DataUpload/BrioUploadFlow";
import ReportsPage from "@/pages/Reports/ReportsPage";
import Clients from "@/pages/Clients";
import ClientDetail from "@/pages/ClientDetail";
import PartnersPage from "@/pages/lists/PartnersPage";
import PartnerDetail from "@/pages/lists/PartnerDetail";
import CustomersPage from "@/pages/lists/CustomersPage";
import OpportunitiesPage from "@/pages/lists/OpportunitiesPage";
import Opportunities2Page from "@/pages/lists/Opportunities2Page";
import OpportunityDetail from "@/pages/lists/OpportunityDetail";
import VendorsPage from "@/pages/lists/VendorsPage";
import ProductsPage from "@/pages/lists/ProductsPage";
import OKRsPage from "@/pages/OKRsPage";
import MetricsPage from "@/pages/templates/MetricsPage";
import GroupDetail from "@/pages/templates/GroupDetail";
import TagsPage from "@/pages/TagsPage";

import NotFound from "@/pages/not-found";
import EnvironmentRouteGuard from "@/components/EnvironmentRouteGuard";

// Temporary placeholder components for other list pages
const ProjectsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Projects List (Coming Soon)</h1></div>;
const ContactsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Contacts List (Coming Soon)</h1></div>;

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={PartnerPilot} />
        <Route path="/news" component={InsuranceNews} />
        <Route path="/compare" component={CompareFiles} />
        <Route path="/predict" component={PredictOpportunities} />
        
        {/* Primary entity routes */}
        <Route path="/partners" component={PartnersPage} />
        <Route path="/lists/partners/:id" component={PartnerDetail} />
        <Route path="/customers" component={CustomersPage} />
        <Route path="/opportunities2" component={Opportunities2Page} />
        <Route path="/opportunities" component={OpportunitiesPage} />
        <Route path="/opportunities/:id" component={OpportunityDetail} />
        <Route path="/vendors" component={VendorsPage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/projects" component={ProjectsPage} />
        <Route path="/contacts" component={ContactsPage} />
        
        {/* Campaign routes */}
        <Route path="/campaigns">
          {() => (
            <EnvironmentRouteGuard
              component={CampaignsPage} 
              excludedEnvironments={["acme"]} 
            />
          )}
        </Route>
        <Route path="/campaigns/new">
          {() => (
            <EnvironmentRouteGuard
              component={CampaignBuilder} 
              excludedEnvironments={["acme"]} 
            />
          )}
        </Route>

        <Route path="/campaigns/:id">
          {() => (
            <EnvironmentRouteGuard
              component={CampaignDetail} 
              excludedEnvironments={["acme"]} 
            />
          )}
        </Route>
        
        {/* Data Upload routes */}
        <Route path="/data-upload">
          {() => (
            <EnvironmentRouteGuard
              component={DataUploadOptions} 
              excludedEnvironments={[]} 
            />
          )}
        </Route>
        <Route path="/data-upload/brio">
          {() => (
            <EnvironmentRouteGuard
              component={BrioUploadFlow} 
              excludedEnvironments={[]} 
            />
          )}
        </Route>
        
        {/* Reports section route */}
        <Route path="/reports" component={ReportsPage} />
        
        {/* OKRs and Templates section routes */}
        <Route path="/okrs" component={OKRsPage} />
        <Route path="/templates/metrics" component={MetricsPage} />
        <Route path="/templates/groups/:id" component={GroupDetail} />
        <Route path="/tags" component={TagsPage} />
        
        {/* Legacy routes - will be migrated to new structure */}
        <Route path="/clients" component={Clients} />
        <Route path="/clients/:id" component={ClientDetail} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EnvironmentProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </EnvironmentProvider>
    </QueryClientProvider>
  );
}

export default App;
