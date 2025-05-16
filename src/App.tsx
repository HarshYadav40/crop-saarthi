
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { IrrigationProvider } from "@/contexts/IrrigationContext";

import Dashboard from "./pages/Dashboard";
import CropDoctor from "./pages/CropDoctor";
import IrrigationPlanner from "./pages/IrrigationPlanner";
import SolarSolutions from "./pages/SolarSolutions";
import Demo from "./pages/Demo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <IrrigationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/crop-doctor" element={<CropDoctor />} />
              <Route path="/irrigation-planner" element={<IrrigationPlanner />} />
              <Route path="/solar-solutions" element={<SolarSolutions />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </IrrigationProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
