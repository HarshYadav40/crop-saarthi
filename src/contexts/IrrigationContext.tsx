
import React, { createContext, useState, useContext, useEffect } from 'react';
import { SoilCondition } from '@/services/IrrigationService';
import { WeatherForecast } from '@/services/WeatherService';
import { useToast } from "@/hooks/use-toast";

interface IrrigationContextType {
  selectedCrop: string;
  setSelectedCrop: (crop: string) => void;
  soilCondition: SoilCondition;
  setSoilCondition: (condition: SoilCondition) => void;
  lastUpdated: Date | null;
  weatherForecasts: WeatherForecast[];
  setWeatherForecasts: (forecasts: WeatherForecast[]) => void;
  refreshData: () => void;
  isLoading: boolean;
}

const IrrigationContext = createContext<IrrigationContextType | undefined>(undefined);

export const IrrigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [selectedCrop, setSelectedCrop] = useState<string>("Wheat");
  const [soilCondition, setSoilCondition] = useState<SoilCondition>("Moist");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [weatherForecasts, setWeatherForecasts] = useState<WeatherForecast[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedCrop = localStorage.getItem('irrigation-selectedCrop');
    const savedSoilCondition = localStorage.getItem('irrigation-soilCondition');
    const savedWeatherForecasts = localStorage.getItem('irrigation-weatherForecasts');
    const savedLastUpdated = localStorage.getItem('irrigation-lastUpdated');
    
    if (savedCrop) {
      setSelectedCrop(savedCrop);
    }
    
    if (savedSoilCondition && ['Dry', 'Moist', 'Wet'].includes(savedSoilCondition)) {
      setSoilCondition(savedSoilCondition as SoilCondition);
    }
    
    if (savedWeatherForecasts) {
      try {
        const parsed = JSON.parse(savedWeatherForecasts);
        // Convert date strings back to Date objects
        const forecasts = parsed.map((f: any) => ({
          ...f,
          date: new Date(f.date)
        }));
        setWeatherForecasts(forecasts);
      } catch (error) {
        console.error("Error parsing saved weather forecasts:", error);
      }
    }
    
    if (savedLastUpdated) {
      setLastUpdated(new Date(savedLastUpdated));
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('irrigation-selectedCrop', selectedCrop);
    localStorage.setItem('irrigation-soilCondition', soilCondition);
    localStorage.setItem('irrigation-weatherForecasts', JSON.stringify(weatherForecasts));
    if (lastUpdated) {
      localStorage.setItem('irrigation-lastUpdated', lastUpdated.toISOString());
    }
  }, [selectedCrop, soilCondition, weatherForecasts, lastUpdated]);

  // Function to refresh data
  const refreshData = () => {
    setLastUpdated(new Date());
    toast({
      title: "Data Refreshed",
      description: "Irrigation data has been updated.",
    });
  };

  const value = {
    selectedCrop,
    setSelectedCrop,
    soilCondition,
    setSoilCondition,
    lastUpdated,
    weatherForecasts,
    setWeatherForecasts,
    refreshData,
    isLoading
  };

  return (
    <IrrigationContext.Provider value={value}>
      {children}
    </IrrigationContext.Provider>
  );
};

export const useIrrigation = (): IrrigationContextType => {
  const context = useContext(IrrigationContext);
  if (context === undefined) {
    throw new Error('useIrrigation must be used within an IrrigationProvider');
  }
  return context;
};
