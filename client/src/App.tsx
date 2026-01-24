import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
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
import AdminLogin from "./pages/AdminLogin";
import Checkout from "./pages/Checkout";
import Showcase from "./pages/Showcase";
import ExitSurvey from "./components/ExitSurvey";
import MusicPlayer from "./components/MusicPlayer";
import WorkingOnWidget from "./components/WorkingOnWidget";

function Router() {
  return (
    <>
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
          <Route path="/admin" component={Admin} />
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
          <MusicPlayer />
          <WorkingOnWidget />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
