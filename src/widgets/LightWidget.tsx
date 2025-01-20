import React from 'react';
import { Sun, Moon } from 'lucide-react';
import BaseWidget, { BaseWidgetProps } from './BaseWidget';

export default function LightWidget(props: BaseWidgetProps) {
  const { raw_value } = props;
  
  // Convert raw value (assumed to be in lux) to a percentage for visualization
  const percentage = raw_value === null ? 0 : Math.min(100, (raw_value / 1000) * 100);
  
  return (
    <BaseWidget {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {raw_value !== null && raw_value > 500 ? (
            <Sun className="h-8 w-8 text-yellow-500" />
          ) : (
            <Moon className="h-8 w-8 text-blue-400" />
          )}
          <div>
            <div className="text-3xl font-bold text-primary-dark dark:text-primary-light">
              {raw_value === null ? 'N/A' : `${raw_value.toFixed(0)} lux`}
            </div>
            <div className="text-sm text-primary-dark/60 dark:text-primary-light/60">
              {raw_value === null ? 'Unknown' :
               raw_value < 50 ? 'Very Dark' :
               raw_value < 200 ? 'Dark' :
               raw_value < 500 ? 'Dim' :
               raw_value < 1000 ? 'Bright' : 'Very Bright'}
            </div>
          </div>
        </div>
        <div className="w-24 h-24 relative">
          <div className="absolute inset-0 rounded-full bg-primary-light/20 dark:bg-primary-light/10" />
          <div 
            className="absolute inset-0 rounded-full bg-yellow-500"
            style={{
              clipPath: `polygon(50% 50%, -50% -50%, ${percentage}% -50%)`
            }}
          />
        </div>
      </div>
    </BaseWidget>
  );
}