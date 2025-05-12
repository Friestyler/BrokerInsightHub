import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EnvironmentProvider } from "./contexts/EnvironmentContext";

import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import InsuranceNews from "@/pages/InsuranceNews";
import CompareFiles from "@/pages/CompareFiles";
import PredictOpportunities from "@/pages/PredictOpportunities";
import CrossSellCampaigns from "@/pages/CrossSellCampaigns";
import Clients from "@/pages/Clients";
import ClientDetail from "@/pages/ClientDetail";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import EnvironmentRouteGuard from "@/components/EnvironmentRouteGuard";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/news" component={InsuranceNews} />
        <Route path="/compare" component={CompareFiles} />
        <Route path="/predict" component={PredictOpportunities} />
        {/* Prevent access to Campaigns page in ACME environment */}
        <Route path="/campaigns">
          {() => (
            <EnvironmentRouteGuard
              component={CrossSellCampaigns} 
              excludedEnvironments={["acme"]} 
            />
          )}
        </Route>
        <Route path="/clients" component={Clients} />
        <Route path="/clients/:id" component={ClientDetail} />
        <Route path="/settings" component={Settings} />
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
