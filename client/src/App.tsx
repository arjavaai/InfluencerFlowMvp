import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import BrandDashboard from "@/pages/brand-dashboard";
import CreatorDashboard from "@/pages/creator-dashboard";
import NotFound from "@/pages/not-found";
import { RoleSelection } from "@/components/role-selection";

function Router() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });
  
  const isAuthenticated = !!user;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/auth" component={AuthPage} />
          <Route path="/" component={Landing} />
        </>
      ) : !user?.role || user?.role === null ? (
        <Route path="/" component={RoleSelection} />
      ) : (
        <>
          {user.role === 'brand' ? (
            <Route path="/" component={BrandDashboard} />
          ) : (
            <Route path="/" component={CreatorDashboard} />
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
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
