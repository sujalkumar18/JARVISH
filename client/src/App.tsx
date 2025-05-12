import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { AIAssistantProvider } from "./context/AIAssistantContext";
import { ThemeProvider } from "./context/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AIAssistantProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AIAssistantProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
