
import React from 'react';
import { Cloud, Droplets, Leaf, SunDim, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import FeatureCard from '@/components/FeatureCard';
import WeatherWidget from '@/components/WeatherWidget';
import FarmingChatCard from '@/components/FarmingChatCard';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-crop-green-dark">
        {t.welcomeToCropSaarthi}
      </h1>
      <p className="text-lg mb-8 text-gray-600">
        {t.dashboardTagline}
      </p>
      
      <div className={`${isMobile ? 'mb-8' : 'float-right w-1/3 ml-8 mb-8'}`}>
        <WeatherWidget />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <FeatureCard
          title={t.cropDoctor}
          description={t.cropDoctorDesc}
          icon={<Leaf className="h-8 w-8 text-crop-green-dark" />}
          bgColor="bg-crop-green-light"
          onClick={() => navigate('/crop-doctor')}
        />
        
        <FeatureCard
          title={t.irrigationPlanner}
          description={t.irrigationDesc}
          icon={<Droplets className="h-8 w-8 text-crop-blue-dark" />}
          bgColor="bg-crop-blue-light"
          onClick={() => navigate('/irrigation-planner')}
        />
        
        <FeatureCard
          title={t.solarSolutions}
          description={t.solarDesc}
          icon={<SunDim className="h-8 w-8 text-crop-yellow-dark" />}
          bgColor="bg-crop-yellow-light"
          onClick={() => navigate('/solar-solutions')}
        />
        
        <FeatureCard
          title={t.welfareSchemes}
          description={t.welfareDesc}
          icon={<FileSpreadsheet className="h-8 w-8 text-crop-purple-dark" />}
          bgColor="bg-crop-purple-light"
          onClick={() => navigate('/welfare-schemes')}
        />
      </div>
      
      <div className="mb-8">
        <FarmingChatCard />
      </div>
      
      <div className="bg-crop-green-light/30 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-bold mb-2 text-crop-green-dark">{t.quickTips}</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>{t.tipWeather}</li>
          <li>{t.tipCropHealth}</li>
          <li>{t.tipWaterConservation}</li>
          <li>{t.tipMarketPrices}</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
