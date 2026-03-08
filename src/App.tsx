import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/contexts/I18nContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import AppShell from "./pages/AppShell";
import NotFound from "./pages/NotFound";
import InstallScreen from "./pages/app/InstallScreen";

// Deep link: /property/:id → /app/property/:id
const PropertyRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/app/property/${id}`} replace />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/app/*" element={<AppShell />} />
                <Route path="/install" element={<AppShell />} />
                <Route path="/property/:id" element={<PropertyRedirect />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
