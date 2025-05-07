import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import InsuranceNews from "@/pages/InsuranceNews";
import CompareFiles from "@/pages/CompareFiles";
import PredictOpportunities from "@/pages/PredictOpportunities";
import CrossSellCampaigns from "@/pages/CrossSellCampaigns";
import Clients from "@/pages/Clients";
import ClientDetail from "@/pages/ClientDetail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/news" component={InsuranceNews} />
        <Route path="/compare" component={CompareFiles} />
        <Route path="/predict" component={PredictOpportunities} />
        <Route path="/campaigns" component={CrossSellCampaigns} />
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
