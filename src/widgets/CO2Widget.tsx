import React from 'react';
import { Wind } from 'lucide-react';
import BaseWidget, { BaseWidgetProps } from './BaseWidget';

export default function CO2Widget(props: BaseWidgetProps) {
  const { raw_value } = props;
  // raw_value in ppm (parts per million)

  const getAirQualityInfo = (ppm: number) => {
    if (ppm < 400) return { status: 'Excellent', color: 'text-green-500' };
    if (ppm < 1000) return { status: 'Good', color: 'text-green-400' };
    if (ppm < 2000) return { status: 'Moderate', color: 'text-yellow-500' };
    if (ppm < 5000) return { status: 'Poor', color: 'text-orange-500' };
    return { status: 'Dangerous', color: 'text-red-500' };
  };

  const { status, color } = getAirQualityInfo(raw_value);

  return (
    <BaseWidget {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Wind className={`h-8 w-8 ${color}`} />
          <div>
            <div className={`text-3xl font-bold ${color}`}>
              {raw_value} ppm
            </div>
            <div className="text-sm text-primary-dark/60 dark:text-primary-light/60">
              CO₂ Level: {status}
            </div>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
}