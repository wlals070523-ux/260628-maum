import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import confetti from 'canvas-confetti';

// Chart.js 등록
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// 감정 이모티콘 및 설정
const EMOTION_EMOJIS = ['⬜', '😊', '🤩', '😐', '😢', '😡'];
const EMOTION_NAMES = ['미정', '기쁨', '신남', '보통', '슬픔', '화남'];
const EMOTION_COLORS = ['#F3F4F6', '#FFDDC1', '#FFABAB', '#FFC3A0', '#D4A5A5', '#FF677D'];
const TAB_COLORS = [
  'bg-emerald-500', // 출석부
  'bg-sky-500',     // 차트
  'bg-indigo-500',  // 놀이터
  'bg-rose-500',    // 타이머
  'bg-amber-500',   // 주사위
  'bg-violet-500'   // 도우미
];

export default function App() {
  // --- 상태 관리 ---
  const [activeTab, setActiveTab] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendance, setAttendance] = useState<string[]>(() => {
    const saved = localStorage.getItem('zoo_attendance');
    return saved ? JSON.parse(saved) : Array(26).fill('⬜');
  });
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  // --- 시계 업데이트 ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 출석부 저장 ---
  useEffect(() => {
    localStorage.setItem('zoo_attendance', JSON.stringify(attendance));
  }, [attendance]);

  const selectEmotion = (index: number, emoji: string) => {
    const next = [...attendance];
    next[index] = emoji;
    setAttendance(next);
    setSelectedStudent(null);
  };

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${y}년 ${m}월 ${d}일 ${h}:${min}:${s}`;
  };

  return (
    <div className="min-h-screen flex flex-col select-none overflow-hidden bg-[#F9F9FB]">
      {/* 최상단 네비게이션 */}
      <header className="bg-white border-b border-gray-100 px-10 py-5 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
            🌈
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">마음출석부</h1>
        </div>
        <div className="bg-gray-50 px-8 py-3 rounded-2xl border border-gray-100 flex items-center gap-3">
          <i className="far fa-clock text-gray-400"></i>
          <span className="text-xl font-bold text-gray-600 tabular-nums">{formatDate(currentTime)}</span>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 사이드 탭 메뉴 */}
        <nav className="w-72 bg-white border-r border-gray-100 p-6 flex flex-col gap-4">
          {[
            { id: 1, icon: 'fa-clipboard-user', label: '마음 출석부', color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { id: 2, icon: 'fa-chart-pie', label: '마음 차트', color: 'text-sky-500', bg: 'bg-sky-50' },
            { id: 3, icon: 'fa-paw', label: '마음 놀이터', color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { id: 4, icon: 'fa-stopwatch', label: '캐릭터 타이머', color: 'text-rose-500', bg: 'bg-rose-50' },
            { id: 5, icon: 'fa-dice', label: '파스텔 주사위', color: 'text-amber-500', bg: 'bg-amber-50' },
            { id: 6, icon: 'fa-gift', label: '랜덤 도우미', color: 'text-violet-500', bg: 'bg-violet-50' },
          ].map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-5 px-6 py-5 rounded-[2rem] transition-all duration-300 text-xl font-black group ${
                activeTab === tab.id
                  ? `${TAB_COLORS[idx]} text-white shadow-xl scale-105`
                  : `text-gray-400 hover:bg-gray-50`
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === tab.id ? 'bg-white/20' : tab.bg}`}>
                <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'text-white' : tab.color}`}></i>
              </div>
              {tab.label}
            </button>
          ))}
          
          <div className="mt-auto p-6 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
            <p className="text-indigo-600 font-bold text-center text-sm">오늘도 서로 사랑하며<br/>행복하게 지내요! ✨</p>
          </div>
        </nav>

        {/* 탭 내용 */}
        <section className="flex-1 p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full"
            >
              {activeTab === 1 && <AttendanceTab attendance={attendance} onOpenModal={setSelectedStudent} />}
              {activeTab === 2 && <ChartTab attendance={attendance} />}
              {activeTab === 3 && <PlaygroundTab attendance={attendance} />}
              {activeTab === 4 && <TimerTab />}
              {activeTab === 5 && <DiceTab />}
              {activeTab === 6 && <HelperTab />}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* 감정 선택 모달 */}
      <AnimatePresence>
        {selectedStudent !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              className="relative bg-white rounded-[4rem] shadow-3xl p-12 w-full max-w-3xl border border-gray-100"
            >
              <button 
                onClick={() => setSelectedStudent(null)}
                className="absolute top-8 right-10 text-gray-300 hover:text-gray-500 text-4xl transition-colors"
              >
                <i className="fas fa-times-circle"></i>
              </button>

              <h3 className="text-4xl font-black text-center text-gray-800 mb-12">
                <span className="text-indigo-500">
                  {selectedStudent === 25 ? '선생님' : `${selectedStudent + 1}번 친구`}
                </span>
                , 지금 기분이 어떤가요?
              </h3>

              <div className="grid grid-cols-5 gap-6 mb-12">
                {EMOTION_EMOJIS.slice(1).map((emoji, idx) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => selectEmotion(selectedStudent, emoji)}
                    className="flex flex-col items-center gap-4"
                  >
                    <div 
                      className="w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-xl border-4 border-white transition-all"
                      style={{ backgroundColor: EMOTION_COLORS[idx + 1] }}
                    >
                      {emoji}
                    </div>
                    <span className="font-black text-gray-700 text-2xl">
                      {EMOTION_NAMES[idx + 1]}
                    </span>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => selectEmotion(selectedStudent, '⬜')}
                  className="bg-gray-50 hover:bg-gray-100 text-gray-400 px-12 py-5 rounded-3xl font-bold text-2xl transition-all shadow-sm"
                >
                  기분 지우기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- 탭 1: 마음 출석부 ---
function AttendanceTab({ attendance, onOpenModal }: { attendance: string[], onOpenModal: (i: number) => void }) {
  return (
    <div className="grid grid-cols-6 gap-8 max-w-7xl mx-auto pb-10">
      {attendance.map((emoji, i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.08, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onOpenModal(i)}
          className={`aspect-square rounded-[3rem] shadow-lg border-4 flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden group ${
            emoji === '⬜' 
              ? 'bg-white border-gray-50 hover:border-emerald-200' 
              : 'bg-white border-white'
          }`}
          style={emoji !== '⬜' ? { 
            backgroundColor: EMOTION_COLORS[EMOTION_EMOJIS.indexOf(emoji)],
            boxShadow: `0 20px 40px -10px ${EMOTION_COLORS[EMOTION_EMOJIS.indexOf(emoji)]}66`
          } : {}}
        >
          {/* 배경 장식 아이콘 */}
          <div className="absolute -bottom-4 -right-4 text-6xl opacity-10 group-hover:scale-125 transition-transform">
            {emoji === '⬜' ? '🐾' : emoji}
          </div>
          
          <span className={`text-lg font-black ${emoji === '⬜' ? 'text-gray-300' : 'text-gray-700/50'}`}>
            {i === 25 ? '선생님' : `${i + 1}번`}
          </span>
          <span className="text-6xl drop-shadow-sm">
            {emoji === '⬜' ? '🙂' : emoji}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// --- 탭 2: 마음 차트 ---
function ChartTab({ attendance }: { attendance: string[] }) {
  const counts = useMemo(() => {
    const data = Array(EMOTION_EMOJIS.length).fill(0);
    attendance.forEach(emoji => {
      const idx = EMOTION_EMOJIS.indexOf(emoji);
      if (idx !== -1) data[idx]++;
    });
    return data;
  }, [attendance]);

  const chartData = {
    labels: EMOTION_NAMES,
    datasets: [{
      data: counts,
      backgroundColor: EMOTION_COLORS,
      borderColor: '#fff',
      borderWidth: 6,
      hoverOffset: 20
    }],
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-12">
      <div className="text-center">
        <h2 className="text-4xl font-black text-gray-800 mb-2">우리 반 마음 지도</h2>
        <p className="text-gray-400 font-bold">친구들의 마음이 어떻게 모여있을까요?</p>
      </div>
      
      <div className="w-full max-w-5xl bg-white p-16 rounded-[5rem] shadow-2xl flex gap-20 items-center border border-gray-50">
        <div className="w-1/2">
          <Pie 
            data={chartData} 
            options={{ 
              plugins: { 
                legend: { display: false } 
              },
              cutout: '60%'
            }} 
          />
        </div>
        <div className="w-1/2 grid grid-cols-1 gap-5">
          {EMOTION_NAMES.slice(1).map((name, i) => (
            <div key={name} className="flex justify-between items-center bg-gray-50 px-8 py-5 rounded-[2rem] border border-gray-100 transition-all hover:scale-105">
              <div className="flex items-center gap-5">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
                  style={{ backgroundColor: EMOTION_COLORS[i + 1] }}
                >
                  {EMOTION_EMOJIS[i + 1]}
                </div>
                <span className="font-black text-gray-700 text-2xl">{name}</span>
              </div>
              <span className="text-3xl font-black text-indigo-600">{counts[i + 1]}<span className="text-lg text-gray-400 ml-1">명</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 탭 3: 마음 놀이터 ---
function PlaygroundTab({ attendance }: { attendance: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animalsRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 초기 감정 객체 생성
    animalsRef.current = attendance
      .map((emoji, i) => ({ emoji, i: i === 25 ? 'T' : i + 1 }))
      .filter(a => a.emoji !== '⬜')
      .map(a => {
        const h = canvas.height;
        let minY = 0, maxY = h;
        
        // 기분에 따른 높이 제한 설정
        if (a.emoji === '🤩') { minY = h * 0.05; maxY = h * 0.25; } // 신남: 최상단
        else if (a.emoji === '😊') { minY = h * 0.25; maxY = h * 0.45; } // 기쁨: 상단
        else if (a.emoji === '😐') { minY = h * 0.45; maxY = h * 0.65; } // 보통: 중간
        else if (a.emoji === '😢') { minY = h * 0.65; maxY = h * 0.80; } // 슬픔: 하단
        else if (a.emoji === '😡') { minY = h * 0.80; maxY = h * 0.95; } // 화남: 최하단

        return {
          ...a,
          x: Math.random() * canvas.width,
          y: minY + Math.random() * (maxY - minY),
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 1.5,
          minY,
          maxY,
          phase: Math.random() * Math.PI * 2,
        };
      });

    let animationFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 배경 가이드 라인
      ctx.setLineDash([5, 15]);
      ctx.strokeStyle = '#F3F4F6';
      ctx.lineWidth = 2;
      [0.2, 0.4, 0.6, 0.8].forEach(p => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * p);
        ctx.lineTo(canvas.width, canvas.height * p);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      ctx.font = '36px Jua';
      ctx.textAlign = 'center';

      animalsRef.current.forEach(animal => {
        // 움직임 패턴 정의
        if (animal.emoji === '🤩') {
          animal.phase += 0.15;
          animal.x += animal.vx * 1.8;
          animal.y = animal.minY + (Math.sin(animal.phase) + 1) * 0.5 * (animal.maxY - animal.minY);
        } else if (animal.emoji === '😊') {
          animal.phase += 0.04;
          animal.x += animal.vx * 1.2;
          animal.y = animal.minY + (Math.sin(animal.phase) + 1) * 0.5 * (animal.maxY - animal.minY);
        } else if (animal.emoji === '😐') {
          animal.x += animal.vx * 0.8;
          animal.y += animal.vy * 0.8;
        } else if (animal.emoji === '😢') {
          animal.x += animal.vx * 0.4;
          animal.y += 0.3; // 가라앉음
          if (animal.y > animal.maxY) animal.y = animal.minY;
        } else if (animal.emoji === '😡') {
          animal.phase += 0.4;
          animal.x += animal.vx * 3;
          animal.y = animal.minY + (Math.cos(animal.phase) + 1) * 0.5 * (animal.maxY - animal.minY);
        }

        // 벽 충돌 (X축)
        if (animal.x < 50 || animal.x > canvas.width - 50) animal.vx *= -1;
        
        // 높이 제한 (Y축)
        if (animal.y < animal.minY) animal.y = animal.minY;
        if (animal.y > animal.maxY) animal.y = animal.maxY;

        // 그리기
        ctx.save();
        ctx.translate(animal.x, animal.y);
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
        ctx.fillText(animal.emoji, 0, 0);
        ctx.shadowBlur = 0;
        ctx.font = '16px Jua';
        ctx.fillStyle = '#9CA3AF';
        ctx.fillText(animal.i.toString(), 0, 25);
        ctx.restore();
      });

      animationFrame = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [attendance]);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-gray-800 mb-2">마음 놀이터</h2>
          <p className="text-gray-400 font-bold">기분에 따라 친구들이 노는 높이가 달라요! 🎈</p>
        </div>
        <div className="flex gap-4 text-sm font-bold">
          <span className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-full">🤩 신남 (하늘)</span>
          <span className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full">😡 화남 (바닥)</span>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-[4rem] shadow-2xl border border-gray-50 overflow-hidden relative">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}

// --- 탭 4: 캐릭터 타이머 ---
function TimerTab() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playAlarm();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTimer = (seconds: number) => {
    setInitialTime(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
  };

  const playAlarm = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.3);
    oscillator.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.6);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1.2);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const progress = initialTime > 0 ? (timeLeft / initialTime) * 100 : 100;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-12">
      <h2 className="text-4xl font-black text-gray-800">집중 캐릭터 타이머</h2>
      <div className="bg-white p-16 rounded-[5rem] shadow-2xl flex flex-col items-center gap-12 w-full max-w-2xl border border-gray-50">
        <div className="relative w-full h-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-rose-100"
            animate={{ width: `${100 - progress}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 text-7xl z-10"
            animate={{ left: `${100 - progress}%` }}
            style={{ x: '-50%' }}
          >
            🐰
          </motion.div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-5xl">🥕</div>
        </div>

        <div className="text-[10rem] font-black text-rose-500 tabular-nums leading-none drop-shadow-sm">
          {formatTime(timeLeft)}
        </div>

        <div className="flex gap-6">
          {[60, 180, 300, 600].map(s => (
            <button
              key={s}
              onClick={() => startTimer(s)}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-10 py-5 rounded-3xl font-black text-2xl transition-all hover:scale-105"
            >
              {s / 60}분
            </button>
          ))}
          <button
            onClick={() => { setIsActive(false); setTimeLeft(0); }}
            className="bg-gray-50 hover:bg-gray-100 text-gray-400 px-10 py-5 rounded-3xl font-black text-2xl"
          >
            리셋
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 탭 5: 파스텔 주사위 ---
function DiceTab() {
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setTimeout(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      setIsRolling(false);
    }, 1000);
  };

  const diceIcons = [
    'fa-dice-one', 'fa-dice-two', 'fa-dice-three',
    'fa-dice-four', 'fa-dice-five', 'fa-dice-six'
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-16">
      <h2 className="text-4xl font-black text-gray-800">행운의 주사위</h2>
      <div className="relative">
        <motion.div
          animate={isRolling ? {
            rotate: [0, 180, 360, 540, 720],
            scale: [1, 1.3, 0.7, 1.2, 1],
            y: [0, -100, 0, -40, 0]
          } : {}}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="bg-white w-80 h-80 rounded-[4rem] shadow-3xl flex items-center justify-center border-[12px] border-amber-50 cursor-pointer"
          onClick={rollDice}
        >
          <i className={`fas ${diceIcons[diceValue - 1]} text-[12rem] text-amber-400`}></i>
        </motion.div>
        {isRolling && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-3xl font-black text-amber-500 animate-bounce">
            데굴데굴... 🎲
          </div>
        )}
      </div>
      <button
        onClick={rollDice}
        disabled={isRolling}
        className="bg-amber-500 hover:bg-amber-600 text-white px-16 py-7 rounded-[2.5rem] font-black text-3xl shadow-2xl transition-all active:scale-95 disabled:opacity-50"
      >
        주사위 던지기!
      </button>
    </div>
  );
}

// --- 탭 6: 랜덤 도우미 ---
function HelperTab() {
  const [winner, setWinner] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinner(null);
    const newRotation = rotation + 1800 + Math.random() * 360;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const winNum = Math.floor(Math.random() * 25) + 1;
      setWinner(winNum);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#A78BFA', '#F472B6', '#60A5FA', '#34D399', '#FBBF24']
      });
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-12">
      <div className="text-center">
        <h2 className="text-5xl font-black text-violet-600 mb-4">행복한 우리 반</h2>
        <p className="text-gray-400 font-bold text-xl">오늘의 행운의 주인공은 누구일까요? ✨</p>
      </div>
      
      <div className="relative w-96 h-96">
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "circOut" }}
          className="w-full h-full rounded-full border-[12px] border-white shadow-3xl overflow-hidden relative"
          style={{ background: 'conic-gradient(#A78BFA 0% 20%, #F472B6 20% 40%, #60A5FA 40% 60%, #34D399 60% 80%, #FBBF24 80% 100%)' }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full shadow-lg z-20 border-4 border-violet-100" />
          </div>
        </motion.div>
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-t-[50px] border-t-violet-600 z-30 drop-shadow-md" />
      </div>

      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-4xl font-black text-violet-500 mb-3">🎉 오늘의 도우미 당첨! 🎉</div>
            <div className="text-8xl font-black text-gray-800 bg-violet-50 px-12 py-4 rounded-[3rem] border-4 border-violet-200 inline-block">
              {winner}번 친구
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={spin}
        disabled={isSpinning}
        className="bg-violet-600 hover:bg-violet-700 text-white px-20 py-8 rounded-[3rem] font-black text-4xl shadow-3xl transition-all active:scale-95 disabled:opacity-50"
      >
        {isSpinning ? '두구두구...' : '행운 뽑기!'}
      </button>
    </div>
  );
}
