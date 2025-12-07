import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ContentProvider } from "@/lib/contentContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AdminPage from "@/pages/admin123456789";
import LoginPage from "@/pages/login";
import { useHashLocation } from "@/lib/hashLocation";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />
      <Route path="/admin123456789" component={AdminPage} />
      {/* 
         Handle anchor links (e.g. #pain-points) which are seen as routes in HashRouter.
         We redirect/render Home for these so the page doesn't 404, 
         and the browser's native behavior handles the scrolling to the ID.
      */}
      <Route path="/:section" component={Home} /> 
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ContentProvider>
        <TooltipProvider>
          <Toaster />
          {/* Use Hash Routing to support static deployment */}
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </TooltipProvider>
      </ContentProvider>
    </QueryClientProvider>
  );
}

export default App;
