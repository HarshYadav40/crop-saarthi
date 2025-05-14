
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSun, Thermometer } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

interface WeatherData {
  temp: number;
  humidity: number;
  description: string;
  icon: string;
  location: string;
}

const WeatherWidget: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  
  // Mock weather data for now
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temp: 32,
    humidity: 65,
    description: 'Partly Cloudy',
    icon: '03d',
    location: 'Pune, Maharashtra'
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // In a real implementation, we would fetch from OpenWeatherMap API
  useEffect(() => {
    // Mock API call
    const fetchWeatherData = () => {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        setWeatherData({
          temp: Math.floor(Math.random() * 10) + 28, // Random temp between 28-38°C
          humidity: Math.floor(Math.random() * 30) + 50, // Random humidity between 50-80%
          description: 'Partly Cloudy',
          icon: '03d',
          location: 'Pune, Maharashtra',
        });
        setIsLoading(false);
      }, 1000);
    };
    
    fetchWeatherData();
  }, []);
  
  return (
    <Card className="bg-crop-sky-light">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <CloudSun className="h-6 w-6 text-crop-sky-dark" />
          {t.weatherToday}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin h-8 w-8 border-4 border-crop-sky rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="text-lg font-medium">{weatherData.location}</div>
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-crop-sun-dark" />
              <span className="text-2xl font-bold">{weatherData.temp}°C</span>
            </div>
            <div className="text-gray-600">{t.humidity}: {weatherData.humidity}%</div>
            <div className="mt-2 text-sm bg-white bg-opacity-60 rounded-md p-2">
              <span className="font-medium">
                {t.irrigationAdvice}: {weatherData.humidity > 70 ? t.skipIrrigation : t.waterCrops}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
