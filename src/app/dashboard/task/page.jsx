"use client";

import { 
  ArrowLeft,
  Gift, 
  Lock, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Users, 
  ListTodo,
  Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useFetchData, usePost } from "@/hooks/useApi";
import { useRef, useEffect } from "react";
import { toast } from "sonner";

export default function TaskPage() {
  const router = useRouter();

  const { data: tasksData, isLoading, refetch } = useFetchData("/users/tasks", ["user-tasks"]);
  const claimMutation = usePost("/users/tasks/claim", "user-tasks");
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const currencySymbol = settings.currency_symbol || "R";

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
            const colors = ['#0f172a', '#22c55e', '#3b82f6', '#f59e0b', '#06b6d4', '#ec4899'];
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

  const tasks = tasksData?.tasks || [];
  const todayInvites = tasksData?.todayReferralsCount || 0;
  
  const totalTasks = tasks.length;
  const readyTasks = tasks.filter(t => t.isReady).length;
  const claimedTasks = tasks.filter(t => t.isClaimed).length;

  const handleClaim = (taskId) => {
    claimMutation.mutate({ taskId }, {
      onSuccess: () => {
        confettiRef.current?.launch(150);
        toast.success("Task reward claimed successfully!");
        refetch();
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-start select-none">
      
      {/* Top Header Bar - White background, Text on left, Logo on right */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100/90 px-5 h-16 flex items-center justify-between shadow-2xs max-w-[480px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-slate-900 text-[20px] sm:text-[22px] font-black tracking-tight leading-tight">
            Task Center
          </h1>
        </div>
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-slate-200/80 shrink-0"
          />
        </div>
      </div>

      <div className="w-full max-w-[480px] mx-auto px-4 py-4 space-y-4 pb-24">
        
        {/* Stats Grid - 4 Modern Cards */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Card 1: Total Tasks */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[22px] sm:text-[24px] font-black text-slate-900 font-mono tracking-tight leading-none">
                {totalTasks}
              </div>
              <p className="text-[12px] text-slate-500 font-medium mt-1.5">
                Total Tasks
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#0f172a] flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <ListTodo size={18} />
            </div>
          </div>

          {/* Card 2: Ready */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <div className={`text-[22px] sm:text-[24px] font-black font-mono tracking-tight leading-none ${readyTasks > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                {readyTasks}
              </div>
              <p className="text-[12px] text-slate-500 font-medium mt-1.5">
                Ready to Claim
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Sparkles size={18} />
            </div>
          </div>

          {/* Card 3: Claimed */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[22px] sm:text-[24px] font-black text-slate-900 font-mono tracking-tight leading-none">
                {claimedTasks}
              </div>
              <p className="text-[12px] text-slate-500 font-medium mt-1.5">
                Claimed Tasks
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <CheckCircle2 size={18} />
            </div>
          </div>

          {/* Card 4: Today's Invites */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[22px] sm:text-[24px] font-black text-slate-900 font-mono tracking-tight leading-none">
                {todayInvites}
              </div>
              <p className="text-[12px] text-slate-500 font-medium mt-1.5">
                Today&apos;s Invites
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Users size={18} />
            </div>
          </div>

        </div>

        {/* Task List Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-slate-900 text-[15px] font-bold tracking-tight">
              Task Missions
            </h2>
            <span className="text-[11.5px] text-slate-400 font-medium">
              Invite friends to earn cash
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-16 bg-white border border-slate-200 rounded-xl">
              <Loader2 className="w-7 h-7 text-[#0f172a] animate-spin mb-2" />
              <span className="text-[12px] text-slate-500 font-medium">Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 flex flex-col items-center justify-center text-center shadow-2xs">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-3">
                <Gift size={22} />
              </div>
              <p className="text-slate-800 text-[14px] font-bold">No active tasks available</p>
              <p className="text-slate-400 text-[12px] mt-1">Check back later for new reward tasks and referral missions.</p>
            </div>
          ) : (
            tasks.map(task => {
              const progressPercent = Math.min((task.progress / task.required_referrals) * 100, 100);
              
              return (
                <div 
                  key={task.id} 
                  className="bg-white rounded-xl p-4 shadow-2xs border border-slate-200/90 hover:border-slate-300 transition-all flex gap-3.5"
                >
                  <div className="w-12 h-12 bg-slate-100 text-[#0f172a] rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
                    <Gift size={22} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div className="min-w-0">
                        <h3 className="text-[14.5px] font-bold text-slate-900 leading-snug truncate">
                          {task.task_name}
                        </h3>
                        <div className="flex items-center gap-2 text-[12px] mt-0.5">
                          <span className="text-emerald-600 font-black font-mono">
                            {currencySymbol}{Number(task.reward_amount).toFixed(2)}
                          </span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="text-slate-500 font-medium">
                            {task.required_referrals} invites required
                          </span>
                        </div>
                      </div>
                      
                      {task.isClaimed ? (
                        <span className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 shrink-0 border border-slate-200/80">
                          <Check size={12} className="stroke-[3]" />
                          Claimed
                        </span>
                      ) : task.isReady ? (
                        <button 
                          onClick={() => handleClaim(task.id)}
                          disabled={claimMutation.isPending}
                          className="bg-[#0f172a] hover:bg-[#021d3c] active:scale-95 text-white px-3.5 py-1.5 rounded-full cursor-pointer text-[11.5px] font-bold shrink-0 transition-all shadow-xs disabled:opacity-70 flex items-center gap-1"
                        >
                          {claimMutation.isPending ? "Claiming..." : "Claim"}
                        </button>
                      ) : (
                        <span className="bg-slate-50 text-slate-400 px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 shrink-0 border border-slate-200/60">
                          <Lock size={12} />
                          Locked
                        </span>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2 mb-1.5">
                      <div 
                        className={`absolute top-0 left-0 h-full ${task.isClaimed ? 'bg-emerald-500' : 'bg-[#0f172a]'} transition-all duration-500 rounded-full`} 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-[11.5px] text-slate-400 font-medium">
                      <span>Progress: {task.progress}/{task.required_referrals} today</span>
                      <span className="font-bold text-slate-600 font-mono">{Math.floor(progressPercent)}%</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      <canvas 
        ref={confettiCanvasRef} 
        className="pointer-events-none fixed inset-0 z-[100] w-full h-full" 
        style={{ display: 'none' }}
      />
    </div>
  );
}
