import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import LanguageSelector from "@/components/LanguageSelector";
import FeatureCard from "@/components/FeatureCard";
import WeatherWidget from "@/components/WeatherWidget";
import FarmingChatCard from "@/components/FarmingChatCard";
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from 'react';
import { Sun, CloudRain, Bug, Info } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOfflineStatus = () => {
      setIsOffline(!navigator.onLine);
      toast({
        title: t.offlineMode,
        description: t.offlineDesc,
        variant: "destructive",
      });
    };

    window.addEventListener('offline', handleOfflineStatus);
    window.addEventListener('online', handleOfflineStatus);

    return () => {
      window.removeEventListener('offline', handleOfflineStatus);
      window.removeEventListener('online', handleOfflineStatus);
    };
  }, [t, toast]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-crop-green-dark">{t.appName}</h1>
          <p className="text-lg text-gray-600">{t.tagline}</p>
        </div>
        <LanguageSelector />
      </header>
      
      <WeatherWidget />
      
      <h2 className="text-xl font-semibold mt-8 mb-4">{t.features}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeatureCard 
          title={t.cropDoctor}
          description={t.cropDoctorDesc}
          icon="bug"
          color="green"
          onClick={() => navigate('/crop-doctor')}
        />
        <FeatureCard 
          title={t.irrigation}
          description={t.irrigationDesc}
          icon="cloud-rain"
          color="blue"
          onClick={() => navigate('/irrigation-planner')}
        />
        <FeatureCard 
          title={t.solar}
          description={t.solarDesc}
          icon="sun"
          color="yellow"
          onClick={() => navigate('/solar-solutions')}
        />
        <FeatureCard 
          title={t.welfareSchemes}
          description={t.welfareDesc}
          icon="info"
          color="purple"
          onClick={() => navigate('/welfare-schemes')}
        />
      </div>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">{t.aiAssistant}</h2>
      <FarmingChatCard />
      
    </div>
  );
};

export default Dashboard;
