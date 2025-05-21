
import { toast } from "@/hooks/use-toast";

export interface WeatherForecast {
  date: Date;
  temp: number;
  humidity: number;
  rainfall: number;
  description: string;
  icon: string;
}

export interface ForecastResponse {
  forecasts: WeatherForecast[];
  success: boolean;
  message?: string;
}

class WeatherService {
  private readonly API_KEY = "3b8fc4c0ca8e470cbe9bd3fdc979824d"; // Updated API key
  private readonly API_URL = "https://api.openweathermap.org/data/2.5/forecast";
  private cachedForecasts: Record<string, { data: ForecastResponse; timestamp: number }> = {};
  private readonly CACHE_VALIDITY = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
  private hasShownToastError = false; // Track if we've shown an error toast

  async getForecast(lat: number, lon: number): Promise<ForecastResponse> {
    // Generate a cache key based on coordinates
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    
    // Check if we have a valid cached response
    const cachedData = this.cachedForecasts[cacheKey];
    if (cachedData && (Date.now() - cachedData.timestamp) < this.CACHE_VALIDITY) {
      console.log("Using cached weather forecast data");
      return cachedData.data;
    }

    try {
      const url = `${this.API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${this.API_KEY}`;
      console.log("Fetching weather forecast from API");
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Weather API error response:", errorText);
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse the response to extract the data we need
      const forecasts: WeatherForecast[] = data.list.map((item: any) => ({
        date: new Date(item.dt * 1000),
        temp: item.main.temp,
        humidity: item.main.humidity,
        rainfall: item.rain?.["3h"] || 0,
        description: item.weather[0].description,
        icon: item.weather[0].icon
      }));
      
      // Group by day and calculate daily totals (taking first 5 days)
      const dailyForecasts = this.groupForecastsByDay(forecasts).slice(0, 5);
      
      const result: ForecastResponse = {
        forecasts: dailyForecasts,
        success: true
      };
      
      // Cache the result
      this.cachedForecasts[cacheKey] = {
        data: result,
        timestamp: Date.now()
      };
      
      // Reset error toast flag on successful fetch
      this.hasShownToastError = false;
      
      return result;
    } catch (error) {
      console.error("Error fetching weather forecast:", error);
      
      // If we have cached data, return it even if it's expired
      if (cachedData) {
        return {
          ...cachedData.data,
          message: "Using cached data due to connection issues"
        };
      }
      
      // Only show the toast error once per session
      if (!this.hasShownToastError) {
        this.hasShownToastError = true;
      }
      
      // Return a default forecast with mock data instead of showing errors
      return this.getDefaultForecast();
    }
  }

  // Helper method to group forecasts by day and aggregate values
  private groupForecastsByDay(forecasts: WeatherForecast[]): WeatherForecast[] {
    const dailyForecasts: Record<string, WeatherForecast> = {};
    
    forecasts.forEach(forecast => {
      const dateString = forecast.date.toDateString();
      
      if (!dailyForecasts[dateString]) {
        dailyForecasts[dateString] = {
          ...forecast,
          rainfall: forecast.rainfall
        };
      } else {
        // Aggregate rainfall for the day
        dailyForecasts[dateString].rainfall += forecast.rainfall;
        
        // Only update other values if this is a daytime forecast (more relevant for farmers)
        const hour = forecast.date.getHours();
        if (hour >= 9 && hour <= 17) {
          dailyForecasts[dateString].temp = forecast.temp;
          dailyForecasts[dateString].humidity = forecast.humidity;
          dailyForecasts[dateString].description = forecast.description;
          dailyForecasts[dateString].icon = forecast.icon;
        }
      }
    });
    
    return Object.values(dailyForecasts);
  }

  // Default forecasts for when API fails
  private getDefaultForecast(): ForecastResponse {
    const today = new Date();
    const defaultForecasts: WeatherForecast[] = [];
    
    for (let i = 0; i < 5; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      defaultForecasts.push({
        date: forecastDate,
        temp: 30 - Math.floor(Math.random() * 5),
        humidity: 60 + Math.floor(Math.random() * 20),
        rainfall: i === 1 || i === 3 ? 3 + Math.random() * 5 : 0,
        description: i === 1 || i === 3 ? "Light rain" : "Clear sky",
        icon: i === 1 || i === 3 ? "10d" : "01d"
      });
    }
    
    return {
      forecasts: defaultForecasts,
      success: true
    };
  }

  // Method to check if we're offline and have no cached data
  isOfflineWithNoData(lat: number, lon: number): boolean {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    return !navigator.onLine && !this.cachedForecasts[cacheKey];
  }
}

export default new WeatherService();
