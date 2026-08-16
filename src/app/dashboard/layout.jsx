"use client";

import BottomNav from "@/components/BottomNav";
import DailyCheckinModal from "@/components/DailyCheckinModal";
import InstallGuideModal from "@/components/InstallGuideModal";
import TelegramModal from "@/components/TelegramModal";
import { useFetchData } from "@/hooks/useApi";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const isHome = pathname === "/dashboard";
  const isAccount = pathname.startsWith("/dashboard/account");
  const isTeam = pathname === "/dashboard/team";

  const { isLoading: isLoadingSettings, data: settingsResponse } = useFetchData("/settings", ["platform-settings"]);
  const { isLoading: isLoadingProfile } = useFetchData("/users/me", ["user-profile"]);

  const settings = settingsResponse?.settings || {};
  const siteName = settings.site_name || "Ravenearning";

  return (
    <div className="h-screen flex justify-center overflow-hidden transition-colors duration-300 bg-[#f0f4f8]">
      <div className="w-full max-w-[480px] h-screen relative shadow-2xl overflow-hidden pb-[80px] flex flex-col transition-colors duration-300 bg-[#f0f4f8]">

        {/* Global Brand Header (Shown on Home Dashboard) */}
        {isHome && (
          <div className="bg-[#111827] px-4 pt-4 pb-3 flex justify-center items-center shadow-sm z-10 relative shrink-0 border-b border-white/5">
            <span className="text-white font-bold text-[17px] tracking-tight text-center">
              {siteName}
            </span>
          </div>
        )}

        {/* Page Content area */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {children}
        </div>

        <DailyCheckinModal />
        <InstallGuideModal />
        <TelegramModal />

      </div>
      <BottomNav />
    </div>
  );
}
