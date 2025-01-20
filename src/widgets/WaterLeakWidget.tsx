import React from 'react';
import { Droplet } from 'lucide-react';
import BaseWidget, { BaseWidgetProps } from './BaseWidget';

export default function WaterLeakWidget(props: BaseWidgetProps) {
  const { raw_value } = props;
  // raw_value as boolean (0 = no leak, 1 = leak detected)

  return (
    <BaseWidget {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Droplet className={raw_value ? 'text-red-500' : 'text-green-500'} />
          <div>
            <div className={`text-2xl font-bold ${raw_value ? 'text-red-500' : 'text-green-500'}`}>
              {raw_value ? 'Leak Detected!' : 'No Leaks'}
            </div>
            <div className="text-sm text-primary-dark/60 dark:text-primary-light/60">
              {raw_value ? 'Immediate attention required' : 'System operating normally'}
            </div>
          </div>
        </div>
        {raw_value && (
          <div className="animate-ping h-3 w-3 rounded-full bg-red-500" />
        )}
      </div>
    </BaseWidget>
  );
}