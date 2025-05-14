import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Leaf, CloudRain, Sun, FileText, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import FeatureCard from '@/components/FeatureCard';
import WeatherWidget from '@/components/WeatherWidget';
import VoiceInput from '@/components/VoiceInput';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import networkUtils from '@/services/NetworkUtils';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(networkUtils.isOnline());

  useEffect(() => {
    // Set up network status listeners
    const cleanup = networkUtils.setupNetworkListeners(
      // Online callback
      () => {
        setIsOnline(true);
        toast({
          title: "Online",
          description: "Connected to the internet.",
        });
      },
      // Offline callback
      () => {
        setIsOnline(false);
        toast({
          title: t.offlineMode,
          description: t.noInternet,
          variant: "destructive",
        });
      }
    );

    // Initial network check
    networkUtils.checkInternetConnection().then(online => {
      setIsOnline(online);
      if (!online) {
        toast({
          title: t.offlineMode,
          description: t.offline,
          variant: "destructive",
        });
      }
    });

    return cleanup;
  }, [toast, t]);

  const handleVoiceInput = (transcript: string) => {
    toast({
      title: "Voice Input Received",
      description: transcript,
    });
    
    // Simple keyword matching for navigation
    const lowerTranscript = transcript.toLowerCase();
    if (lowerTranscript.includes('crop') || lowerTranscript.includes('disease') || 
        lowerTranscript.includes('plant') || lowerTranscript.includes('फसल')) {
      navigate('/crop-doctor');
    } else if (lowerTranscript.includes('water') || lowerTranscript.includes('irrigation') || 
               lowerTranscript.includes('rain') || lowerTranscript.includes('सिंचाई')) {
      toast({
        title: "Irrigation Module",
        description: "This feature will be available soon.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-crop-green-dark">{t.appName}</h1>
        <p className="text-xl text-gray-600 mt-2">{t.tagline}</p>
        {!isOnline && (
          <div className="mt-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse-gentle"></span>
            <span className="text-sm">{t.offlineMode}</span>
          </div>
        )}
      </header>

      <section className="mb-8">
        <WeatherWidget />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">{t.appName} {t.features || "Features"}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <FeatureCard
            title={t.cropDoctor}
            description={t.cropDoctorDesc}
            icon={<Leaf className="w-10 h-10" />}
            bgColor="bg-crop-green"
            onClick={() => navigate('/crop-doctor')}
          />
          
          <FeatureCard
            title={t.irrigation}
            description={t.irrigationDesc}
            icon={<CloudRain className="w-10 h-10" />}
            bgColor="bg-crop-water"
            onClick={() => {
              toast({
                title: "Coming Soon",
                description: "The Irrigation Planner will be available in the next update.",
              });
            }}
          />
          
          <FeatureCard
            title={t.solar}
            description={t.solarDesc}
            icon={<Sun className="w-10 h-10" />}
            bgColor="bg-crop-sun"
            onClick={() => {
              toast({
                title: "Coming Soon",
                description: "The Solar Solutions module will be available in the next update.",
              });
            }}
          />
          
          <FeatureCard
            title={t.soil}
            description={t.soilDesc}
            icon={<FileText className="w-10 h-10" />}
            bgColor="bg-crop-earth"
            onClick={() => {
              toast({
                title: "Coming Soon",
                description: "The Soil Testing module will be available in the next update.",
              });
            }}
          />
          
          <FeatureCard
            title={t.schemes}
            description={t.schemesDesc}
            icon={<Info className="w-10 h-10" />}
            bgColor="bg-crop-sky"
            onClick={() => {
              toast({
                title: "Coming Soon",
                description: "The Government Schemes module will be available in the next update.",
              });
            }}
          />
          
          <FeatureCard
            title="Demo Mode"
            description="Try the app with sample data"
            icon={<Grid className="w-10 h-10" />}
            bgColor="bg-gray-600"
            onClick={() => navigate('/demo')}
          />
        </div>
      </section>
      
      <LanguageSelector />
      <VoiceInput onTranscript={handleVoiceInput} />
    </div>
  );
};

export default Dashboard;
