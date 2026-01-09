
import React, { useState, useEffect, useRef } from 'react';
import { Target, Ruler, MousePointer2, RefreshCcw } from 'lucide-react';

const DpiAnalyzer: React.FC = () => {
  const [targetDistance, setTargetDistance] = useState<number>(5); // Default 5cm
  const [statedDpi, setStatedDpi] = useState<number>(800);
  const [counts, setCounts] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'measuring' | 'result'>('idle');
  
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Request Pointer Lock
  const startMeasurement = async () => {
    const element = document.body;
    try {
      await (element as any).requestPointerLock({ unadjustedMovement: true });
    } catch (e) {
      element.requestPointerLock();
    }
  };

  // Spacebar to start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (statusRef.current === 'idle' && e.code === 'Space') {
        e.preventDefault();
        startMeasurement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pointer Lock Change
  useEffect(() => {
    const handleLockChange = () => {
      if (document.pointerLockElement) {
        setStatus('measuring');
        setCounts(0);
      } else {
        if (statusRef.current === 'measuring') {
          setStatus('result');
        }
      }
    };
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  // Mouse Movement & Click
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (statusRef.current === 'measuring' && document.pointerLockElement) {
        setCounts((prev) => prev + Math.abs(e.movementX));
      }
    };

    const handleMouseDown = () => {
      if (statusRef.current === 'measuring') {
        document.exitPointerLock();
      }
    };

    if (status === 'measuring') {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mousedown', handleMouseDown);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [status]);

  // Calculation
  // DPI = Counts / Inches
  // Inches = cm / 2.54
  const measuredDpi = counts > 0 ? Math.round(counts / (targetDistance / 2.54)) : 0;
  const deviation = statedDpi > 0 ? ((measuredDpi - statedDpi) / statedDpi) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 p-8 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 mb-8 text-indigo-400">
          <Target size={28} />
          <h2 className="text-2xl font-bold text-white">실제 DPI 정밀 분석기</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">스펙상 DPI</label>
              <input
                type="number"
                value={statedDpi}
                onChange={(e) => setStatedDpi(Number(e.target.value))}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">측정 목표 거리 (cm)</label>
              <div className="relative">
                <input
                  type="number"
                  value={targetDistance}
                  onChange={(e) => setTargetDistance(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <Ruler className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * 자를 대고 정확히 이 거리만큼 이동하세요. 거리가 길수록 오차가 줄어듭니다.
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 flex flex-col items-center justify-center text-center border border-gray-800">
            {status === 'idle' && (
              <>
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <MousePointer2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">측정 대기</h3>
                <p className="text-gray-400 text-sm mb-6">
                  마우스를 자의 눈금 0에 맞추고<br/>
                  <strong className="text-indigo-400">Spacebar</strong>를 눌러 시작하세요.
                </p>
                <div className="px-4 py-2 bg-gray-800 rounded-lg text-xs text-gray-500 border border-gray-700">
                  시작 후 목표 거리 이동 -&gt; 클릭하여 종료
                </div>
              </>
            )}

            {status === 'measuring' && (
              <>
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 text-indigo-400 animate-pulse">
                  <Ruler size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">측정 중...</h3>
                <p className="text-gray-300 text-sm mb-4">
                  정확히 <span className="text-white font-bold">{targetDistance}cm</span> 이동 후 클릭하세요.
                </p>
                <div className="text-4xl font-mono font-bold text-white">
                  {counts} <span className="text-sm font-normal text-gray-500">counts</span>
                </div>
              </>
            )}

            {status === 'result' && (
              <>
                <div className="text-sm text-gray-400 uppercase tracking-wider font-bold mb-2">Calculated DPI</div>
                <div className="text-6xl font-mono font-bold text-white mb-2 tracking-tighter">
                  {measuredDpi}
                </div>
                <div className={`text-sm font-mono font-bold px-3 py-1 rounded-full border ${
                  Math.abs(deviation) < 5 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                  'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  오차율: {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
                </div>
                <button 
                  onClick={() => { setStatus('idle'); setCounts(0); }}
                  className="mt-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <RefreshCcw size={14} /> 다시 측정
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
          <h4 className="text-sm font-bold text-gray-300 mb-2">💡 DPI 오차란?</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            마우스 제조사가 표기한 800 DPI가 실제로는 780이나 820일 수 있습니다. 
            이 오차는 동일한 감도 설정을 해도 다른 마우스로 바꿨을 때 느낌이 다른 주된 원인입니다. 
            이곳에서 실제 DPI를 측정한 후, 감도 계산기에 <strong>입력 DPI</strong> 대신 <strong>실제 DPI</strong>를 넣으면 더 완벽한 감도를 찾을 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DpiAnalyzer;
