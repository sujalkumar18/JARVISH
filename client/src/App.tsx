import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { AuthForm } from "@/components/AuthForm";
import { AIAssistantProvider } from "./context/AIAssistantContext";
import { ThemeProvider } from "./context/ThemeContext";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

function Router({ user }: { user: User | null }) {
  if (!user) {
    return <AuthForm onAuth={() => window.location.reload()} />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // User not authenticated
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAuth = (userData: User) => {
    setUser(userData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AIAssistantProvider>
          <TooltipProvider>
            <Toaster />
            {user ? (
              <Router user={user} />
            ) : (
              <AuthForm onAuth={handleAuth} />
            )}
          </TooltipProvider>
        </AIAssistantProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
