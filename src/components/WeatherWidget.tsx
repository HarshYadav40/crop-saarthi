
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSun, Thermometer, CloudRain, Droplet } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import weatherService from '@/services/WeatherService';
import GeoLocation from './GeoLocation';

interface WeatherData {
  temp: number;
  humidity: number;
  description: string;
  icon: string;
  location: string;
  rainfall?: number;
}

interface LocationData {
  lat: number;
  lon: number;
  name?: string;
}

const WeatherWidget: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temp: 0,
    humidity: 0,
    description: '',
    icon: '',
    location: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);

  // Initialize with default location (Pune)
  useEffect(() => {
    const defaultLocation = { lat: 18.52, lon: 73.86, name: 'Pune, India' };
    setCurrentLocation(defaultLocation);
  }, []);

  // Fetch weather data when location changes
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!currentLocation) return;
      
      setIsLoading(true);
      
      try {
        const forecastResponse = await weatherService.getForecast(
          currentLocation.lat,
          currentLocation.lon
        );
        
        if (forecastResponse.success && forecastResponse.forecasts.length > 0) {
          const currentForecast = forecastResponse.forecasts[0];
          
          setWeatherData({
            temp: Math.round(currentForecast.temp),
            humidity: currentForecast.humidity,
            rainfall: currentForecast.rainfall,
            description: currentForecast.description,
            icon: currentForecast.icon,
            location: currentLocation.name || `${currentLocation.lat.toFixed(2)}, ${currentLocation.lon.toFixed(2)}`
          });
        } else {
          // Fallback to mock data
          setWeatherData({
            temp: 32,
            humidity: 65,
            rainfall: 0,
            description: 'Partly Cloudy',
            icon: '03d',
            location: currentLocation.name || 'Pune, Maharashtra'
          });
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
        // Fallback to mock data
        setWeatherData({
          temp: 32,
          humidity: 65,
          rainfall: 0,
          description: 'Partly Cloudy',
          icon: '03d',
          location: currentLocation.name || 'Pune, Maharashtra'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [currentLocation]);

  const handleLocationChange = (location: LocationData) => {
    setCurrentLocation(location);
  };
  
  // Determine irrigation advice based on weather data
  const getIrrigationAdvice = () => {
    if (weatherData.rainfall && weatherData.rainfall > 5) {
      return t.skipIrrigation || "Skip irrigation today due to expected rainfall";
    } else if (weatherData.humidity > 85) {
      return t.reduceWatering || "Consider reducing watering due to high humidity";
    } else if (weatherData.humidity < 40) {
      return t.increaseWatering || "Consider increasing watering due to dry conditions";
    } else {
      return t.normalWatering || "Normal watering recommended";
    }
  };
  
  return (
    <div className="space-y-4">
      <GeoLocation 
        onLocationChange={handleLocationChange}
        currentLocation={currentLocation}
      />
      
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
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-crop-sun-dark" />
                <span className="text-2xl font-bold">{weatherData.temp}°C</span>
              </div>
              <div className="text-gray-600 capitalize">{weatherData.description}</div>
              
              <div className="flex justify-between text-gray-600">
                <div className="flex items-center">
                  <Droplet className="h-4 w-4 mr-1" />
                  {t.humidity || "Humidity"}: {weatherData.humidity}%
                </div>
                
                {weatherData.rainfall !== undefined && (
                  <div className="flex items-center">
                    <CloudRain className="h-4 w-4 mr-1" />
                    {weatherData.rainfall > 0 
                      ? `${weatherData.rainfall.toFixed(1)}mm` 
                      : t.noRain || "No rain"}
                  </div>
                )}
              </div>
              
              {weatherData.icon && (
                <div className="flex items-center">
                  <img 
                    src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                    alt={weatherData.description}
                    className="w-12 h-12 -ml-2 -my-2"
                  />
                </div>
              )}
              <div className="mt-2 text-sm bg-white bg-opacity-60 rounded-md p-2">
                <span className="font-medium">
                  {t.irrigationAdvice || "Irrigation Advice"}: {getIrrigationAdvice()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherWidget;
