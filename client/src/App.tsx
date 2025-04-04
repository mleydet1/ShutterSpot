import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import ClientsPage from "@/pages/clients/index";
import ClientDetailPage from "@/pages/clients/[id]";
import ShootsPage from "@/pages/shoots/index";
import ShootDetailPage from "@/pages/shoots/[id]";
import ProposalsPage from "@/pages/proposals/index";
import SchedulingPage from "@/pages/scheduling/index";
import InvoicesPage from "@/pages/invoices/index";
import GalleriesPage from "@/pages/galleries/index";
import EmailMarketingPage from "@/pages/email-marketing/index";
import WorkflowsPage from "@/pages/workflows/index";
import ReportsPage from "@/pages/reports/index";
import CalendarSettingsPage from "@/pages/calendar/settings";
import GoogleCalendarCallback from "@/pages/calendar/google-callback";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/clients" component={ClientsPage} />
      <Route path="/clients/:id" component={ClientDetailPage} />
      <Route path="/shoots" component={ShootsPage} />
      <Route path="/shoots/:id" component={ShootDetailPage} />
      <Route path="/proposals" component={ProposalsPage} />
      <Route path="/scheduling" component={SchedulingPage} />
      <Route path="/invoices" component={InvoicesPage} />
      <Route path="/galleries" component={GalleriesPage} />
      <Route path="/email-marketing" component={EmailMarketingPage} />
      <Route path="/workflows" component={WorkflowsPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route path="/calendar/settings" component={CalendarSettingsPage} />
      <Route path="/calendar/google/callback" component={GoogleCalendarCallback} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
