"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Lucky Spin functionality has been disabled/removed as requested.
export default function SpinPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
}

/*
// ========================================================
// --- COMMENTED OUT SPIN FUNCTIONALITY (PREVIOUS CODE) ---
// ========================================================
import { useState, useRef } from "react";
import { ArrowLeft, Volume2, VolumeX, History, Gift, Ticket, HelpCircle, X, Wallet, Sparkles } from "lucide-react";
import { useFetchData, usePost } from "@/hooks/useApi";
import HowToPlayModal from "@/components/HowToPlayModal";
import { toast } from "sonner";
import dayjs from "dayjs";

function LegacySpinPage() {
  const router = useRouter();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);
  const rotationRef = useRef(0);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Custom Result Modal State
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState({ isWin: false, amount: 0, message: "" });
  
  const audioCtxRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
    return () => {
      if (audioCtxRef.current?.state !== 'closed') {
        audioCtxRef.current?.close().catch(() => {});
      }
    };
  }, []);

  const playTone = (freq, duration, type = 'sine', vol = 0.3) => {
    if (isMuted || !audioCtxRef.current) return;
    try {
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = type;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch(e) {}
  };
  
  const playTick = () => playTone(1200, 0.03, 'square', 0.15);
  const playSpinStart = () => playTone(300, 0.3, 'sine', 0.2);
  const playWin = () => {
      setTimeout(() => playTone(523, 0.15, 'sine', 0.4), 0);
      setTimeout(() => playTone(659, 0.15, 'sine', 0.4), 100);
      setTimeout(() => playTone(784, 0.3, 'sine', 0.5), 200);
  };
  
  // Confetti setup
  const confettiCanvasRef = useRef(null);
  const confettiRef = useRef(null);

  useEffect(() => {
    if (!confettiCanvasRef.current) return;
    class Confetti {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.running = false;
        }
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
        launch(count = 150) {
            this.resize();
            this.canvas.style.display = 'block';
            this.particles = [];
            const colors = ['#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#10b981', '#06b6d4'];
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: -20 - Math.random() * 200,
                    size: Math.random() * 10 + 4,
                    speedY: Math.random() * 4 + 2,
                    speedX: (Math.random() - 0.5) * 6,
                    rotation: Math.random() * 360,
                    rotSpeed: (Math.random() - 0.5) * 15,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    shape: Math.random() > 0.5 ? 'rect' : 'circle'
                });
            }
            this.running = true;
            this.animate();
        }
        animate() {
            if (!this.running) return;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            let active = 0;
            this.particles.forEach(p => {
                if (p.y < this.canvas.height + 50) {
                    active++;
                    p.y += p.speedY;
                    p.x += p.speedX;
                    p.rotation += p.rotSpeed;
                    p.speedY += 0.15;
                    this.ctx.save();
                    this.ctx.translate(p.x, p.y);
                    this.ctx.rotate(p.rotation * Math.PI / 180);
                    this.ctx.fillStyle = p.color;
                    if (p.shape === 'rect') {
                        this.ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
                    } else {
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, p.size/2, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                    this.ctx.restore();
                }
            });
            if (active > 0) {
                requestAnimationFrame(() => this.animate());
            } else {
                this.running = false;
                this.canvas.style.display = 'none';
            }
        }
    }
    confettiRef.current = new Confetti(confettiCanvasRef.current);
  }, []);
  
  // Fetch spin data
  const { data: spinRes, isLoading, refetch } = useFetchData('/users/spin');
  const postSpin = usePost('/users/spin', null, false, { showToast: false });
  const { data: settingsRes } = useFetchData('/settings', ['platform-settings']);
  const settings = settingsRes?.settings || {};

  const spinData = spinRes?.data;
  
  const currentBalance = spinData?.accountBalance || 0;
  const freeSpins = spinData?.userSpins?.free_spins_remaining || 0;
  const cost = Number(spinData?.settings?.cost_per_spin || 0);

  // Dynamic segments from backend: 8 equal slices
  let basePrizes = spinData?.prizes || [];
  let displaySegments = [];

  for (let i = 0; i < 8; i++) {
    if (basePrizes[i]) {
      displaySegments.push({
        label: basePrizes[i].name,
        color: i % 2 === 0 ? "#ffffff" : "#fef9ee",
        id: basePrizes[i].id,
        value: Number(basePrizes[i].value),
        originalIndex: i
      });
    } else {
      displaySegments.push({
        label: "0.00",
        color: i % 2 === 0 ? "#ffffff" : "#fef9ee",
        id: `empty-${i}`,
        value: 0,
        originalIndex: i
      });
    }
  }

  const segments = displaySegments;
  const segmentDegree = 360 / 8; // Exactly 45 degrees for 8 slices

  // Build the conic-gradient string
  const gradientStops = segments.map((seg, i) => {
    const start = i * segmentDegree;
    const end = (i + 1) * segmentDegree;
    return `${seg.color} ${start}deg ${end}deg`;
  }).join(', ');

  const handleSpin = () => {
    if (isSpinning) return;
    
    if (basePrizes.length < 8) {
      toast.error("Wheel not fully configured. 8 prizes required.");
      return;
    }
    
    // Check local balance first if no free spins
    if (freeSpins <= 0 && currentBalance < cost) {
      toast.error('Insufficient balance for a spin');
      return;
    }

    setIsSpinning(true);
    
    postSpin.mutate({}, {
      onSuccess: (res) => {
        if (!res.success) {
          toast.error(res.message);
          setIsSpinning(false);
          return;
        }

        const { prizeIndex, rewardAmount } = res.data;
        
        // Find all visual segments that map to this actual backend prize index
        const matchingIndices = segments
          .map((seg, idx) => (seg.originalIndex === prizeIndex ? idx : -1))
          .filter(idx => idx !== -1);
          
        // Pick a random visual segment out of the duplicates to land on
        const targetIndex = matchingIndices.length > 0 
          ? matchingIndices[Math.floor(Math.random() * matchingIndices.length)] 
          : prizeIndex;
        
        // Calculate target rotation based on the visual index
        const targetAngle = targetIndex * segmentDegree + (segmentDegree / 2);
        const startRotation = rotationRef.current;
        const newRotation = startRotation + (360 * 5) + (360 - (targetAngle + (startRotation % 360)) % 360);
        
        playSpinStart();

        // Animate with requestAnimationFrame to sync sound with rotation
        const duration = 4000;
        const startTime = performance.now();
        let lastTickAngle = startRotation;

        const animate = (time) => {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // easeOutQuart
          const eased = 1 - Math.pow(1 - progress, 4);
          
          const currentRotation = startRotation + (newRotation - startRotation) * eased;
          rotationRef.current = currentRotation;
          
          if (wheelRef.current) {
            wheelRef.current.style.transform = `rotate(${currentRotation}deg)`;
          }

          const tickThreshold = segmentDegree * (0.8 + progress * 0.4);
          if (Math.abs(currentRotation - lastTickAngle) >= tickThreshold) {
            playTick();
            lastTickAngle = currentRotation;
          }

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setIsSpinning(false);
            setRotation(newRotation % 360);
            
            // Find winning segment info
            const wonPrize = basePrizes[prizeIndex];
            const isWin = Number(rewardAmount) > 0;
            
            if (isWin) {
              playWin();
              confettiRef.current?.launch(120);
            }

            setResultData({
              isWin,
              amount: Number(rewardAmount),
              message: isWin 
                ? `Congratulations! You received ${settings.currency_symbol || "R"}${Number(rewardAmount).toFixed(2)}`
                : "Better luck next time! Try again to win big!"
            });
            setShowResultModal(true);

            refetch();
          }
        };

        requestAnimationFrame(animate);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Failed to spin');
        setIsSpinning(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-start relative overflow-x-hidden pb-24 select-none">
      
      {/* Top Header Bar - Exact matching style to other site headers */}
      <div className="sticky top-0 z-40 bg-white text-slate-900 border-b border-slate-100 px-5 h-16 flex items-center justify-between shadow-2xs max-w-[480px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-slate-900 text-[20px] sm:text-[22px] font-black tracking-tight leading-tight">
            Lucky Spin
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center transition-colors cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            onClick={() => setIsHowToPlayOpen(true)}
            className="w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200/80 flex items-center justify-center transition-colors cursor-pointer"
            title="Rules"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      <div className="w-full max-w-[480px] mx-auto px-4 py-4 space-y-4">
        
        {/* Stats Row - Clean white cards with site colors */}
        <div className="grid grid-cols-2 gap-3">
          {/* Deposit Balance */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Deposit Balance</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet size={14} />
              </div>
            </div>
            <div className="text-[20px] font-black text-slate-900 font-mono mt-2">
              {settings.currency_symbol || "R"}{Number(currentBalance).toFixed(2)}
            </div>
          </div>

          {/* Free Spins */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Free Spins</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                <Ticket size={14} />
              </div>
            </div>
            <div className="text-[20px] font-black text-amber-500 font-mono mt-2 flex items-baseline gap-1.5">
              <span>{freeSpins}</span>
              <span className="text-[11px] text-slate-400 font-sans font-medium">available</span>
            </div>
          </div>
        </div>

        {/* Cost Indicator Pill */}
        <div className="flex justify-center">
          <div className="bg-white px-4 py-1.5 rounded-full border border-slate-200/90 shadow-2xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] font-bold text-slate-700">
              Spin Cost: <span className="font-mono text-emerald-600">{settings.currency_symbol || "R"}{cost.toFixed(2)}</span>
            </span>
          </div>
        </div>

        {/* Wheel Container */}
        <div className="flex justify-center items-center py-4">
          <div className="relative w-[320px] h-[320px]">
            {/* The Outer Gold Ring with Lights */}
            <div className="absolute inset-0 rounded-full bg-[#0f172a] shadow-[0_10px_35px_rgba(245,158,11,0.25)] border-[5px] border-amber-400 overflow-hidden">
              <div className="absolute inset-1 rounded-full border border-amber-300/40" />
              {Array.from({ length: 24 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-2 h-2 bg-amber-200 rounded-full shadow-[0_0_6px_#fde68a]"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${i * 15}deg) translateY(-148px)`
                  }}
                />
              ))}
            </div>

            {/* The Inner Spinning Wheel */}
            <div 
              ref={wheelRef}
              className="absolute inset-[14px] rounded-full overflow-hidden shadow-inner"
              style={{
                background: `conic-gradient(${gradientStops})`,
                transform: `rotate(${rotation}deg)`
              }}
            >
              {segments.map((seg, i) => {
                const angle = (i * segmentDegree) + (segmentDegree / 2);
                const lineAngle = i * segmentDegree;
                const isTryAgain = seg.label.toLowerCase().includes("try again") || seg.label.toLowerCase().includes("oops");
                return (
                  <div key={i}>
                    {/* Separator Line */}
                    <div 
                      className="absolute top-0 left-1/2 w-[1px] h-1/2 bg-amber-200/60 origin-bottom z-10"
                      style={{ transform: `translateX(-50%) rotate(${lineAngle}deg)` }}
                    />
                    
                    {/* Segment Content */}
                    {isTryAgain ? (
                      <div 
                        className="absolute top-0 bottom-1/2 left-1/2 w-[80px] origin-bottom z-20 flex flex-col items-center justify-start pt-3 leading-none select-none"
                        style={{ 
                          transform: `translateX(-50%) rotate(${angle}deg)`,
                        }}
                      >
                        <span className="text-[19px] filter drop-shadow-sm">😢</span>
                        <span className="text-[12px] text-[#ef4444] font-black mt-1 tracking-tight">Oops!</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 whitespace-nowrap">Try Again</span>
                      </div>
                    ) : (
                      <div 
                        className="absolute inset-0 flex items-start justify-center pt-[18px] z-20"
                        style={{ transform: `rotate(${angle}deg)` }}
                      >
                        <span 
                          className="text-[14px] font-black text-slate-900 w-[20px] text-center select-none font-mono tracking-tight"
                          style={{ 
                            transform: 'rotate(180deg)',
                            writingMode: 'vertical-rl',
                            textOrientation: 'mixed'
                          }}
                        >
                          <span className="inline-block mt-3">{seg.label}</span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Center Start Button */}
            <div 
              onClick={handleSpin}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[84px] h-[84px] bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 rounded-full flex items-center justify-center cursor-pointer shadow-[0_4px_20px_rgba(245,158,11,0.5)] z-30 border-[4px] border-amber-200 hover:scale-105 active:scale-95 transition-all"
            >
              {/* Pointer Triangle */}
              <div className="absolute -top-[16px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-b-[18px] border-b-amber-200" />
              
              <div className="flex flex-col items-center leading-none">
                <span className="text-white font-black text-[17px] tracking-tight drop-shadow-sm uppercase">Spin</span>
              </div>
            </div>
            
          </div>
        </div>

        {/* Recent Wins */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3 px-1">
            <History className="text-amber-500" size={17} />
            <h3 className="font-bold text-slate-900 text-[15px] tracking-tight">Recent Wins</h3>
          </div>

          <div className="space-y-2.5">
            {spinData?.recentWins?.length > 0 ? (
              spinData.recentWins.map((win) => (
                <div key={win.id} className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${Number(win.reward_earned) > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Gift size={18} />
                    </div>
                    <div>
                      <h4 className="text-[13.5px] font-bold text-slate-900">{win.prize.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{dayjs(win.created_at).format('MMM DD, HH:mm')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[14px] font-black font-mono ${Number(win.reward_earned) > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {Number(win.reward_earned) > 0 ? `+${settings.currency_symbol || "R"}${Number(win.reward_earned).toFixed(2)}` : '0.00'}
                    </div>
                    <div className="text-[10.5px] text-slate-400 font-medium">
                      {win.spin_type === 'free' ? 'Free Spin' : `Paid Spin`}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-slate-200/90 text-[12.5px] font-medium">
                No recent wins yet. Spin the wheel to win instant prizes!
              </div>
            )}
          </div>
        </div>

      </div>

      <HowToPlayModal isOpen={isHowToPlayOpen} setIsOpen={setIsHowToPlayOpen} />

      {/* Spin Result Modal - Site Color Light Theme */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/90 rounded-[24px] p-6 w-full max-w-[320px] flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-200 relative select-none">
            
            {/* Close Button */}
            <button
              onClick={() => setShowResultModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer z-20"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div 
              className="w-18 h-18 rounded-full flex items-center justify-center mb-4 text-[36px]"
              style={{ background: resultData.isWin ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.1)' }}
            >
              {resultData.isWin ? "🎉" : "😢"}
            </div>
            
            <h2 className="text-slate-900 text-[22px] font-black tracking-tight mb-1">
              {resultData.isWin ? "You Won!" : "Try Again"}
            </h2>
            
            {resultData.isWin ? (
              <div className="flex flex-col items-center gap-1.5 mb-5 w-full">
                <p className="text-emerald-600 text-[32px] font-black font-mono leading-none">
                  +{settings.currency_symbol || "R"}{resultData.amount.toFixed(2)}
                </p>
                <p className="text-slate-500 text-[13px] leading-tight mt-1">
                  {resultData.message}
                </p>
                <div className="mt-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11.5px] font-bold rounded-full">
                  ✓ Added to withdrawable balance
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 mb-5">
                <p className="text-slate-700 text-[15px] font-bold">
                  Better luck next time!
                </p>
                <p className="text-slate-400 text-[12.5px]">
                  {resultData.message}
                </p>
              </div>
            )}
            
            <button 
              onClick={() => setShowResultModal(false)}
              className="w-full bg-[#0f172a] hover:bg-[#021d3c] text-white font-bold text-[14px] rounded-xl py-3 shadow-md transition-all cursor-pointer active:scale-95"
            >
              Continue
            </button>
            
          </div>
        </div>
      )}

      {/* Confetti Canvas */}
      <canvas 
        ref={confettiCanvasRef} 
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9998]"
        style={{ display: 'none' }}
      />
    </div>
  );
}
*/
