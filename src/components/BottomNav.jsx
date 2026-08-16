"use client";

import { Home, TrendingUp, Zap, Users, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Mine", href: "/dashboard/mining", icon: TrendingUp },
    { name: "Active Mining", href: "/dashboard/investments", icon: Zap },
    { name: "Team", href: "/dashboard/team", icon: Users },
    { name: "My", href: "/dashboard/account", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[65px] bg-white border-t border-gray-100 flex justify-around items-center z-50 shadow-md px-2">
      {navItems.map((item, index) => {
        const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');

        return (
          <Link
            key={index}
            href={item.href}
            className={`flex flex-col items-center justify-center w-[60px] gap-1 cursor-pointer transition-colors duration-200 ${
              isActive ? "text-[#0284c7]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <item.icon 
              size={20} 
              strokeWidth={isActive ? 2.5 : 1.8}
              className={isActive ? "text-[#0284c7]" : "text-gray-400"} 
              fill={isActive ? "rgba(2, 132, 199, 0.15)" : "none"}
            />
            <span className="text-[9px] font-semibold tracking-tight">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
