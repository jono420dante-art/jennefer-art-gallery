import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import CollectionDetail from "./pages/CollectionDetail";
import ArtworkDetail from "./pages/ArtworkDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Checkout from "./pages/Checkout";
import Showcase from "./pages/Showcase";
import ExitSurvey from "./components/ExitSurvey";
import { NotificationManager } from "./components/NotificationManager";
import { AnalyticsTracker } from "./hooks/useAnalytics";
import { AdminPortalGuard } from "./components/AdminPortalGuard";
import { consumeAdminPortalReturn } from "./lib/adminPortalReturn";
import { useAuth } from "./_core/hooks/useAuth";

const ProtectedAdmin = () => <AdminPortalGuard><Admin /></AdminPortalGuard>;
const ProtectedAdminDashboard = () => <AdminPortalGuard><AdminDashboard /></AdminPortalGuard>;

function AdminPortalReturnRedirect() {
  const [location, setLocation] = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    const destination = consumeAdminPortalReturn();
    if (user.role === "admin" && destination && location !== destination) {
      setLocation(destination);
    }
  }, [loading, location, setLocation, user]);

  return null;
}


function Router() {
  return (
    <>
      <NotificationManager />
      <AnalyticsTracker />
      <AdminPortalReturnRedirect />
      <Navigation />
      <div className="pt-20 min-h-screen">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/gallery/:slug" component={CollectionDetail} />
          <Route path="/artwork/:slug" component={ArtworkDetail} />
          <Route path="/showcase" component={Showcase} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/admin-login" component={AdminLogin} />
          <Route path="/admin" component={ProtectedAdmin} />
          <Route path="/admin-dashboard" component={ProtectedAdminDashboard} />
          <Route path="/checkout/:slug" component={Checkout} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
          <ExitSurvey />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
