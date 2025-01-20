import React from 'react';
import { Volume2 } from 'lucide-react';
import BaseWidget, { BaseWidgetProps } from './BaseWidget';

export default function NoiseWidget(props: BaseWidgetProps) {
  const { raw_value } = props;
  // raw_value in dB

  const getNoiseLevel = (db: number) => {
    if (db < 30) return { level: 'Very Quiet', color: 'text-green-500' };
    if (db < 50) return { level: 'Quiet', color: 'text-green-400' };
    if (db < 60) return { level: 'Moderate', color: 'text-yellow-500' };
    if (db < 70) return { level: 'Loud', color: 'text-orange-500' };
    return { level: 'Very Loud', color: 'text-red-500' };
  };

  const { level, color } = getNoiseLevel(raw_value);

  return (
    <BaseWidget {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Volume2 className={`h-8 w-8 ${color}`} />
          <div>
            <div className={`text-3xl font-bold ${color}`}>
              {raw_value} dB
            </div>
            <div className="text-sm text-primary-dark/60 dark:text-primary-light/60">
              Noise Level: {level}
            </div>
          </div>
        </div>
        <div className="w-24 h-8 bg-primary-light/10 dark:bg-primary-light/5 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} opacity-20`}
            style={{ width: `${Math.min(100, (raw_value / 100) * 100)}%` }}
          />
        </div>
      </div>
    </BaseWidget>
  );
}