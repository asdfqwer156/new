export interface GameConfig {
  id: string;
  name: string;
  yaw: number; // The multiplier used to calculate degrees per dot.
  defaultFov: number; // Default Horizontal FOV (16:9 base)
  icon?: string;
  color: string;
}

export interface CalculationResult {
  gameName: string;
  sensitivity: string; // Keep as string for display precision
  cmPer360: number;
}

export interface MeasurementState {
  isMeasuring: boolean;
  counts: number;
  step: 'idle' | 'ready' | 'measuring' | 'complete';
}