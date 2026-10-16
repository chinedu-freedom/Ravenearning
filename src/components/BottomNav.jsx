"use client";

import { Home, LayoutGrid, Users, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Product", href: "/dashboard/mining", icon: LayoutGrid },
    { name: "Team", href: "/dashboard/team", icon: Users },
    { name: "Mine", href: "/dashboard/account", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[64px] bg-white border-t border-gray-100 flex justify-around items-center z-50 shadow-sm px-4">
      {navItems.map((item, index) => {
        const isActive = pathname === item.href || (pathname === "/" && item.href === "/dashboard");

        return (
          <Link
            key={index}
            href={item.href}
            className={`flex flex-col items-center justify-center min-w-[56px] gap-1 cursor-pointer transition-colors duration-150 ${
              isActive ? "text-[#111827]" : "text-[#9ca3af] hover:text-[#4b5563]"
            }`}
          >
            <item.icon 
              size={22} 
              strokeWidth={isActive ? 2.4 : 1.8}
              className={isActive ? "text-[#111827]" : "text-[#9ca3af]"} 
            />
            <span className={`text-[11px] leading-none ${isActive ? "font-bold text-[#111827]" : "font-medium text-[#9ca3af]"}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
