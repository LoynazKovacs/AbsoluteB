import React from 'react';
import { Thermometer } from 'lucide-react';
import BaseWidget, { BaseWidgetProps } from './BaseWidget';

export default function ThermometerWidget(props: BaseWidgetProps) {
  const { raw_value } = props;

  // Calculate color based on temperature
  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return 'text-blue-500';
    if (temp < 15) return 'text-cyan-500';
    if (temp < 25) return 'text-green-500';
    if (temp < 35) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <BaseWidget {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Thermometer className={`h-8 w-8 ${getTemperatureColor(raw_value)}`} />
          <div>
            <div className={`text-3xl font-bold ${getTemperatureColor(raw_value)}`}>
              {raw_value.toFixed(1)}°C
            </div>
            <div className="text-sm text-primary-dark/60 dark:text-primary-light/60">
              {raw_value < 0 ? 'Freezing' : 
               raw_value < 15 ? 'Cold' :
               raw_value < 25 ? 'Comfortable' :
               raw_value < 35 ? 'Warm' : 'Hot'}
            </div>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
}