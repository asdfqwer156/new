import React, { useState, useMemo } from 'react';
import { Calculator, ArrowRightLeft, Mouse, Info, RotateCw, Undo2, ScanEye, Settings2 } from 'lucide-react';
import { GAMES, DEFAULT_DPI, DEFAULT_DISTANCE_CM, DEFAULT_GAME_ID, WINDOWS_SENS_MULTIPLIERS } from '../constants';
import MeasureModal from './MeasureModal';
import { GameConfig } from '../types';

const CalculatorComponent: React.FC = () => {
  const [dpi, setDpi] = useState<number>(DEFAULT_DPI);
  const [distanceCm, setDistanceCm] = useState<number>(DEFAULT_DISTANCE_CM);
  const [selectedGameId, setSelectedGameId] = useState<string>(DEFAULT_GAME_ID);
  const [targetAngle, setTargetAngle] = useState<number>(180);
  const [isMeasureModalOpen, setIsMeasureModalOpen] = useState(false);
  
  // Windows Settings
  const [windowsSensIndex, setWindowsSensIndex] = useState<number>(5); // 0-10, 5 is 6/11
  const [useRawInput, setUseRawInput] = useState<boolean>(true);

  const ROTATION_OPTIONS = [
    { value: 360, label: '360° (한 바퀴)', desc: '하이퍼 FPS / 고감도', icon: RotateCw },
    { value: 180, label: '180° (뒤돌기)', desc: '택티컬 FPS / 표준', icon: Undo2 },
    { value: 103, label: '103° (화면 폭)', desc: '정밀 조준 / 저감도', icon: ScanEye },
  ];

  // Auto-measurement handler
  const handleMeasurementComplete = (counts: number) => {
    // Convert counts to CM: (Counts / DPI) * 2.54
    // NOTE: Measurements use "unadjustedMovement" if available, so they are generally raw counts.
    const cm = (counts / dpi) * 2.54;
    setDistanceCm(parseFloat(cm.toFixed(1)));
  };

  const selectedGame = useMemo(() => 
    GAMES.find(g => g.id === selectedGameId) || GAMES[0], 
  [selectedGameId]);

  // Calculate Effective DPI based on Windows Settings
  const windowsMultiplier = WINDOWS_SENS_MULTIPLIERS[windowsSensIndex];
  const effectiveDpi = useRawInput ? dpi : dpi * windowsMultiplier;

  // Core Calculation Logic
  // Formula: Sensitivity = (360 * 2.54) / (EffectiveDPI * cmPer360 * yaw)
  const calculateSens = (game: GameConfig, effectiveCmPer360: number, currentEffectiveDpi: number) => {
    if (effectiveCmPer360 <= 0 || currentEffectiveDpi <= 0) return "0";
    const numerator = 360 * 2.54;
    const denominator = currentEffectiveDpi * effectiveCmPer360 * game.yaw;
    return (numerator / denominator).toFixed(3);
  };

  // Calculate the effective cm/360 based on the target angle and physical distance
  const effectiveCmPer360 = distanceCm * (360 / targetAngle);

  const mainSensitivity = calculateSens(selectedGame, effectiveCmPer360, effectiveDpi);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Mouse & Game Settings */}
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 p-6 rounded-2xl shadow-xl flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6 text-indigo-400">
            <Mouse size={24} />
            <h2 className="text-xl font-semibold">1. 마우스 및 게임 설정</h2>
          </div>
          
          <div className="space-y-6 flex-1">
            {/* DPI Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">마우스 DPI</label>
              <input 
                type="number" 
                value={dpi}
                onChange={(e) => setDpi(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono"
                placeholder="e.g., 800"
              />
            </div>

            {/* Windows Mouse Settings */}
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                  <Settings2 size={16} />
                  <span>윈도우 포인터 속도</span>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {windowsSensIndex + 1}/11 {windowsSensIndex === 5 && '(기본)'}
                </div>
              </div>
              
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={windowsSensIndex}
                disabled={useRawInput}
                onChange={(e) => setWindowsSensIndex(Number(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-colors
                  ${useRawInput ? 'bg-gray-700' : 'bg-gray-600 accent-indigo-500'}`}
              />

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={useRawInput} 
                    onChange={(e) => setUseRawInput(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-800 transition-colors"
                  />
                  <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Raw Input 사용 (권장)
                  </span>
                </label>
                {!useRawInput && (
                   <span className="text-xs text-amber-500 font-mono">
                     배율: x{windowsMultiplier}
                   </span>
                )}
              </div>
            </div>

            {/* Game Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">대상 게임</label>
              <div className="grid grid-cols-2 gap-2">
                {GAMES.map(game => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGameId(game.id)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all truncate text-left
                      ${selectedGameId === game.id 
                        ? `bg-indigo-600/20 border-indigo-500 text-white font-medium` 
                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                  >
                    {game.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Distance & Strategy */}
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 p-6 rounded-2xl shadow-xl flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6 text-emerald-400">
            <ArrowRightLeft size={24} />
            <h2 className="text-xl font-semibold">2. 공간 및 목표</h2>
          </div>

          <div className="flex-1 flex flex-col space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                사용 가능한 패드 거리 (cm)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="number" 
                    value={distanceCm}
                    onChange={(e) => setDistanceCm(Number(e.target.value))}
                    step="0.1"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono text-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">cm</span>
                </div>
                <button
                  onClick={() => setIsMeasureModalOpen(true)}
                  className="px-4 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 rounded-lg transition-all flex items-center justify-center"
                  title="마우스로 측정하기"
                >
                  <Calculator size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                이 거리에서 수행할 동작
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROTATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTargetAngle(opt.value)}
                    className={`relative p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all
                      ${targetAngle === opt.value
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-500'
                      }`}
                  >
                    <opt.icon size={20} className={targetAngle === opt.value ? 'text-emerald-400' : 'text-gray-500'} />
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className="text-[10px] opacity-70 scale-90">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {/* Main Result */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-8 rounded-3xl relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left space-y-1">
              <h3 className="text-indigo-300 font-medium">추천 감도 ({selectedGame.name})</h3>
              <p className="text-gray-300 text-lg">
                <span className="text-white font-bold">{distanceCm}cm</span> 이동 시 
                <span className="text-white font-bold"> {targetAngle}°</span> 회전
              </p>
              <div className="text-sm text-gray-500 space-y-0.5">
                <p>360° 환산 거리: <span className="font-mono text-indigo-400">{effectiveCmPer360.toFixed(1)}cm</span></p>
                {!useRawInput && windowsMultiplier !== 1 && (
                  <p>유효 DPI: <span className="font-mono text-amber-500">{effectiveDpi}</span> (Win x{windowsMultiplier})</p>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-6xl md:text-8xl font-bold text-white font-mono tracking-tighter drop-shadow-2xl">
                {mainSensitivity}
              </div>
              <div className="text-sm text-gray-500 font-mono mt-2">
                 eDPI: {(Number(mainSensitivity) * effectiveDpi).toFixed(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Other Games Grid */}
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-2">다른 게임 환산</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GAMES.filter(g => g.id !== selectedGameId).map((game) => (
            <div key={game.id} className="bg-gray-800/40 border border-gray-700 p-4 rounded-xl flex flex-col items-center text-center hover:bg-gray-800/60 transition-colors">
              <span className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">{game.name}</span>
              <span className={`text-2xl font-mono font-bold ${game.color.split(' ')[0]}`}>
                {calculateSens(game, effectiveCmPer360, effectiveDpi)}
              </span>
            </div>
          ))}
        </div>
        
        {/* Info Note */}
        <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg flex items-start gap-3 text-sm text-gray-400">
          <Info className="shrink-0 mt-0.5 text-indigo-400" size={16} />
          <div className="space-y-1">
            <p>
              선택한 <strong>{targetAngle}°</strong> 옵션은 {targetAngle === 360 ? '패드 전체를 사용해 한 바퀴를 도는 고감도 설정입니다.' : targetAngle === 180 ? '패드 끝에서 끝까지 이동했을 때 뒤를 돌아볼 수 있는 안정적인 설정입니다.' : '화면에 보이는 적을 정밀하게 조준하기 위한 저감도 설정입니다.'}
            </p>
            {!useRawInput && (
              <p className="text-amber-500">
                * 윈도우 포인터 속도가 반영되었습니다. 대부분의 최신 경쟁 게임은 Raw Input을 사용하므로, 게임 설정에서 Raw Input이 꺼져있는지 확인하세요.
              </p>
            )}
          </div>
        </div>
      </div>

      <MeasureModal 
        isOpen={isMeasureModalOpen} 
        onClose={() => setIsMeasureModalOpen(false)}
        onComplete={handleMeasurementComplete}
        dpi={dpi}
      />
    </div>
  );
};

export default CalculatorComponent;