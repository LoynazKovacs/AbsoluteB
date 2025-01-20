import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import BaseWidget, { BaseWidgetProps } from './BaseWidget';

export default function MotionWidget(props: BaseWidgetProps) {
  const { raw_value, updated_at } = props;
  const [timeSinceMotion, setTimeSinceMotion] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const lastMotion = new Date(updated_at);
      const now = new Date();
      const diff = now.getTime() - lastMotion.getTime();
      const minutes = Math.floor(diff / 60000);
      
      if (minutes < 1) {
        setTimeSinceMotion('Just now');
      } else if (minutes < 60) {
        setTimeSinceMotion(`${minutes} minute${minutes === 1 ? '' : 's'} ago`);
      } else {
        const hours = Math.floor(minutes / 60);
        setTimeSinceMotion(`${hours} hour${hours === 1 ? '' : 's'} ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [updated_at]);

  return (
    <BaseWidget {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Activity className={`h-8 w-8 ${raw_value ? 'text-red-500' : 'text-green-500'}`} />
          <div>
            <div className={`text-2xl font-bold ${raw_value ? 'text-red-500' : 'text-green-500'}`}>
              {raw_value ? 'Motion Detected' : 'No Motion'}
            </div>
            <div className="text-sm text-primary-dark/60 dark:text-primary-light/60">
              Last activity: {timeSinceMotion}
            </div>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
}