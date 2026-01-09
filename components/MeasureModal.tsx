import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MousePointer2, CheckCircle2, XCircle, Ruler, Keyboard } from 'lucide-react';

interface MeasureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (counts: number) => void;
  dpi: number;
}

const MeasureModal: React.FC<MeasureModalProps> = ({ isOpen, onClose, onComplete, dpi }) => {
  const [counts, setCounts] = useState(0);
  const [status, setStatus] = useState<'intro' | 'measuring' | 'result'>('intro');
  
  // Ref to track status inside event listeners without dependency issues
  const statusRef = useRef<'intro' | 'measuring' | 'result'>('intro');

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Calculate realtime CM for display purposes
  const currentCm = ((counts / dpi) * 2.54).toFixed(1);

  // 1. Function to Start Measurement (Request Pointer Lock)
  const startMeasurement = async () => {
    const element = document.body; // Lock to body to ensure it works everywhere
    try {
      // Try raw input first (better for gaming mice)
      await (element as any).requestPointerLock({ unadjustedMovement: true });
    } catch (e) {
      // Fallback
      element.requestPointerLock();
    }
  };

  // 2. Handle Spacebar to Start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (statusRef.current === 'intro' && e.code === 'Space') {
        e.preventDefault();
        startMeasurement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 3. Handle Pointer Lock State Changes (Source of Truth for Status)
  useEffect(() => {
    const handleLockChange = () => {
      if (document.pointerLockElement) {
        // Lock acquired -> Start measuring
        setStatus('measuring');
        setCounts(0);
      } else {
        // Lock lost -> Stop measuring
        if (statusRef.current === 'measuring') {
          setStatus('result');
        }
      }
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  // 4. Handle Mouse Movement (Counting) & Click (Stop)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (statusRef.current === 'measuring' && document.pointerLockElement) {
        // Accumulate movement
        setCounts((prev) => prev + Math.abs(e.movementX));
      }
    };

    const handleMouseDown = () => {
      if (statusRef.current === 'measuring') {
        document.exitPointerLock(); // This triggers pointerlockchange -> sets status to result
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

  const confirmResult = () => {
    onComplete(counts);
    onClose();
    // Reset internal state after animation/close
    setTimeout(() => {
      setStatus('intro');
      setCounts(0);
    }, 200);
  };

  const resetMeasurement = () => {
    setStatus('intro');
    setCounts(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden p-8 text-center relative selection:bg-none select-none">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <XCircle size={24} />
        </button>

        {/* INTRO STATE */}
        {status === 'intro' && (
          <div className="space-y-8 py-4">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20">
              <MousePointer2 size={40} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">자동 거리 측정</h2>
              <p className="text-gray-400 text-lg">
                마우스를 패드의 <strong>왼쪽 끝</strong>에 위치시키세요.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex items-center gap-3 px-6 py-4 bg-gray-800 rounded-xl border border-gray-700 animate-pulse">
                <Keyboard size={24} className="text-gray-400" />
                <span className="text-xl font-bold text-white">Spacebar</span>
                <span className="text-gray-400">를 눌러 시작</span>
              </div>
              <p className="text-sm text-gray-500">
                시작 후 오른쪽 끝까지 이동하고 <strong>클릭</strong>하면 끝납니다.
              </p>
            </div>
          </div>
        )}

        {/* MEASURING STATE */}
        {status === 'measuring' && (
          <div className="space-y-8 py-4 cursor-none">
            <div className="animate-bounce text-indigo-400">
              <Ruler size={48} className="mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-white">측정 중...</h2>
            
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 max-w-sm mx-auto">
              <div className="text-7xl font-mono font-bold text-white tracking-tighter tabular-nums">
                {currentCm}<span className="text-2xl text-gray-500 ml-2">cm</span>
              </div>
            </div>

            <div className="text-lg text-gray-300">
              이동이 끝나면 <strong className="text-indigo-400 border-b border-indigo-400">클릭</strong>하여 멈추세요.
            </div>
          </div>
        )}

        {/* RESULT STATE */}
        {status === 'result' && (
          <div className="space-y-8 py-4">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={40} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">측정 완료</h2>
              <p className="text-gray-400">측정된 패드 사용 범위입니다.</p>
            </div>

            <div className="bg-gradient-to-b from-gray-800 to-gray-800/50 p-8 rounded-2xl border border-gray-700 max-w-sm mx-auto">
               <div className="text-sm text-gray-500 mb-2 uppercase tracking-wider font-bold">Measured Distance</div>
               <div className="text-5xl font-mono font-bold text-white tabular-nums">{currentCm} cm</div>
               <div className="text-xs text-gray-500 mt-4 font-mono">Counts: {counts} / DPI: {dpi}</div>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <button 
                onClick={resetMeasurement}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors font-medium"
              >
                다시 측정 (Space)
              </button>
              <button 
                onClick={confirmResult}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105"
              >
                적용하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasureModal;