
import React, { useState, useEffect } from 'react';
import { MousePointerClick, ChevronUp, ChevronDown } from 'lucide-react';

type ButtonState = {
  left: boolean;
  right: boolean;
  middle: boolean;
  side1: boolean;
  side2: boolean;
  wheelUp: boolean;
  wheelDown: boolean;
};

const InputTester: React.FC = () => {
  const [activeButtons, setActiveButtons] = useState<ButtonState>({
    left: false, right: false, middle: false, side1: false, side2: false, wheelUp: false, wheelDown: false
  });
  
  const [history, setHistory] = useState<string[]>([]);

  const addToHistory = (action: string) => {
    setHistory(prev => [action, ...prev].slice(0, 8));
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      let key: keyof ButtonState | null = null;
      let name = '';

      switch(e.button) {
        case 0: key = 'left'; name = 'Left Click'; break;
        case 1: key = 'middle'; name = 'Middle Click'; break;
        case 2: key = 'right'; name = 'Right Click'; break;
        case 3: key = 'side1'; name = 'Back (Side)'; break;
        case 4: key = 'side2'; name = 'Forward (Side)'; break;
      }

      if (key) {
        setActiveButtons(prev => ({ ...prev, [key!]: true }));
        addToHistory(name);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      let key: keyof ButtonState | null = null;
      switch(e.button) {
        case 0: key = 'left'; break;
        case 1: key = 'middle'; break;
        case 2: key = 'right'; break;
        case 3: key = 'side1'; break;
        case 4: key = 'side2'; break;
      }
      if (key) {
        setActiveButtons(prev => ({ ...prev, [key!]: false }));
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setActiveButtons(prev => ({ ...prev, wheelUp: true }));
        addToHistory('Scroll Up');
        setTimeout(() => setActiveButtons(prev => ({ ...prev, wheelUp: false })), 150);
      } else {
        setActiveButtons(prev => ({ ...prev, wheelDown: true }));
        addToHistory('Scroll Down');
        setTimeout(() => setActiveButtons(prev => ({ ...prev, wheelDown: false })), 150);
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const area = document.getElementById('input-test-area');
    if (area) {
      area.addEventListener('mousedown', handleMouseDown);
      area.addEventListener('mouseup', handleMouseUp);
      area.addEventListener('wheel', handleWheel as any, { passive: false });
      area.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      if (area) {
        area.removeEventListener('mousedown', handleMouseDown);
        area.removeEventListener('mouseup', handleMouseUp);
        area.removeEventListener('wheel', handleWheel as any);
        area.removeEventListener('contextmenu', handleContextMenu);
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 p-8 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 mb-8 text-blue-400">
          <MousePointerClick size={28} />
          <h2 className="text-2xl font-bold text-white">버튼 및 휠 테스트</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Visual Mouse */}
          <div 
            id="input-test-area"
            className="bg-gray-900 rounded-2xl p-8 flex items-center justify-center min-h-[400px] cursor-none border-2 border-transparent hover:border-blue-500/30 transition-all relative select-none"
          >
            <p className="absolute top-4 text-gray-500 text-sm">이 영역 안에서 클릭하세요</p>
            
            {/* SVG Mouse Representation */}
            <div className="relative w-48 h-80">
              {/* Body / Base */}
              <div className="absolute inset-0 bg-gray-800 rounded-[3rem] border-4 border-gray-700 shadow-2xl"></div>

              {/* Left Button */}
              <div className={`absolute top-0 left-0 w-1/2 h-32 border-4 border-gray-700 rounded-tl-[3rem] transition-all duration-75 ${activeButtons.left ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-gray-750'}`}></div>

              {/* Right Button */}
              <div className={`absolute top-0 right-0 w-1/2 h-32 border-4 border-gray-700 rounded-tr-[3rem] transition-all duration-75 ${activeButtons.right ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-gray-750'}`}></div>

              {/* Middle / Scroll */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-16 bg-gray-900 rounded-full border-2 border-gray-800 flex flex-col items-center justify-center gap-1 overflow-hidden">
                 {/* Wheel Up Indicator */}
                 <div className={`transition-all duration-75 ${activeButtons.wheelUp ? 'text-blue-400 translate-y-[-2px]' : 'text-gray-700'}`}>
                   <ChevronUp size={14} strokeWidth={4} />
                 </div>
                 {/* Wheel Click Indicator (Middle) */}
                 <div className={`w-3 h-5 rounded-sm transition-all duration-75 ${activeButtons.middle ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                 {/* Wheel Down Indicator */}
                 <div className={`transition-all duration-75 ${activeButtons.wheelDown ? 'text-blue-400 translate-y-[2px]' : 'text-gray-700'}`}>
                   <ChevronDown size={14} strokeWidth={4} />
                 </div>
              </div>

              {/* Side Buttons (Left Side) */}
              <div className={`absolute top-40 left-[-8px] w-4 h-12 rounded-l-md border border-gray-700 transition-all duration-75 ${activeButtons.side2 ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
              <div className={`absolute top-56 left-[-8px] w-4 h-12 rounded-l-md border border-gray-700 transition-all duration-75 ${activeButtons.side1 ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
              
              {/* Palm Glow */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <div className="text-gray-600 font-bold tracking-widest opacity-20 text-xl">MOUSE</div>
              </div>
            </div>
          </div>

          {/* Event Log */}
          <div className="flex flex-col h-full">
            <h3 className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-wider">Input Log</h3>
            <div className="flex-1 bg-gray-900/50 rounded-xl border border-gray-800 p-4 space-y-2 overflow-hidden">
              {history.map((action, i) => (
                <div key={i} className="flex items-center gap-3 text-sm animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span className={i === 0 ? 'text-white font-bold' : 'text-gray-500'}>{action}</span>
                  {i === 0 && <span className="text-xs text-blue-500 bg-blue-500/10 px-2 rounded ml-auto">New</span>}
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-gray-600 text-center py-10 italic">입력 대기 중...</div>
              )}
            </div>
            <div className="mt-4 text-xs text-gray-500">
              * 마우스 우클릭 및 휠 스크롤 시 브라우저 기본 동작이 차단됩니다. (테스트 영역 내부만)
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InputTester;
