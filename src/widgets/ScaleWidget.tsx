import React from 'react';
import { Scale, Settings, Share as Tare, Power, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import BaseWidget, { BaseWidgetProps } from './BaseWidget';
import { useState } from 'react';

interface ScaleConfig {
  minWeight: number;
  maxWeight: number;
  colors: {
    low: string;
    medium: string;
    high: string;
  };
  fullIsGood: boolean;
  unit: 'kg' | 'g' | 'lb' | 'oz';
}

export default function ScaleWidget(props: BaseWidgetProps) {
  const { raw_value, name } = props;
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<ScaleConfig>({
    minWeight: 0,
    maxWeight: 200,
    colors: {
      low: 'green',
      medium: 'yellow',
      high: 'red'
    },
    fullIsGood: false,
    unit: 'kg'
  });
  
  const range = config.maxWeight - config.minWeight;
  const percentage = Math.min(100, ((raw_value - config.minWeight) / range) * 100);
  
  const getWeightColor = (value: number) => {
    const percentage = ((value - config.minWeight) / range) * 100;
    if (config.fullIsGood) {
      if (percentage < 33) return `text-${config.colors.low}-500`;
      if (percentage < 66) return `text-${config.colors.medium}-500`;
      return `text-${config.colors.high}-500`;
    } else {
      if (percentage < 33) return `text-${config.colors.high}-500`;
      if (percentage < 66) return `text-${config.colors.medium}-500`;
      return `text-${config.colors.low}-500`;
    }
  };

  const handleTare = () => {
    // TODO: Implement tare functionality
    console.log('Tare scale');
  };

  const handleCalibrate = () => {
    // TODO: Implement calibration
    console.log('Calibrate scale');
  };

  const handlePower = () => {
    // TODO: Implement power toggle
    console.log('Toggle power');
  };

  return (
    <BaseWidget {...props}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Scale className={`h-8 w-8 ${getWeightColor(raw_value)}`} />
          <div>
            <div className={`text-3xl font-bold ${getWeightColor(raw_value)}`}> 
              {raw_value === null ? 'N/A' : raw_value.toFixed(1)}
              <span className="text-lg ml-1 text-primary-dark/60 dark:text-primary-light/60">
                {config.unit}
              </span>
            </div>
            <div className="text-sm text-primary-dark/60 dark:text-primary-light/60 capitalize">
              {name.toLowerCase()}
            </div>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 hover:bg-primary-light/10 dark:hover:bg-primary-light/5 rounded-full transition-colors"
            title="Configure Scale"
          >
            <Settings className="h-5 w-5 text-primary-dark/60 dark:text-primary-light/60" />
          </button>
        </div>
        <div className="relative w-20 h-20">
          {/* Background circle */}
          <div className="absolute inset-0 rounded-full border-4 border-primary-light/10 dark:border-primary-light/5" />
          
          {/* Progress arc */}
          <svg
            className="absolute inset-0 transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              strokeWidth="8"
              className={`${getWeightColor(raw_value)} transition-all duration-500`}
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.4} 1000`}
            />
          </svg>
          
          {/* Current value indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs font-medium text-primary-dark/60 dark:text-primary-light/60">
              {percentage.toFixed(0)}%
            </div>
          </div>
        </div>
        </div>

        {/* Configuration Panel */}
        {showConfig && (
          <div className="bg-white/50 dark:bg-white/5 rounded-lg p-4 space-y-4 border border-primary-light/20 dark:border-primary-dark/20">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-primary-dark dark:text-primary-light">
                Scale Configuration
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleTare}
                  className="p-2 hover:bg-primary-light/10 dark:hover:bg-primary-light/5 rounded-full transition-colors"
                  title="Tare Scale"
                >
                  <Tare className="h-4 w-4 text-primary-dark/60 dark:text-primary-light/60" />
                </button>
                <button
                  onClick={handleCalibrate}
                  className="p-2 hover:bg-primary-light/10 dark:hover:bg-primary-light/5 rounded-full transition-colors"
                  title="Calibrate Scale"
                >
                  <RotateCcw className="h-4 w-4 text-primary-dark/60 dark:text-primary-light/60" />
                </button>
                <button
                  onClick={handlePower}
                  className="p-2 hover:bg-primary-light/10 dark:hover:bg-primary-light/5 rounded-full transition-colors"
                  title="Power On/Off"
                >
                  <Power className="h-4 w-4 text-primary-dark/60 dark:text-primary-light/60" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-primary-dark/60 dark:text-primary-light/60">
                  Minimum Weight
                </label>
                <input
                  type="number"
                  value={config.minWeight}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    minWeight: Number(e.target.value)
                  }))}
                  className="w-full px-3 py-1.5 text-sm rounded-md border border-primary-light/20 dark:border-primary-dark/20 bg-white dark:bg-background-dark"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-primary-dark/60 dark:text-primary-light/60">
                  Maximum Weight
                </label>
                <input
                  type="number"
                  value={config.maxWeight}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    maxWeight: Number(e.target.value)
                  }))}
                  className="w-full px-3 py-1.5 text-sm rounded-md border border-primary-light/20 dark:border-primary-dark/20 bg-white dark:bg-background-dark"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-primary-dark/60 dark:text-primary-light/60">
                Unit
              </label>
              <select
                value={config.unit}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  unit: e.target.value as ScaleConfig['unit']
                }))}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-primary-light/20 dark:border-primary-dark/20 bg-white dark:bg-background-dark"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="lb">Pounds (lb)</option>
                <option value="oz">Ounces (oz)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-primary-dark/60 dark:text-primary-light/60">
                Color Scheme
              </label>
              <div className="flex items-center space-x-4">
                {['low', 'medium', 'high'].map((level) => (
                  <select
                    key={level}
                    value={config.colors[level as keyof typeof config.colors]}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      colors: {
                        ...prev.colors,
                        [level]: e.target.value
                      }
                    }))}
                    className="px-3 py-1.5 text-sm rounded-md border border-primary-light/20 dark:border-primary-dark/20 bg-white dark:bg-background-dark"
                  >
                    {['red', 'yellow', 'green', 'blue', 'purple'].map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.fullIsGood}
                onChange={(e) => setConfig(prev => ({ ...prev, fullIsGood: e.target.checked }))}
                className="rounded border-primary-light/20 dark:border-primary-dark/20"
              />
              <label className="text-sm text-primary-dark/60 dark:text-primary-light/60">
                Full is good (reverses color scheme)
              </label>
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}