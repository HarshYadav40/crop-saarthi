
import React, { useState, useEffect } from 'react';
import { MapPin, Search, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface LocationData {
  lat: number;
  lon: number;
  name?: string;
}

interface GeoLocationProps {
  onLocationChange: (location: LocationData) => void;
  currentLocation?: LocationData | null;
  showManualEntry?: boolean;
}

const GeoLocation: React.FC<GeoLocationProps> = ({
  onLocationChange,
  currentLocation,
  showManualEntry = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const { toast } = useToast();

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        onLocationChange(location);
        setIsLoading(false);
        toast({
          title: "Location found",
          description: `Using your current location: ${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`
        });
      },
      (error) => {
        setIsLoading(false);
        let errorMessage = "Unable to get your location";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const searchLocation = async () => {
    if (!locationQuery.trim()) return;
    
    setIsLoading(true);
    
    try {
      const apiKey = "bd5e378503939ddaee76f12ad7a97608"; // Valid API key
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationQuery)}&limit=1&appid=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Location search failed');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = data[0];
        const locationData = {
          lat: location.lat,
          lon: location.lon,
          name: `${location.name}, ${location.country}`
        };
        
        onLocationChange(locationData);
        setShowLocationInput(false);
        setLocationQuery('');
        
        toast({
          title: "Location found",
          description: `Using location: ${locationData.name}`
        });
      } else {
        toast({
          title: "Location not found",
          description: "Please try a different location name",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error searching location:", error);
      toast({
        title: "Search failed",
        description: "Unable to search for location. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  return (
    <Card className="bg-white/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">
              {currentLocation?.name || 
               (currentLocation ? `${currentLocation.lat.toFixed(2)}, ${currentLocation.lon.toFixed(2)}` : 'No location set')}
            </span>
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <Target className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            {showManualEntry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLocationInput(!showLocationInput)}
                className="h-8 w-8 p-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {showLocationInput && (
          <div className="flex gap-2">
            <Input
              placeholder="Enter city name..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-8 text-sm"
              autoFocus
            />
            <Button
              onClick={searchLocation}
              disabled={isLoading || !locationQuery.trim()}
              size="sm"
              className="h-8 text-xs"
            >
              Search
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeoLocation;
