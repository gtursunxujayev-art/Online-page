import { Switch, Route, Router } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ContentProvider } from "@/lib/contentContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { useHashLocation } from "@/lib/hashLocation";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ContentProvider>
      <TooltipProvider>
        <Toaster />
        {/* Use Hash Routing to support static deployment */}
        <Router hook={useHashLocation}>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </ContentProvider>
  );
}

export default App;
