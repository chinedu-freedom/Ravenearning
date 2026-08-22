"use client";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center select-none">
      <div className="w-10 h-10 border-[3.5px] border-slate-100 border-t-[#3b82f6] rounded-full animate-spin" />
    </div>
  );
}
