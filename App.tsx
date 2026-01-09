
import React, { useState } from 'react';
import CalculatorComponent from './components/Calculator';
import DpiAnalyzer from './components/DpiAnalyzer';
import PollingRateTester from './components/PollingRateTester';
import InputTester from './components/InputTester';
import AimTester from './components/AimTester';
import { Crosshair, Calculator, Target, Activity, MousePointerClick, Gamepad2 } from 'lucide-react';

type Tab = 'calc' | 'dpi' | 'polling' | 'input' | 'aim';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('calc');

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#161b22]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 cursor-pointer shrink-0 mr-8" onClick={() => setActiveTab('calc')}>
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Crosshair size={20} strokeWidth={3} />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white hidden md:block">
              Perfect<span className="text-indigo-400">Sens</span>
            </h1>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-lg border border-gray-800 shrink-0">
            <button 
              onClick={() => setActiveTab('calc')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'calc' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <Calculator size={16} />
              <span className="hidden sm:inline">감도 계산</span>
            </button>
            <button 
              onClick={() => setActiveTab('aim')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'aim' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <Gamepad2 size={16} />
              <span className="hidden sm:inline">에임 테스트</span>
            </button>
            <button 
              onClick={() => setActiveTab('dpi')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'dpi' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <Target size={16} />
              <span className="hidden sm:inline">DPI 분석</span>
            </button>
            <button 
              onClick={() => setActiveTab('polling')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'polling' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <Activity size={16} />
              <span className="hidden sm:inline">폴링레이트</span>
            </button>
            <button 
              onClick={() => setActiveTab('input')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'input' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <MousePointerClick size={16} />
              <span className="hidden sm:inline">입력 테스트</span>
            </button>
          </nav>

          <div className="text-xs font-mono text-gray-500 hidden lg:block ml-4 shrink-0">
            v1.2.0
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 md:px-6 overflow-x-hidden">
        <div className="max-w-6xl mx-auto mb-8">
           {activeTab === 'calc' && (
             <div className="text-center space-y-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                    공간 기반
                  </span> 
                  <br className="md:hidden" /> 감도 계산기
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                  책상 크기와 마우스 패드 범위에 맞춰 <strong className="text-gray-200">완벽한 감도</strong>를 찾아드립니다.
                </p>
             </div>
           )}
           
           {/* Render Active Component */}
           {activeTab === 'calc' && <CalculatorComponent />}
           {activeTab === 'aim' && <AimTester />}
           {activeTab === 'dpi' && <DpiAnalyzer />}
           {activeTab === 'polling' && <PollingRateTester />}
           {activeTab === 'input' && <InputTester />}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800 mt-auto bg-[#161b22]">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} PerfectSens Calculator. All-in-one Mouse Toolkit.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
