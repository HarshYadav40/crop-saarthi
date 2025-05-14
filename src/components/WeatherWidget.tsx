
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSun, Thermometer, MapPin, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface WeatherData {
  temp: number;
  humidity: number;
  description: string;
  icon: string;
  location: string;
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
      const apiKey = "4c05ae6d4060ded9b0a5c998dc1dd2fd";
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
        // Using OpenWeatherMap API
        // Note: In a production app, you should use environment variables for API keys
        const apiKey = "4c05ae6d4060ded9b0a5c998dc1dd2fd"; // Free tier API key (limited usage)
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Weather data fetch failed');
        }
        
        const data = await response.json();
        
        setWeatherData({
          temp: Math.round(data.main.temp),
          humidity: data.main.humidity,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          location: `${data.name}, ${data.sys.country}`
        });
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
            <div className="text-gray-600">{t.humidity}: {weatherData.humidity}%</div>
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
