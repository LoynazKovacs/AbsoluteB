import React from 'react';
import { CloudRain } from 'lucide-react';
import BaseWidget, { BaseWidgetProps } from './BaseWidget';

export default function AirQualityWidget(props: BaseWidgetProps) {
  const { raw_value } = props;
  // raw_value as AQI (Air Quality Index)

  const getAQIInfo = (aqi: number) => {
    if (aqi <= 50) return { level: 'Good', color: 'text-green-500', description: 'Healthy air quality' };
    if (aqi <= 100) return { level: 'Moderate', color: 'text-yellow-500', description: 'Acceptable air quality' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'text-orange-500', description: 'Sensitive groups should reduce exposure' };
    if (aqi <= 200) return { level: 'Unhealthy', color: 'text-red-500', description: 'Everyone may experience effects' };
    return { level: 'Very Unhealthy', color: 'text-purple-500', description: 'Health alert: everyone may experience serious effects' };
  };

  const { level, color, description } = getAQIInfo(raw_value);

  return (
    <BaseWidget {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <CloudRain className={`h-8 w-8 ${color}`} />
          <div>
            <div className={`text-3xl font-bold ${color}`}>
              AQI {raw_value}
            </div>
            <div className="text-sm font-medium mb-1">{level}</div>
            <div className="text-sm text-primary-dark/60 dark:text-primary-light/60">
              {description}
            </div>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
}