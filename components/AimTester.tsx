
import React, { useState, useEffect, useRef } from 'react';
import { Crosshair, Settings, RotateCw, Play, MousePointer2, RefreshCcw, XCircle, Info, ArrowUpDown } from 'lucide-react';
import { GAMES, DEFAULT_GAME_ID } from '../constants';

const AimTester: React.FC = () => {
  // Settings
  const [selectedGameId, setSelectedGameId] = useState<string>(DEFAULT_GAME_ID);
  const [sensitivity, setSensitivity] = useState<number>(0.3);
  const [fov, setFov] = useState<number>(103);
  const [invertY, setInvertY] = useState<boolean>(false);
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'ruler' | 'reflex'>('ruler');
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState<{x: number, y: number, id: number, born: number}[]>([]);
  
  // Refs for engine
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const angleRef = useRef<{yaw: number, pitch: number}>({ yaw: 0, pitch: 0 });
  const lastTimeRef = useRef<number>(0);

  const selectedGame = GAMES.find(g => g.id === selectedGameId) || GAMES[0];

  // Auto-update FOV when game changes
  useEffect(() => {
    setFov(selectedGame.defaultFov);
  }, [selectedGameId]);

  // Helper: Projection (3D World -> 2D Screen)
  // Simple rectilinear projection
  const project = (yaw: number, pitch: number, width: number, height: number) => {
    // Relative angle to camera
    let relYaw = yaw - angleRef.current.yaw;
    let relPitch = pitch - angleRef.current.pitch;

    // Normalize yaw to -180 ~ 180
    while (relYaw > 180) relYaw -= 360;
    while (relYaw < -180) relYaw += 360;

    // Check if behind camera
    if (Math.abs(relYaw) > 90) return null;

    const radFov = (fov * Math.PI) / 180;
    const focalLength = (width / 2) / Math.tan(radFov / 2);

    const x = (Math.tan(relYaw * Math.PI / 180) * focalLength) + (width / 2);
    const y = (height / 2) - (Math.tan(relPitch * Math.PI / 180) * focalLength);

    return { x, y };
  };

  const spawnTarget = () => {
    // Spawn target within reasonable FOV range (-40 to 40 degrees yaw/pitch)
    const yaw = (Math.random() * 80) - 40 + angleRef.current.yaw;
    const pitch = (Math.random() * 40) - 20; // Keep roughly vertically centered
    setTargets(prev => [...prev, { 
      x: yaw, // Store as angles
      y: pitch, 
      id: Date.now() + Math.random(),
      born: Date.now()
    }]);
  };

  const handleCanvasClick = () => {
    if (!isPlaying) return;

    if (mode === 'reflex') {
       // Check hit (simple angle distance check for "hitbox")
       // Hitbox size approx 3 degrees radius
       const HIT_RADIUS = 4; 
       
       const hitIndex = targets.findIndex(t => {
         let dYaw = t.x - angleRef.current.yaw;
         while (dYaw > 180) dYaw -= 360;
         while (dYaw < -180) dYaw += 360;
         
         const dPitch = t.y - angleRef.current.pitch;
         // Approximate Euclidean distance in angle space
         return Math.sqrt(dYaw*dYaw + dPitch*dPitch) < HIT_RADIUS;
       });

       if (hitIndex !== -1) {
         // Hit!
         const newTargets = [...targets];
         newTargets.splice(hitIndex, 1);
         setTargets(newTargets);
         setScore(s => s + 1);
         spawnTarget(); // Immediate respawn
       } else {
         // Miss (optional penalty)
       }
    }
  };

  // Game Loop
  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to match display size
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.fillStyle = '#111827'; // Gray 900
    ctx.fillRect(0, 0, w, h);

    // Draw Grid (Horizon & Verticals)
    ctx.strokeStyle = '#374151'; // Gray 700
    ctx.lineWidth = 1;

    // Horizon
    const horizon = project(0, 0, w, h); // Just to get Y level if pitch changes
    if (horizon || angleRef.current.pitch !== 0) {
       // Calculate horizon Y based on pitch alone
       const radFov = (fov * Math.PI) / 180;
       const focalLength = (w / 2) / Math.tan(radFov / 2);
       const horY = (h / 2) + (Math.tan(angleRef.current.pitch * Math.PI / 180) * focalLength);
       
       ctx.beginPath();
       ctx.moveTo(0, horY);
       ctx.lineTo(w, horY);
       ctx.stroke();
    }

    // Vertical Lines (Every 45 degrees)
    ctx.font = '12px "JetBrains Mono"';
    ctx.textAlign = 'center';
    
    for (let i = -360; i <= 360; i += 45) {
      const pos = project(i, 0, w, h);
      if (pos) {
        ctx.beginPath();
        ctx.moveTo(pos.x, 0);
        ctx.lineTo(pos.x, h);
        ctx.strokeStyle = i === 0 ? '#ef4444' : '#374151'; // Red for 0
        ctx.stroke();

        ctx.fillStyle = i === 0 ? '#ef4444' : '#6b7280';
        ctx.fillText(`${i}°`, pos.x, h/2 + 20);
      }
    }

    // Draw Targets (Reflex Mode)
    if (mode === 'reflex') {
      targets.forEach(t => {
        const pos = project(t.x, t.y, w, h);
        if (pos) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2); // Visual size
          ctx.fillStyle = '#06b6d4'; // Cyan
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
      
      // Auto-spawn if empty
      if (targets.length < 3 && isPlaying) {
        if (Math.random() < 0.05) spawnTarget();
      }
    }

    // Draw Ruler Info (Ruler Mode)
    if (mode === 'ruler') {
      const currentYaw = angleRef.current.yaw.toFixed(1);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(w/2 - 60, h/2 + 40, 120, 30);
      
      ctx.fillStyle = '#10b981'; // Emerald
      ctx.font = 'bold 16px "JetBrains Mono"';
      ctx.fillText(`YAW: ${currentYaw}°`, w/2, h/2 + 60);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px sans-serif';
      ctx.fillText('Move mouse to verify rotation', w/2, h/2 + 80);
    }

    // Draw Crosshair
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w/2 - 10, h/2);
    ctx.lineTo(w/2 + 10, h/2);
    ctx.moveTo(w/2, h/2 - 10);
    ctx.lineTo(w/2, h/2 + 10);
    ctx.stroke();

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [fov, mode, targets, isPlaying]);

  // Input Handling
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return;

      // Sensitivity Formula:
      // Delta Angle = counts * GameYaw * Sensitivity
      // Note: We assume "Sensitivity" entered is the in-game setting value.
      
      // Standard FPS: Mouse Right -> Yaw Increase (Turn Right) -> Yaw -= (-MoveX)
      // Actually standard FPS: Mouse Right (MoveX > 0) -> Yaw Increases -> View turns Right.
      // In our projection: relYaw = Target - Camera. If Camera Yaw Increases, relYaw Decreases. Target Moves Left.
      // So to turn Right, we need Yaw to Increase.
      const yawChange = e.movementX * selectedGame.yaw * sensitivity;
      angleRef.current.yaw += yawChange; 

      // Standard FPS: Mouse Down (MoveY > 0) -> Pitch Decreases (Look Down)
      // In our projection: relPitch = Target - Camera. If Camera Pitch Decreases (Negative), relPitch Increases.
      // y = H/2 - tan(relPitch). If relPitch Increases, y Decreases (Moves UP screen).
      // Wait. If I look Down (Pitch -30), Target at 0 becomes Relative +30.
      // tan(30) is pos. y = Center - pos = Upper half.
      // So Target moves UP when I look DOWN. This is correct.
      // So Mouse Down (MoveY > 0) should decrease Pitch.
      
      const rawPitchChange = e.movementY * selectedGame.yaw * sensitivity;
      // If invertY is true (Flight/Inverted), Mouse Down -> Look Up (Pitch Increase)
      // If invertY is false (Standard), Mouse Down -> Look Down (Pitch Decrease)
      const pitchDirection = invertY ? 1 : -1;
      
      angleRef.current.pitch += rawPitchChange * pitchDirection;

      // Clamp Pitch
      angleRef.current.pitch = Math.max(-89, Math.min(89, angleRef.current.pitch));
      
      // Keep Yaw readable
      // angleRef.current.yaw = angleRef.current.yaw % 360; 
      // Actually, for ruler test, accumulating > 360 is fine, but let's normalize for the grid
    };

    const handleLockChange = () => {
      if (document.pointerLockElement) {
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, [selectedGame, sensitivity, invertY]); // Re-bind when invertY changes

  const toggleLock = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (document.pointerLockElement) {
      document.exitPointerLock();
    } else {
      canvas.requestPointerLock();
      if (mode === 'reflex' && targets.length === 0) {
        spawnTarget();
        setScore(0);
        // Reset view
        angleRef.current = { yaw: 0, pitch: 0 };
      }
      if (mode === 'ruler') {
        // Reset view for ruler check
        angleRef.current = { yaw: 0, pitch: 0 };
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 p-6 rounded-2xl shadow-xl flex flex-col gap-6">
        
        {/* Header & Settings */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-gray-700">
           <div className="flex items-center gap-3 text-rose-400 shrink-0">
             <Crosshair size={28} />
             <div>
               <h2 className="text-2xl font-bold text-white">에임 시뮬레이터</h2>
               <p className="text-xs text-gray-400">계산된 감도를 브라우저에서 직접 테스트하세요.</p>
             </div>
           </div>

           <div className="flex flex-wrap items-end gap-4">
             <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">게임 프리셋</label>
               <select 
                 value={selectedGameId}
                 onChange={(e) => setSelectedGameId(e.target.value)}
                 className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:ring-2 focus:ring-rose-500 outline-none w-32"
               >
                 {GAMES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
               </select>
             </div>
             
             <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">인게임 감도</label>
               <input 
                 type="number" 
                 value={sensitivity}
                 onChange={(e) => setSensitivity(Number(e.target.value))}
                 step="0.01"
                 className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white w-24 focus:ring-2 focus:ring-rose-500 outline-none"
               />
             </div>

             <div>
               <div className="flex items-center gap-1 mb-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">FOV</label>
                 <div className="group relative">
                   <Info size={12} className="text-gray-500 hover:text-white cursor-help" />
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 border border-gray-700 p-2 rounded text-xs text-gray-300 hidden group-hover:block z-50">
                     화면에 보이는 가로 범위입니다. <br/>
                     보통 103도(발로란트/옵치)를 사용합니다.
                   </div>
                 </div>
               </div>
               <input 
                 type="number" 
                 value={fov}
                 onChange={(e) => setFov(Number(e.target.value))}
                 className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white w-20 focus:ring-2 focus:ring-rose-500 outline-none"
               />
             </div>

             <div className="flex flex-col justify-end">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">컨트롤 설정</label>
                <button 
                  onClick={() => setInvertY(!invertY)}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all border ${
                    invertY 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                      : 'bg-gray-900 border-gray-600 text-gray-400 hover:text-white'
                  }`}
                >
                  <ArrowUpDown size={16} />
                  <span>{invertY ? 'Y축 반전됨' : 'Y축 표준'}</span>
                </button>
             </div>
           </div>
        </div>

        {/* Mode Select */}
        <div className="flex gap-4">
          <button 
            onClick={() => setMode('ruler')}
            className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${mode === 'ruler' ? 'bg-rose-600/20 border-rose-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'}`}
          >
            <RotateCw size={18} />
            <div className="text-left">
              <div className="font-bold text-sm">각도 검증 (Ruler)</div>
              <div className="text-xs opacity-70">360/180도 회전 거리 확인</div>
            </div>
          </button>
          <button 
            onClick={() => setMode('reflex')}
            className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${mode === 'reflex' ? 'bg-cyan-600/20 border-cyan-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'}`}
          >
            <Play size={18} />
             <div className="text-left">
              <div className="font-bold text-sm">플릭 테스트 (Reflex)</div>
              <div className="text-xs opacity-70">에임랩 스타일 타겟 연습</div>
            </div>
          </button>
        </div>

        {/* Canvas Area */}
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-inner border border-gray-700 group">
          <canvas 
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-none block"
          />
          
          {/* Overlay UI when not locked */}
          {!isPlaying && (
            <div 
              onClick={toggleLock}
              className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm z-10 cursor-pointer hover:bg-black/50 transition-colors"
            >
              <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center mb-6 text-white shadow-lg shadow-rose-500/50 animate-pulse">
                <MousePointer2 size={32} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">클릭하여 시작</h3>
              <p className="text-gray-300 max-w-md">
                {mode === 'ruler' 
                  ? '마우스를 움직여 실제 패드 이동 거리가 화면의 회전 각도와 일치하는지 확인하세요.' 
                  : '나타나는 타겟을 빠르게 클릭하여 감도가 적절한지 테스트하세요.'}
              </p>
              <div className="mt-8 flex items-center gap-2 text-sm text-gray-500 bg-black/40 px-4 py-2 rounded-full border border-gray-800">
                <Settings size={14} />
                <span>ESC를 누르면 커서가 다시 나타납니다.</span>
              </div>
            </div>
          )}

          {/* HUD - Reflex Mode */}
          {isPlaying && mode === 'reflex' && (
            <div className="absolute top-4 left-4 flex gap-4">
              <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-lg border border-white/10 text-white font-mono">
                <span className="text-gray-400 text-xs mr-2">SCORE</span>
                <span className="text-xl font-bold">{score}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="bg-gray-900/50 p-4 rounded-lg text-sm text-gray-400 border border-gray-800">
           <strong>사용 팁:</strong>
           <ul className="list-disc pl-5 mt-2 space-y-1">
             <li>감도 계산기 탭에서 얻은 <strong>인게임 감도</strong>를 상단 입력창에 넣으세요.</li>
             <li><strong>각도 검증 모드</strong>: 패드의 왼쪽 끝에서 시작해 오른쪽 끝까지 움직였을 때, 화면의 나침반이 정확히 원하는 각도(예: 180도)를 가리키는지 확인하세요.</li>
             <li><strong>Y축 설정</strong>: 마우스 상하 이동이 반대로 느껴진다면 상단의 'Y축 표준/반전됨' 버튼을 눌러 설정을 변경하세요.</li>
           </ul>
        </div>
      </div>
    </div>
  );
};

export default AimTester;
