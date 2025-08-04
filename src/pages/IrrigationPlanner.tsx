
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CloudRain, Droplet, DropletIcon, RefreshCw, AlertTriangle, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIrrigation } from '@/contexts/IrrigationContext';
import weatherService from '@/services/WeatherService';
import irrigationService, { SoilCondition } from '@/services/IrrigationService';
import ForecastCard from '@/components/ForecastCard';
import GeoLocation from '@/components/GeoLocation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import networkUtils from '@/services/NetworkUtils';

interface LocationData {
  lat: number;
  lon: number;
  name?: string;
}

const IrrigationPlanner: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    selectedCrop,
    setSelectedCrop,
    soilCondition,
    setSoilCondition,
    weatherForecasts,
    setWeatherForecasts,
    refreshData,
  } = useIrrigation();

  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [recommendation, setRecommendation] = useState<{
    message: string;
    needsIrrigation: boolean;
    urgencyLevel: string;
  } | null>(null);
  const [isOnline, setIsOnline] = useState(networkUtils.isOnline());

  // Initialize with default location and auto-detect user location
  useEffect(() => {
    const defaultLocation = { lat: 28.61, lon: 77.23, name: 'Delhi, India' };
    
    // Try to get user's current location automatically
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            name: 'Current Location'
          });
        },
        (error) => {
          console.log("Geolocation failed, using default location:", error.message);
          setCurrentLocation(defaultLocation);
        }
      );
    } else {
      setCurrentLocation(defaultLocation);
    }
    
    // Set up network status listeners
    const cleanup = networkUtils.setupNetworkListeners(
      () => setIsOnline(true),
      () => setIsOnline(false)
    );

    return cleanup;
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
        
        if (forecastResponse.success) {
          setWeatherForecasts(forecastResponse.forecasts);
        } else {
          throw new Error(forecastResponse.message || "Failed to fetch weather data");
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [currentLocation, setWeatherForecasts]);

  // Calculate irrigation recommendation when data changes
  useEffect(() => {
    if (weatherForecasts.length > 0) {
      const cropRecommendation = irrigationService.calculateRecommendation(
        selectedCrop,
        soilCondition,
        weatherForecasts.map(f => ({ date: f.date, rainfall: f.rainfall }))
      );
      
      setRecommendation(cropRecommendation);
    }
  }, [selectedCrop, soilCondition, weatherForecasts]);

  const handleLocationChange = (location: LocationData) => {
    setCurrentLocation(location);
  };

  // Handler for refreshing data
  const handleRefresh = () => {
    if (currentLocation) {
      const fetchFreshData = async () => {
        setIsLoading(true);
        try {
          if (!isOnline) {
            toast({
              title: "Offline Mode",
              description: "Cannot refresh data while offline. Using cached data.",
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }
          
          const forecastResponse = await weatherService.getForecast(
            currentLocation.lat, 
            currentLocation.lon
          );
          
          if (forecastResponse.success) {
            setWeatherForecasts(forecastResponse.forecasts);
            refreshData();
            toast({
              title: "Data Refreshed",
              description: "Weather and irrigation data updated."
            });
          } else {
            throw new Error(forecastResponse.message || "Failed to refresh data");
          }
        } catch (error) {
          toast({
            title: "Refresh Failed",
            description: "Could not update weather data. Please try again later.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchFreshData();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2" 
          onClick={() => navigate('/')}
        >
          <ChevronLeft />
        </Button>
        <h1 className="text-3xl font-bold text-crop-green-dark">
          {t.irrigation || "Irrigation Planner"}
        </h1>
      </div>
      
      {!isOnline && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            You are currently offline. Using cached data. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-4">
        <GeoLocation 
          onLocationChange={handleLocationChange}
          currentLocation={currentLocation}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Crop and Soil Input Section */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Crop Settings</CardTitle>
            <CardDescription>Select your crop and soil condition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Crop Type</label>
                <Select 
                  value={selectedCrop} 
                  onValueChange={value => setSelectedCrop(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {irrigationService.getAvailableCrops().map(crop => (
                      <SelectItem key={crop} value={crop}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Soil Condition</label>
                <div className="flex space-x-2">
                  {['Dry', 'Moist', 'Wet'].map((condition) => (
                    <Button 
                      key={condition} 
                      variant={soilCondition === condition ? "default" : "outline"}
                      className={`flex-1 ${soilCondition === condition ? 'bg-crop-green' : ''}`}
                      onClick={() => setSoilCondition(condition as SoilCondition)}
                    >
                      <DropletIcon className={`mr-1 h-4 w-4 ${
                        condition === 'Dry' ? 'opacity-30' : 
                        condition === 'Moist' ? 'opacity-60' : 'opacity-100'
                      }`} />
                      {condition}
                    </Button>
                  ))}
                </div>
              </div>
              
              {selectedCrop && (
                <div className="mt-4 bg-muted/50 p-3 rounded-md">
                  <h3 className="font-medium mb-1">Crop Requirements:</h3>
                  {(() => {
                    const req = irrigationService.getCropRequirements(selectedCrop);
                    return req ? (
                      <div className="text-sm">
                        <p>Min Weekly Rainfall: {req.minRainfallPerWeek}mm</p>
                        <p>Ideal Soil Moisture: {req.idealSoilMoisture}%</p>
                      </div>
                    ) : (
                      <p className="text-sm">No data available</p>
                    );
                  })()}
                </div>
              )}
              
              <Button 
                onClick={handleRefresh} 
                disabled={isLoading}
                className="w-full mt-2"
              >
                {isLoading ? (
                  <>Loading...</>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Weather Forecast Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>5-Day Weather Forecast</CardTitle>
            <CardDescription>
              {currentLocation?.name || 
               (currentLocation ? `${currentLocation.lat.toFixed(2)}, ${currentLocation.lon.toFixed(2)}` : 'No location set')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-crop-green"></div>
              </div>
            ) : weatherForecasts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {weatherForecasts.map((forecast, index) => (
                  <ForecastCard key={index} forecast={forecast} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CloudRain className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">No weather data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recommendations Section */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Irrigation Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            {recommendation ? (
              <Alert 
                variant={recommendation.needsIrrigation ? "default" : "default"}
                className={`
                  ${recommendation.urgencyLevel === 'high' ? 'bg-red-50 border-red-200 text-red-800' : 
                    recommendation.urgencyLevel === 'medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 
                    'bg-green-50 border-green-200 text-green-800'}
                `}
              >
                <div className="flex items-start">
                  {recommendation.needsIrrigation ? (
                    <Droplet className={`h-5 w-5 mr-2 ${
                      recommendation.urgencyLevel === 'high' ? 'text-red-600' :
                      recommendation.urgencyLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`} />
                  ) : (
                    <CloudRain className="h-5 w-5 mr-2 text-green-600" />
                  )}
                  <div>
                    <AlertTitle>
                      {recommendation.needsIrrigation ? 'Irrigation Needed' : 'No Irrigation Required'}
                    </AlertTitle>
                    <AlertDescription className="mt-1">
                      {recommendation.message}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ) : (
              <p className="text-center py-4">Loading recommendation...</p>
            )}
            
            <div className="mt-6">
              <h3 className="font-medium mb-3">Tips for {selectedCrop} irrigation:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Early morning irrigation is most efficient to reduce evaporation.</li>
                <li>Avoid watering leaves directly to prevent fungal diseases.</li>
                <li>Consider drip irrigation to conserve water and deliver moisture directly to roots.</li>
                {selectedCrop === "Rice" && (
                  <li>Maintain standing water of 2-5 cm during critical growth phases.</li>
                )}
                {selectedCrop === "Wheat" && (
                  <li>Most critical irrigation times are crown root initiation, tillering and grain filling stages.</li>
                )}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                toast({
                  title: "Reminder Set",
                  description: `You'll be notified when it's time to irrigate your ${selectedCrop}.`
                });
              }}
              className="mr-2"
            >
              <Bell className="mr-2 h-4 w-4" />
              Set Reminder
            </Button>
            <Button
              onClick={() => {
                navigate('/');
              }}
            >
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default IrrigationPlanner;
