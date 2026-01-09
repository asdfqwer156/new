
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap } from 'lucide-react';

const PollingRateTester: React.FC = () => {
  const [currentHz, setCurrentHz] = useState<number>(0);
  const [maxHz, setMaxHz] = useState<number>(0);
  const [averageHz, setAverageHz] = useState<number>(0);
  const [isMoving, setIsMoving] = useState(false);
  
  const timestampsRef = useRef<number[]>([]);
  const lastUpdateRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const stopTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      // Clear stop timeout if moving
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
      }
      setIsMoving(true);
      
      // Stop measuring if no movement for 100ms
      stopTimeoutRef.current = setTimeout(() => {
        setIsMoving(false);
        setCurrentHz(0);
      }, 200);

      // Get coalesced events for high precision (handles 1000Hz+ on standard monitors)
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      
      for (const ev of events) {
        timestampsRef.current.push(performance.now());
      }

      // Keep only last 1 second of data for average calculation
      const now = performance.now();
      timestampsRef.current = timestampsRef.current.filter(t => now - t <= 1000);
    };

    const updateLoop = () => {
      const now = performance.now();
      
      // Update UI every 100ms to allow reading values
      if (now - lastUpdateRef.current > 100) {
        const oneSecondCount = timestampsRef.current.length;
        
        if (oneSecondCount > 0) {
           // Instantaneous approximation based on recent density would be better for jitter
           // But counting events in last second is the most accurate definition of "Hz"
           setCurrentHz(oneSecondCount);
           
           if (oneSecondCount > maxHz) setMaxHz(oneSecondCount);
           
           // Simple average logic (accumulated) could be added here
           // For now, let's use the 1s window as the average
           setAverageHz(oneSecondCount);
        }
        lastUpdateRef.current = now;
      }
      
      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    const box = document.getElementById('polling-area');
    if (box) {
      box.addEventListener('pointermove', handlePointerMove as any);
    }

    updateLoop();

    return () => {
      if (box) box.removeEventListener('pointermove', handlePointerMove as any);
      cancelAnimationFrame(animationFrameRef.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, [maxHz]);

  const resetStats = () => {
    setMaxHz(0);
    setAverageHz(0);
    setCurrentHz(0);
    timestampsRef.current = [];
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 p-8 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 text-amber-400">
            <Activity size={28} />
            <h2 className="text-2xl font-bold text-white">폴링레이트(Hz) 테스터</h2>
          </div>
          <button 
            onClick={resetStats}
            className="text-sm text-gray-400 hover:text-white underline"
          >
            기록 초기화
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl text-center">
            <div className="text-gray-500 text-xs uppercase font-bold mb-1">Current</div>
            <div className={`text-4xl font-mono font-bold ${isMoving ? 'text-white' : 'text-gray-600'}`}>
              {currentHz} <span className="text-lg text-gray-500">Hz</span>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl text-center">
            <div className="text-gray-500 text-xs uppercase font-bold mb-1">Average</div>
            <div className="text-4xl font-mono font-bold text-indigo-400">
              {averageHz} <span className="text-lg text-gray-500">Hz</span>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl text-center">
            <div className="text-gray-500 text-xs uppercase font-bold mb-1">Peak</div>
            <div className="text-4xl font-mono font-bold text-amber-400">
              {maxHz} <span className="text-lg text-gray-500">Hz</span>
            </div>
          </div>
        </div>

        {/* Interaction Area */}
        <div 
          id="polling-area"
          className="w-full h-80 bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center cursor-crosshair hover:border-amber-500/50 hover:bg-gray-900 transition-all group relative overflow-hidden"
        >
          {/* Visualizing particles or graph could go here */}
          <Zap className={`text-gray-700 transition-all duration-75 ${isMoving ? 'text-amber-500 scale-110 opacity-100' : 'opacity-20'}`} size={64} />
          <p className="mt-4 text-gray-500 font-medium group-hover:text-gray-300">
            이 박스 안에서 마우스를 <strong>빠르게</strong> 계속 움직이세요.
          </p>
          
          {isMoving && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-full h-px bg-amber-500/20 animate-pulse"></div>
              <div className="absolute w-px h-full bg-amber-500/20 animate-pulse"></div>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-400">
          <p>
            * 웹 브라우저 환경에서는 125Hz, 500Hz, 1000Hz가 주로 측정됩니다. 
            4000Hz 이상의 고성능 마우스는 브라우저 보안/성능 제한으로 인해 정확히 측정되지 않을 수 있습니다.
            지속적인 움직임(원 그리기)이 가장 정확한 결과를 줍니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PollingRateTester;
