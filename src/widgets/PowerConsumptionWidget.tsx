import React from 'react';
import { Zap } from 'lucide-react';
import BaseWidget, { BaseWidgetProps } from './BaseWidget';

export default function PowerConsumptionWidget(props: BaseWidgetProps) {
  const { raw_value } = props;
  // raw_value in watts

  const getPowerLevel = (watts: number) => {
    if (watts < 100) return { level: 'Low', color: 'text-green-500' };
    if (watts < 500) return { level: 'Moderate', color: 'text-yellow-500' };
    if (watts < 1000) return { level: 'High', color: 'text-orange-500' };
    return { level: 'Very High', color: 'text-red-500' };
  };

  const { level, color } = getPowerLevel(raw_value);

  return (
    <BaseWidget {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Zap className={`h-8 w-8 ${color}`} />
          <div>
            <div className="text-3xl font-bold text-primary-dark dark:text-primary-light">
              {raw_value < 1000 ? 
                `${raw_value}W` : 
                `${(raw_value / 1000).toFixed(1)}kW`}
            </div>
            <div className="text-sm text-primary-dark/60 dark:text-primary-light/60">
              Power Usage: {level}
            </div>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
}