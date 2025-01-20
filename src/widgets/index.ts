import ScaleWidget from './ScaleWidget';
import ThermometerWidget from './ThermometerWidget';
import LightWidget from './LightWidget';
import HumidityWidget from './HumidityWidget';
import PressureWidget from './PressureWidget';
import CO2Widget from './CO2Widget';
import MotionWidget from './MotionWidget';
import NoiseWidget from './NoiseWidget';
import AirQualityWidget from './AirQualityWidget';
import WaterLeakWidget from './WaterLeakWidget';
import PowerConsumptionWidget from './PowerConsumptionWidget';
import SoilMoistureWidget from './SoilMoistureWidget';
import DoorSensorWidget from './DoorSensorWidget';

export const widgets = {
  scale: ScaleWidget,
  thermometer: ThermometerWidget,
  light: LightWidget,
  humidity: HumidityWidget,
  pressure: PressureWidget,
  co2: CO2Widget,
  motion: MotionWidget,
  noise: NoiseWidget,
  air_quality: AirQualityWidget,
  water_leak: WaterLeakWidget,
  power: PowerConsumptionWidget,
  soil_moisture: SoilMoistureWidget,
  door: DoorSensorWidget,
} as const;

export type WidgetType = keyof typeof widgets;

export function getWidget(type: string) {
  return widgets[type as WidgetType] || null;
}