import React from 'react';
import { DoorOpen, DoorClosed } from 'lucide-react';
import BaseWidget, { BaseWidgetProps } from './BaseWidget';

export default function DoorSensorWidget(props: BaseWidgetProps) {
  const { raw_value, updated_at } = props;
  // raw_value as boolean (0 = closed, 1 = open)

  const lastChanged = new Date(updated_at).toLocaleTimeString();

  return (
    <BaseWidget {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {raw_value ? (
            <DoorOpen className="h-8 w-8 text-yellow-500" />
          ) : (
            <DoorClosed className="h-8 w-8 text-green-500" />
          )}
          <div>
            <div className={`text-2xl font-bold ${raw_value ? 'text-yellow-500' : 'text-green-500'}`}>
              {raw_value ? 'Open' : 'Closed'}
            </div>
            <div className="text-sm text-primary-dark/60 dark:text-primary-light/60">
              Last changed: {lastChanged}
            </div>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
}