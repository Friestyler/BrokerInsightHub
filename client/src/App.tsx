import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EnvironmentProvider } from "./contexts/EnvironmentContext";

import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ListViewDemo from "@/pages/ListViewDemo";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/lists/demo" component={ListViewDemo} />
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