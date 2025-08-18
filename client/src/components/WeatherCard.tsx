import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Wind, Eye } from "lucide-react";

interface WeatherCardProps {
  data: {
    location: string;
    country?: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    description: string;
    main: string;
    icon: string;
    windSpeed: number;
    visibility: string;
  };
}

export function WeatherCard({ data }: WeatherCardProps) {
  return (
    <Card className="w-full max-w-md" data-testid="card-weather">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span data-testid="text-weather-location">
            {data.location}{data.country && `, ${data.country}`}
          </span>
          <img 
            src={data.icon} 
            alt={data.description}
            className="w-12 h-12"
            data-testid="img-weather-icon"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold" data-testid="text-weather-temp">
              {data.temperature}°C
            </div>
            <div className="text-sm text-muted-foreground" data-testid="text-weather-description">
              {data.description.charAt(0).toUpperCase() + data.description.slice(1)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Feels like</div>
            <div className="text-2xl font-semibold" data-testid="text-weather-feels-like">
              {data.feelsLike}°C
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-sm text-muted-foreground">Humidity</div>
              <div className="font-semibold" data-testid="text-weather-humidity">
                {data.humidity}%
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-sm text-muted-foreground">Wind</div>
              <div className="font-semibold" data-testid="text-weather-wind">
                {data.windSpeed} m/s
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-red-500" />
            <div>
              <div className="text-sm text-muted-foreground">Pressure</div>
              <div className="font-semibold" data-testid="text-weather-pressure">
                {data.pressure} hPa
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-green-500" />
            <div>
              <div className="text-sm text-muted-foreground">Visibility</div>
              <div className="font-semibold" data-testid="text-weather-visibility">
                {data.visibility} km
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}