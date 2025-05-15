
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSun, Thermometer, MapPin, Search, CloudRain, Droplet } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import weatherService from '@/services/WeatherService';

interface WeatherData {
  temp: number;
  humidity: number;
  description: string;
  icon: string;
  location: string;
  rainfall?: number;
}

interface LocationFormValues {
  locationQuery: string;
}

const WeatherWidget: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const { toast } = useToast();
  
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temp: 0,
    humidity: 0,
    description: '',
    icon: '',
    location: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(null);
  const [showLocationInput, setShowLocationInput] = useState(false);

  const form = useForm<LocationFormValues>({
    defaultValues: {
      locationQuery: ''
    }
  });

  // Get user location
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoordinates({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
            toast({
              title: t.locationDetected,
              description: `${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`,
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            toast({
              title: t.locationError,
              description: error.message,
              variant: "destructive"
            });
            // Fallback to default location (Pune)
            setCoordinates({ lat: 18.52, lon: 73.86 });
          }
        );
      } else {
        toast({
          title: "Geolocation Error",
          description: "Geolocation is not supported by this browser.",
          variant: "destructive"
        });
        // Fallback to default location (Pune)
        setCoordinates({ lat: 18.52, lon: 73.86 });
      }
    };

    getLocation();
  }, [toast, t.locationDetected, t.locationError]);

  // Search location by name
  const searchLocation = async (locationQuery: string) => {
    if (!locationQuery.trim()) return;
    
    setIsLoading(true);
    
    try {
      const apiKey = "5a93f404f3bbd3ddd07d3f3ea27009e6"; // Using the updated API key
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationQuery)}&limit=1&appid=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Location search failed');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = data[0];
        setCoordinates({
          lat: location.lat,
          lon: location.lon
        });
        
        toast({
          title: "Location Changed",
          description: `Changed to ${location.name}, ${location.country}`,
        });
        
        // Hide location input after successful search
        setShowLocationInput(false);
        form.reset();
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      console.error("Error searching location:", error);
      toast({
        title: "Location Error",
        description: "Failed to find location. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fetch weather data when coordinates are available
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!coordinates) return;
      
      setIsLoading(true);
      
      try {
        // First, try to get the forecast data
        const forecastResponse = await weatherService.getForecast(
          coordinates.lat,
          coordinates.lon
        );
        
        if (forecastResponse.success && forecastResponse.forecasts.length > 0) {
          // Use the first day forecast for current weather
          const currentForecast = forecastResponse.forecasts[0];
          
          // Get city name through reverse geocoding
          const apiKey = "5a93f404f3bbd3ddd07d3f3ea27009e6";
          const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${coordinates.lat}&lon=${coordinates.lon}&limit=1&appid=${apiKey}`;
          const geoResponse = await fetch(geoUrl);
          const geoData = await geoResponse.json();
          const locationName = geoData && geoData.length > 0 
            ? `${geoData[0].name}, ${geoData[0].country}`
            : `${coordinates.lat.toFixed(2)}, ${coordinates.lon.toFixed(2)}`;
          
          setWeatherData({
            temp: Math.round(currentForecast.temp),
            humidity: currentForecast.humidity,
            rainfall: currentForecast.rainfall,
            description: currentForecast.description,
            icon: currentForecast.icon,
            location: locationName
          });
        } else {
          throw new Error(forecastResponse.message || 'Failed to fetch weather data');
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
        toast({
          title: "Weather Data Error",
          description: "Failed to fetch weather data. Using default values.",
          variant: "destructive"
        });
        
        // Fallback to mock data if API call fails
        setWeatherData({
          temp: 32,
          humidity: 65,
          rainfall: 0,
          description: 'Partly Cloudy',
          icon: '03d',
          location: 'Pune, Maharashtra'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [coordinates, toast]);

  const onSubmit = (data: LocationFormValues) => {
    searchLocation(data.locationQuery);
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
    <Card className="bg-crop-sky-light">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CloudSun className="h-6 w-6 text-crop-sky-dark" />
            {t.weatherToday}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs p-0 h-8 w-8"
            onClick={() => setShowLocationInput(!showLocationInput)}
          >
            <Search className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showLocationInput && (
          <div className="mb-3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="locationQuery"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          placeholder="Enter city name"
                          autoFocus
                          className="h-8 text-sm" 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  variant="default" 
                  className="h-8 text-xs"
                >
                  Search
                </Button>
              </form>
            </Form>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin h-8 w-8 border-4 border-crop-sky rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 text-lg font-medium">
              <MapPin className="h-4 w-4" />
              {weatherData.location}
            </div>
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
  );
};

export default WeatherWidget;
