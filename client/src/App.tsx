import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EnvironmentProvider } from "./contexts/EnvironmentContext";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/components/LoginPage";

import Layout from "@/components/Layout";
import PartnerPilot from "@/pages/PartnerPilot";
import PortfolioInsights from "@/pages/PortfolioInsights";

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
import UploadSettingsPage from "@/pages/DataUpload/UploadSettingsPage";
import UploadProcessPage from "@/pages/DataUpload/UploadProcessPage";
import EntitySelectPage from "@/pages/DataUpload/EntitySelectPage";
import NotificationsPage from "@/pages/smart-updates/NotificationsPage";
import SmartUpdatesPage from "@/pages/smart-updates/SmartUpdatesPage";

import NotFound from "@/pages/not-found";
import EnvironmentRouteGuard from "@/components/EnvironmentRouteGuard";
import SharedListView from "@/pages/shared/SharedListView";
import PartnerView from "@/pages/PartnerView";


// Import campaign components
import CampaignsOverview from "@/pages/campaigns/CampaignsOverview";
import CampaignTemplateCreator from "@/pages/campaigns/CampaignTemplateCreator";
import TemplatesPage from "@/pages/campaigns/TemplatesPage";
import CampaignFromTemplate from "@/pages/campaigns/CampaignFromTemplate";
import NewCampaign from "@/pages/campaigns/NewCampaign";

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
  <Route path="/broker-view/campaigns/edit/:campaignId" component={PartnerView} />
  <Route path="/broker-view/opportunity/:opportunityId" component={OpportunityDetailBrokerPOV} />
  <Route path="/broker-view/partner/:partnerId" component={PartnerDetailBrokerPOV} />

  {/* Main layout routes */}
  <Route>
    {() => (
      <Layout>
        <Switch>
          <Route path="/" component={PartnerPilot} />
          <Route path="/partner-pilot" component={PartnerPilot} />
          <Route path="/partner-pilot/reports" component={PartnerPilot} />
          <Route path="/portfolio-insights" component={PortfolioInsights} />

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

          {/* Campaign routes */}
          <Route path="/campaigns" component={CampaignsOverview} />
          <Route path="/campaigns/new" component={CampaignFromTemplate} />
          <Route path="/campaigns/edit/:campaignId" component={CampaignFromTemplate} />
          <Route path="/campaigns/create-template" component={CampaignTemplateCreator} />
          <Route path="/campaigns/templates" component={TemplatesPage} />
          <Route path="/campaigns/create-from-template/:templateId" component={CampaignFromTemplate} />

          {/* Campaign routes from donald-dev */}
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
          <Route path="/data-upload/degoudse">
            {() => (
              <EnvironmentRouteGuard
                component={DeGoudseUploadWizard}
                excludedEnvironments={[]}
              />
            )}
          </Route>
          <Route path="/data-upload-2/process/:type" component={UploadProcessPage} />
          <Route path="/data-upload-3/process/:type" component={UploadProcessPage} />
          <Route path="/data-upload-3/entities" component={EntitySelectPage} />

          {/* Reports section */}
          <Route path="/reports" component={ReportsPage} />

          {/* Templates section */}
          <Route path="/templates/okr-metrics" component={OKRTemplatesPage} />
          <Route path="/templates/groups/:id" component={GroupDetail} />

          {/* Smart Updates routes */}
          <Route path="/smart-updates" component={SmartUpdatesPage} />
          <Route path="/smart-updates/notifications" component={NotificationsPage} />
          <Route path="/smart-updates/automated" component={SmartUpdatesPage} />

          {/* Settings routes */}
          <Route path="/settings/users" component={UserManagement} />
          <Route path="/settings/contacts" component={ContactsPage} />
          <Route path="/settings/developer" component={DeveloperPage} />
          <Route path="/settings/database" component={DatabaseAdmin} />
          <Route path="/settings/upload" component={UploadSettingsPage} />

          <Route component={NotFound} />
        </Switch>
      </Layout>
    )}
  </Route>
</Switch>

  );
}

function App() {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

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