"use client";

import React, { forwardRef } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-md border-2 border-white/50 bg-white/10 shadow-xs transition-all duration-150 cursor-pointer",
      "hover:border-white/80 hover:bg-white/15",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a]/40",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-[#0f172a] data-[state=checked]:border-[#0f172a] data-[state=checked]:text-white",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
      <Check className="h-3.5 w-3.5 stroke-[3.5] text-white" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = "Checkbox";

export { Checkbox };