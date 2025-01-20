import React from 'react';
import { Sprout } from 'lucide-react';
import BaseWidget, { BaseWidgetProps } from './BaseWidget';

export default function SoilMoistureWidget(props: BaseWidgetProps) {
  const { raw_value } = props;
  // raw_value as percentage (0-100)

  const getMoistureInfo = (level: number) => {
    if (level < 20) return { status: 'Very Dry', color: 'text-red-500', needsWater: true };
    if (level < 40) return { status: 'Dry', color: 'text-orange-500', needsWater: true };
    if (level < 60) return { status: 'Moderate', color: 'text-green-500', needsWater: false };
    if (level < 80) return { status: 'Moist', color: 'text-blue-400', needsWater: false };
    return { status: 'Very Moist', color: 'text-blue-600', needsWater: false };
  };

  const { status, color, needsWater } = getMoistureInfo(raw_value);

  return (
    <BaseWidget {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Sprout className={`h-8 w-8 ${color}`} />
          <div>
            <div className={`text-3xl font-bold ${color}`}>
              {raw_value}%
            </div>
            <div className="text-sm text-primary-dark/60 dark:text-primary-light/60">
              {status}
              {needsWater && (
                <span className="ml-2 text-red-500">Needs Water!</span>
              )}
            </div>
          </div>
        </div>
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-4 border-primary-light/20 dark:border-primary-light/10" />
          <div 
            className={`absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-500 ${color}`}
            style={{
              height: `${raw_value}%`,
              opacity: 0.3
            }}
          />
        </div>
      </div>
    </BaseWidget>
  );
}