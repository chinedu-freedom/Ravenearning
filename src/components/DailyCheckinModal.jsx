"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Check, Coins, Lock, Loader2 } from "lucide-react";
import { useFetchData, usePost } from "@/hooks/useApi";
import { toast } from "sonner";
import RewardClaimModal from "@/components/RewardClaimModal";

export default function DailyCheckinModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [claimedModalData, setClaimedModalData] = useState({ isOpen: false, amount: 0 });
  const { data, isLoading, refetch } = useFetchData('/users/daily-checkin', ['daily-checkin']);
  const claimMutation = usePost('/users/daily-checkin/claim', ['daily-checkin'], false, { showToast: false });
  const { data: settingsRes } = useFetchData('/settings', ['platform-settings']);
  
  const confettiCanvasRef = useRef(null);
  const confettiRef = useRef(null);

  // Confetti Animation Setup
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
        const colors = ['#4f8cff', '#2563eb', '#6ee7ff', '#10b981', '#3b82f6', '#f59e0b'];
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
              this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            } else {
              this.ctx.beginPath();
              this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
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

  // Event listener to open modal from anywhere (Action Grid, Daily Check-in button, etc.)
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
      if (result?.success || result?.message) {
        confettiRef.current?.launch(150);
        await refetch();
        const claimedAmt = result?.amount || result?.rewardAmount || 10;
        setClaimedModalData({ isOpen: true, amount: claimedAmt });
        handleOpenChange(false);
      }
    } catch (error) {
      toast.error("Claim Failed", {
        description: error?.response?.data?.error || error?.message || "Could not claim daily reward",
      });
    }
  };

  const { rewards = [], currentStreak = 0, claimedToday = false, maxDays = 7 } = data || {};
  const nextClaimDay = claimedToday ? currentStreak : currentStreak + 1;
  const displayDay = nextClaimDay > maxDays ? 1 : nextClaimDay;

  const settings = settingsRes?.settings || {};

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      window.dispatchEvent(new Event('checkin-modal-closed'));
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden bg-[#111827] rounded-3xl border border-white/10 shadow-2xl z-[100]">
          {isLoading || !data ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-[#4f8cff] animate-spin" />
              <p className="text-gray-300 text-sm font-bold">Loading daily rewards...</p>
            </div>
          ) : (
            <div className="p-8 flex flex-col items-center">
              
              {/* Taller, prominent brand gift badge */}
              <div className="w-20 h-20 bg-gradient-to-br from-[#4f8cff]/25 to-[#2563eb]/25 rounded-3xl border border-[#4f8cff]/30 flex items-center justify-center mb-4 text-[#4f8cff] shadow-lg shadow-[#4f8cff]/15 relative overflow-hidden">
                <Gift className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-black text-white tracking-tight mb-1.5 text-center">Daily Check-in Rewards</h2>
              <p className="text-sm text-gray-300 mb-7 text-center px-2 font-medium leading-relaxed">
                Check in for 7 consecutive days to claim maximum earnings. Missing a day resets your streak!
              </p>
              
              {/* Row 1: Days 1 to 4 */}
              <div className="grid grid-cols-4 gap-3 w-full mb-3.5">
                {rewards.slice(0, 4).map((reward) => (
                  <RewardCard key={reward.day} reward={reward} isNext={reward.day === displayDay && !claimedToday} settings={settings} />
                ))}
              </div>

              {/* Row 2: Days 5 to 7 */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-[340px] mb-8">
                {rewards.slice(4, 7).map((reward) => (
                  <RewardCard key={reward.day} reward={reward} isNext={reward.day === displayDay && !claimedToday} settings={settings} />
                ))}
              </div>

              {claimedToday ? (
                <div className="w-full bg-[#1e293b]/90 text-[#4f8cff] border border-[#4f8cff]/30 rounded-2xl py-4 font-black text-center tracking-[0.25em] shadow-inner text-lg">
                  Next Claim: {timeLeft}
                </div>
              ) : (
                <Button 
                  onClick={handleClaim} 
                  disabled={claimMutation.isPending}
                  className="w-full bg-gradient-to-r from-[#4f8cff] via-[#3b82f6] to-[#2563eb] hover:opacity-95 text-white rounded-2xl py-6 font-black text-base shadow-xl shadow-[#4f8cff]/30 transition-all active:scale-[0.98]"
                >
                  {claimMutation.isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    `Claim Day ${displayDay}`
                  )}
                </Button>
              )}
              
            </div>
          )}
        </DialogContent>
      </Dialog>
      <canvas 
        ref={confettiCanvasRef} 
        className="pointer-events-none fixed inset-0 z-[150] w-full h-full" 
        style={{ display: 'none' }}
      />
      <RewardClaimModal
        isOpen={claimedModalData.isOpen}
        onClose={() => setClaimedModalData({ isOpen: false, amount: 0 })}
        amount={claimedModalData.amount}
        currencySymbol={settings?.currency_symbol || "R"}
        title="Daily Reward Claimed!"
      />
    </>
  );
}

function RewardCard({ reward, isNext, settings }) {
  const isClaimed = reward.status === 'claimed';
  const isAvailable = reward.status === 'available' || isNext;
  const symbol = settings?.currency_symbol || "R";
  
  return (
    <div className={`
      flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all select-none min-h-[96px]
      ${isClaimed ? 'border-[#10b981] bg-[#10b981]/15 shadow-sm' : ''}
      ${isAvailable ? 'border-[#4f8cff] bg-gradient-to-b from-[#4f8cff]/25 to-[#2563eb]/15 shadow-lg shadow-[#4f8cff]/20 scale-105 z-10 relative' : ''}
      ${reward.status === 'locked' && !isNext ? 'border-white/5 bg-white/5 opacity-50' : ''}
    `}>
      <span className={`text-[11px] font-extrabold tracking-wider uppercase mb-2 
        ${isClaimed ? 'text-[#10b981]' : isAvailable ? 'text-[#4f8cff]' : 'text-gray-400'}
      `}>
        Day {reward.day}
      </span>
      
      <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 shadow-sm
        ${isClaimed ? 'bg-[#10b981] text-white' : isAvailable ? 'bg-[#4f8cff] text-white shadow-md shadow-[#4f8cff]/40' : 'bg-white/10 text-gray-400'}
      `}>
        {isClaimed ? (
          <Check className="w-5 h-5" strokeWidth={3} />
        ) : isAvailable ? (
          <Coins className="w-4 h-4" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
      </div>
      
      <span className={`text-xs font-black 
        ${isClaimed ? 'text-[#10b981]' : isAvailable ? 'text-white' : 'text-gray-400'}
      `}>
        +{symbol}{parseFloat(reward.amount || 0).toFixed(0)}
      </span>
    </div>
  );
}
