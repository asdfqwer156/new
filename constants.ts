import { GameConfig } from './types';

// Standard yaw values (Degree per count = Sensitivity * Yaw)
// To find Sensitivity for 360 turn: Sens = 360 / (Counts_Per_360 * Yaw)
export const GAMES: GameConfig[] = [
  {
    id: 'valorant',
    name: 'VALORANT',
    yaw: 0.07,
    defaultFov: 103,
    color: 'text-rose-500 border-rose-500'
  },
  {
    id: 'overwatch',
    name: 'Overwatch 2',
    yaw: 0.0066,
    defaultFov: 103,
    color: 'text-orange-500 border-orange-500'
  },
  {
    id: 'cs2',
    name: 'Counter-Strike 2 / Apex',
    yaw: 0.022,
    defaultFov: 106, // CS 90 (4:3) is approx 106 in 16:9. Apex max is 110.
    color: 'text-yellow-500 border-yellow-500'
  },
  {
    id: 'rainbow6',
    name: 'Rainbow Six Siege',
    yaw: 0.005724, // Default multiplier
    defaultFov: 90, // Default varies, usually 60-90 Vertical which maps to high Horizontal
    color: 'text-blue-500 border-blue-500'
  },
  {
    id: 'roblox',
    name: 'Roblox (Fperson)',
    yaw: 0.0035, // Approximate for standard camera scripts, highly variable
    defaultFov: 80, // Default 70 Vertical approx
    color: 'text-gray-400 border-gray-400'
  },
  {
    id: 'pubg',
    name: 'PUBG',
    yaw: 0.007, // Approximate general conversion
    defaultFov: 90, // FPP Default 90
    color: 'text-amber-600 border-amber-600'
  }
];

export const DEFAULT_DPI = 800;
export const DEFAULT_DISTANCE_CM = 35; // A typical large mousepad width usage
export const DEFAULT_GAME_ID = 'valorant';

// Windows Pointer Speed Multipliers (Index 0 = 1/11, Index 5 = 6/11 default, Index 10 = 11/11)
export const WINDOWS_SENS_MULTIPLIERS = [
  0.03125, // 1/11
  0.0625,  // 2/11
  0.25,    // 3/11
  0.5,     // 4/11
  0.75,    // 5/11
  1.0,     // 6/11 (Default, No scaling)
  1.5,     // 7/11
  2.0,     // 8/11
  2.5,     // 9/11
  3.0,     // 10/11
  3.5      // 11/11
];