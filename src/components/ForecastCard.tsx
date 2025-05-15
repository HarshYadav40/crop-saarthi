
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CloudRain, Thermometer, Droplet } from 'lucide-react';
import { WeatherForecast } from '@/services/WeatherService';

interface ForecastCardProps {
  forecast: WeatherForecast;
}

const ForecastCard: React.FC<ForecastCardProps> = ({ forecast }) => {
  // Format the date nicely
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  // Color coding based on rainfall amount
  const getRainfallColor = (rainfall: number) => {
    if (rainfall === 0) return 'text-yellow-600';
    if (rainfall < 5) return 'text-blue-400';
    if (rainfall < 15) return 'text-blue-600';
    return 'text-blue-800';
  };

  return (
    <Card className="overflow-hidden h-full">
      <CardContent className="p-3">
        <div className="text-center mb-2">
          <p className="font-medium">{formatDate(forecast.date)}</p>
        </div>
        
        {forecast.icon && (
          <div className="flex justify-center -mt-2 -mb-1">
            <img 
              src={`https://openweathermap.org/img/wn/${forecast.icon}@2x.png`}
              alt={forecast.description}
              className="w-16 h-16"
            />
          </div>
        )}
        
        <div className="text-center mb-1">
          <p className="text-sm capitalize">{forecast.description}</p>
        </div>
        
        <div className="flex justify-between items-center text-sm mt-2">
          <div className="flex items-center">
            <Thermometer className="h-3 w-3 mr-1" />
            <span>{Math.round(forecast.temp)}°C</span>
          </div>
          
          <div className="flex items-center">
            <Droplet className="h-3 w-3 mr-1" />
            <span>{forecast.humidity}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center mt-2">
          <CloudRain className={`h-4 w-4 mr-1 ${getRainfallColor(forecast.rainfall)}`} />
          <span className={`font-medium ${getRainfallColor(forecast.rainfall)}`}>
            {forecast.rainfall > 0 ? `${forecast.rainfall.toFixed(1)}mm` : 'No rain'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastCard;
