import React from 'react';
import { Droplets } from 'lucide-react';
import BaseWidget, { BaseWidgetProps } from './BaseWidget';

export default function HumidityWidget(props: BaseWidgetProps) {
  const { raw_value } = props;
  const percentage = Math.min(100, Math.max(0, raw_value));

  const getHumidityColor = (value: number) => {
    if (value < 30) return 'text-orange-500';
    if (value < 50) return 'text-green-500';
    if (value < 70) return 'text-blue-400';
    return 'text-blue-600';
  };

  return (
    <BaseWidget {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Droplets className={`h-8 w-8 ${getHumidityColor(percentage)}`} />
          <div>
            <div className={`text-3xl font-bold ${getHumidityColor(percentage)}`}>
              {percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-primary-dark/60 dark:text-primary-light/60">
              {percentage < 30 ? 'Dry' :
               percentage < 50 ? 'Comfortable' :
               percentage < 70 ? 'Humid' : 'Very Humid'}
            </div>
          </div>
        </div>
        <div className="w-24 h-24 relative">
          <div className="absolute inset-0 rounded-full border-4 border-primary-light/20 dark:border-primary-light/10" />
          <div 
            className={`absolute inset-0 rounded-full border-4 ${getHumidityColor(percentage)} transition-all duration-500`}
            style={{
              clipPath: `polygon(0 ${100 - percentage}%, 100% ${100 - percentage}%, 100% 100%, 0 100%)`
            }}
          />
        </div>
      </div>
    </BaseWidget>
  );
}