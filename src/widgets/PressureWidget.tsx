import React from 'react';
import { Gauge } from 'lucide-react';
import BaseWidget, { BaseWidgetProps } from './BaseWidget';

export default function PressureWidget(props: BaseWidgetProps) {
  const { raw_value } = props;
  // Assuming pressure in hPa (hectopascals)
  const normalPressure = 1013.25; // standard atmospheric pressure
  const deviation = ((raw_value - normalPressure) / normalPressure) * 100;

  const getStatusColor = () => {
    if (Math.abs(deviation) < 0.5) return 'text-green-500';
    if (Math.abs(deviation) < 1) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <BaseWidget {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Gauge className={`h-8 w-8 ${getStatusColor()}`} />
          <div>
            <div className="text-3xl font-bold text-primary-dark dark:text-primary-light">
              {raw_value.toFixed(1)} hPa
            </div>
            <div className="text-sm text-primary-dark/60 dark:text-primary-light/60">
              {deviation > 0 ? 'Above' : 'Below'} normal ({Math.abs(deviation).toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
}