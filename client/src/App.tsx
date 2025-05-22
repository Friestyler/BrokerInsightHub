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
import BrioUploadFlow from "@/pages/Campaigns/BrioUploadFlow";
import Clients from "@/pages/Clients";
import ClientDetail from "@/pages/ClientDetail";
import PartnersPage from "@/pages/lists/PartnersPage";
import PartnerDetail from "@/pages/lists/PartnerDetail";
import CustomersPage from "@/pages/lists/CustomersPage";
import OpportunitiesPage from "@/pages/lists/OpportunitiesPage";
import OpportunityDetail from "@/pages/lists/OpportunityDetail";
import VendorsPage from "@/pages/lists/VendorsPage";
import ProductsPage from "@/pages/lists/ProductsPage";
import MetricsPage from "@/pages/templates/MetricsPage";
import GroupDetail from "@/pages/templates/GroupDetail";

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
        
        {/* Lists section routes */}
        <Route path="/lists/partners" component={PartnersPage} />
        <Route path="/lists/partners/:id" component={PartnerDetail} />
        <Route path="/lists/customers" component={CustomersPage} />
        <Route path="/lists/opportunities" component={OpportunitiesPage} />
        <Route path="/lists/opportunities/:id" component={OpportunityDetail} />
        <Route path="/lists/projects" component={ProjectsPage} />
        <Route path="/lists/contacts" component={ContactsPage} />
        <Route path="/lists/vendors" component={VendorsPage} />
        <Route path="/lists/products" component={ProductsPage} />
        
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
        <Route path="/campaigns/upload/brio/step1">
          {() => (
            <EnvironmentRouteGuard
              component={BrioUploadFlow} 
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
        
        {/* Templates section routes */}
        <Route path="/templates/metrics" component={MetricsPage} />
        <Route path="/templates/groups/:id" component={GroupDetail} />
        
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
