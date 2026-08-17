"use client";

import { useState, useEffect, useRef } from "react";
import { useFetchData, usePost } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Gift, Lock, Loader2, Coins, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function DailyCheckinModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, refetch } = useFetchData("/users/checkin", "checkin-status");
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const claimMutation = usePost("/users/checkin");

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
            const colors = ['#0284c7', '#38bdf8', '#60a5fa', '#22c55e', '#f59e0b', '#06b6d4'];
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
  }, [isOpen]);

  // Allow other components to trigger the modal
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-daily-checkin', handleOpen);
    return () => window.removeEventListener('open-daily-checkin', handleOpen);
  }, []);

  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!data?.claimedToday) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow - now;

      if (diff <= 0) {
        refetch();
        return "00:00:00";
      }

      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
      const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.claimedToday, refetch]);

  const handleClaim = async () => {
    try {
      const result = await claimMutation.mutateAsync({});
      if (result.success) {
        confettiRef.current?.launch(150);
        await refetch();
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      toast.error("Claim Failed", {
        description: error.response?.data?.error || "Could not claim daily reward",
      });
    }
  };

  const rewards = data?.rewards || [
    { day: 1, amount: 0.10, status: 'available' },
    { day: 2, amount: 0.20, status: 'locked' },
    { day: 3, amount: 0.02, status: 'locked' },
    { day: 4, amount: 0.10, status: 'locked' },
    { day: 5, amount: 0.30, status: 'locked' },
    { day: 6, amount: 0.40, status: 'locked' },
    { day: 7, amount: 0.50, status: 'locked' },
  ];
  const currentStreak = data?.currentStreak || 0;
  const claimedToday = data?.claimedToday || false;
  const nextClaimDay = claimedToday ? currentStreak : currentStreak + 1;
  const displayDay = nextClaimDay > (data?.maxDays || 7) ? 1 : nextClaimDay;

  const settings = settingsRes?.settings || {};

  const handleClose = () => {
    setIsOpen(false);
    window.dispatchEvent(new Event('checkin-modal-closed'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop dismiss */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Centered Large Modal Card with Site Blue Theme */}
      <div className="relative w-[94%] max-w-[430px] bg-[#111827] rounded-[28px] border border-white/10 shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center z-10 animate-in zoom-in-95 duration-200 select-none max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        
        {/* Cancel / Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-30"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Gift Circle Icon with Blue Accents */}
        <div className="w-16 h-16 bg-[#0284c7]/20 text-[#0284c7] rounded-full flex items-center justify-center mb-3.5 relative shadow-inner">
          <Gift className="w-8 h-8 text-[#38bdf8]" />
          <div className="absolute top-1 right-1 text-[11px]">✨</div>
        </div>

        <h2 className="text-[21px] font-bold text-white mb-1.5 tracking-tight">Daily Rewards</h2>
        <p className="text-[12px] text-gray-400 mb-6 max-w-[310px] mx-auto leading-relaxed">
          Check in for 7 consecutive days to get maximum rewards. Missing a day resets your streak!
        </p>

        {isLoading && !data ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#0284c7] mb-2" />
            <p className="text-xs">Loading daily rewards...</p>
          </div>
        ) : (
          <>
            {/* Row 1 (Days 1 to 4) */}
            <div className="grid grid-cols-4 gap-2.5 w-full mb-3">
              {rewards.slice(0, 4).map((reward) => (
                <RewardCard key={reward.day} reward={reward} isNext={reward.day === displayDay && !claimedToday} settings={settings} />
              ))}
            </div>

            {/* Row 2 (Days 5 to 7 Centered) */}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[310px] mb-6">
              {rewards.slice(4, 7).map((reward) => (
                <RewardCard key={reward.day} reward={reward} isNext={reward.day === displayDay && !claimedToday} settings={settings} />
              ))}
            </div>

            {claimedToday ? (
              <div className="w-full bg-white/5 text-gray-400 border border-white/5 rounded-[16px] py-4 font-mono font-bold text-center text-base shadow-inner">
                {timeLeft || "Claimed for today"}
              </div>
            ) : (
              <Button
                onClick={handleClaim}
                disabled={claimMutation.isPending}
                className="w-full bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:from-[#0369a1] hover:to-[#075985] text-white font-bold py-4 rounded-[16px] shadow-lg shadow-sky-500/25 text-[15px] tracking-wide transition-all active:scale-[0.98] cursor-pointer h-auto border-none"
              >
                {claimMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  `Claim Day ${displayDay}`
                )}
              </Button>
            )}
          </>
        )}
      </div>

      <canvas 
        ref={confettiCanvasRef} 
        className="pointer-events-none fixed inset-0 z-[100] w-full h-full" 
        style={{ display: 'none' }}
      />
    </div>
  );
}

function RewardCard({ reward, isNext, settings }) {
  const isClaimed = reward.status === 'claimed';
  const isAvailable = reward.status === 'available' || isNext;

  return (
    <div className={`
      flex flex-col items-center justify-between py-3.5 px-2 rounded-[16px] min-h-[105px] border-2 transition-all
      ${isClaimed ? 'border-[#10b981] bg-[#10b981]/10' : ''}
      ${isAvailable ? 'border-[#0284c7] bg-[#0284c7]/15 shadow-[0_0_15px_rgba(2,132,199,0.25)] scale-[1.02] z-10 relative' : ''}
      ${reward.status === 'locked' && !isNext ? 'border-white/5 bg-[#1e293b]/50' : ''}
    `}>
      <span className={`text-[10.5px] font-bold tracking-wider uppercase mb-1 
        ${isClaimed ? 'text-[#10b981]' : isAvailable ? 'text-[#38bdf8]' : 'text-gray-400'}
      `}>
        DAY {reward.day}
      </span>

      <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 shadow-sm
        ${isClaimed ? 'bg-[#10b981] text-white' : isAvailable ? 'bg-[#0284c7] text-white' : 'bg-white/5 text-gray-400'}
      `}>
        {isClaimed ? (
          <Check className="w-5 h-5" strokeWidth={3} />
        ) : isAvailable ? (
          <Coins className="w-4 h-4 text-white" />
        ) : (
          <Lock className="w-4 h-4 text-gray-400" />
        )}
      </div>

      <span className={`text-[11.5px] font-bold tracking-tight 
        ${isClaimed ? 'text-[#10b981]' : isAvailable ? 'text-[#38bdf8]' : 'text-gray-400'}
      `}>
        +{settings?.currency_symbol || "R"}{parseFloat(reward.amount).toFixed(2)}
      </span>
    </div>
  );
}
