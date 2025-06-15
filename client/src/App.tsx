import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EnvironmentProvider } from "./contexts/EnvironmentContext";

import Layout from "@/components/Layout";
import PartnerPilot from "@/pages/PartnerPilot";

import DataUploadOptions from "@/pages/DataUpload/DataUploadOptions";
import BrioUploadFlow from "@/pages/DataUpload/BrioUploadFlow";
import DeGoudseUploadWizard from "@/pages/DataUpload/DeGoudseUploadWizard";
import ReportsPage from "@/pages/Reports/ReportsPage";
import PartnersPage from "@/pages/lists/PartnersPage";
import PartnerDetail from "@/pages/lists/PartnerDetail";
import CustomersPage from "@/pages/lists/CustomersPage";
import CustomerDetail from "@/pages/lists/CustomerDetailNew";
import OpportunitiesPage from "@/pages/lists/OpportunitiesPage";
import OpportunityDetail from "@/pages/lists/OpportunityDetail";
import OpportunityDetailBrokerPOV from "@/pages/lists/OpportunityDetailBrokerPOV";
import PartnerDetailBrokerPOV from "@/pages/lists/PartnerDetailBrokerPOV";
import PartnersViewforPartner from "@/pages/PartnersViewforPartner";
import VendorsPage from "@/pages/lists/VendorsPage";
import ProductsPage from "@/pages/lists/ProductsPage";
import ProductDetail from "@/pages/lists/ProductDetail";
import OKRTemplatesPage from "@/pages/templates/OKRMetricsPage";
import GroupDetail from "@/pages/templates/GroupDetail";
import UserManagement from "@/pages/Settings/UserManagement";
import ContactsPage from "@/pages/Settings/ContactsPage";
import DeveloperPage from "@/pages/Settings/DeveloperPage";
import DatabaseAdmin from "@/pages/Settings/DatabaseAdmin";
import NotificationsPage from "@/pages/smart-updates/NotificationsPage";
import SmartUpdatesPage from "@/pages/smart-updates/SmartUpdatesPage";

import NotFound from "@/pages/not-found";
import EnvironmentRouteGuard from "@/components/EnvironmentRouteGuard";
import SharedListView from "@/pages/shared/SharedListView";
import PartnerView from "@/pages/PartnerView";


// Import campaign components
import CampaignsOverview from "@/pages/campaigns/CampaignsOverview";
import CampaignCreator from "@/pages/campaigns/CampaignCreator";
import TemplateEditor from "@/pages/campaigns/TemplateEditor";

// Temporary placeholder components for other list pages
const ProjectsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Projects List (Coming Soon)</h1></div>;

function Router() {
  return (
    <Switch>
      {/* Routes that don't use the main layout */}
      <Route path="/share/list/:shareToken">
        {() => (
          <div>
            <SharedListView />
          </div>
        )}
      </Route>
      
      <Route path="/broker-view/list/:listId" component={PartnerView} />
      <Route path="/broker-view/partners" component={PartnerView} />
      <Route path="/broker-view/opportunities" component={PartnerView} />
      <Route path="/broker-view/campaigns" component={PartnerView} />
      <Route path="/broker-view/opportunity/:opportunityId" component={OpportunityDetailBrokerPOV} />
      <Route path="/broker-view/partner/:partnerId" component={PartnerDetailBrokerPOV} />
      
      {/* All other routes use the main layout */}
      <Route>
        {() => (
          <Layout>
            <Switch>
              <Route path="/" component={PartnerPilot} />
              
              {/* Primary entity routes */}
              <Route path="/partners" component={PartnersPage} />
              <Route path="/lists/partners/:id" component={PartnerDetail} />
              <Route path="/customers" component={CustomersPage} />
              <Route path="/lists/customers/:id" component={CustomerDetail} />
              <Route path="/opportunities" component={OpportunitiesPage} />
              <Route path="/opportunities/:id" component={OpportunityDetail} />
              <Route path="/lists/opportunities/:id" component={OpportunityDetail} />
              <Route path="/vendors" component={VendorsPage} />
              <Route path="/products" component={ProductsPage} />
              <Route path="/lists/products/:id" component={ProductDetail} />
              <Route path="/projects" component={ProjectsPage} />
              <Route path="/contacts" component={ContactsPage} />
              
              {/* Campaigns routes */}
              <Route path="/campaigns" component={CampaignsOverview} />
              <Route path="/campaigns/create" component={CampaignCreator} />
              <Route path="/campaigns/templates/:templateId/edit" component={TemplateEditor} />
              
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
              <Route path="/data-upload/degoudse">
                {() => (
                  <EnvironmentRouteGuard
                    component={DeGoudseUploadWizard} 
                    excludedEnvironments={[]} 
                  />
                )}
              </Route>
              
              {/* Reports section route */}
              <Route path="/reports" component={ReportsPage} />
              
              {/* Templates section routes */}
              <Route path="/templates/okr-metrics" component={OKRTemplatesPage} />
              <Route path="/templates/groups/:id" component={GroupDetail} />
              
              {/* Smart Updates section routes */}
              <Route path="/smart-updates" component={SmartUpdatesPage} />
              <Route path="/smart-updates/notifications" component={NotificationsPage} />
              
              {/* Settings routes */}
              <Route path="/settings/users" component={UserManagement} />
              <Route path="/settings/contacts" component={ContactsPage} />
              <Route path="/settings/developer" component={DeveloperPage} />
              <Route path="/settings/database" component={DatabaseAdmin} />
              
              <Route component={NotFound} />
            </Switch>
          </Layout>
        )}
      </Route>
    </Switch>
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