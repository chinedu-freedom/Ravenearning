"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

function TabsContent({ tabs = [], defaultTab }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || defaultTab || tabs[0];

  const toKebab = (str) => str.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-");

  const handleTabChange = (tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", toKebab(tab));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex border-b border-gray-200 w-full justify-center md:justify-start md:w-fit">
      {tabs.map((tab) => {
        const isActive = toKebab(tab) === currentTab;
        return (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={cn(
              "px-7 md:px-10 py-2 text-sm font-medium transition-colors cursor-pointer capitalize",
              isActive
                ? "text-[#0284c7] border-b-4 border-[#0284c7]"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

export default function Tabs(props) {
  return (
    <Suspense fallback={<div className="h-10 w-48 animate-pulse bg-gray-100 rounded" />}>
      <TabsContent {...props} />
    </Suspense>
  );
}