"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const Input = React.forwardRef(
  (
    {
      label,
      type = "text",
      className,
      error,
      showPasswordToggle = true,
      value,
      defaultValue,
      onChange,
      id,
      name,
      prefix,
      icon: Icon,
      placeholder,
      ...props
    },
    ref
  ) => {
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? "");
    const [isAutoFilled, setIsAutoFilled] = useState(false);
    const inputRef = useRef(null);

    // Combine refs
    const combinedRef = (node) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    useEffect(() => {
      if (value !== undefined) setInternalValue(value ?? "");
    }, [value]);

    // ✅ Enhanced auto-fill detection
    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;

      const checkAutoFill = () => {
        // Method 1: Check if input has value (works for most browsers)
        if (input.value && input.value !== internalValue) {
          setInternalValue(input.value);
          setIsAutoFilled(true);
          return;
        }

        // Method 2: Check for autofill by detecting non-default styles
        const computedStyle = window.getComputedStyle(input);
        const backgroundColor = computedStyle.backgroundColor;
        
        // Check if background color is not white/transparent (indicating autofill)
        const isLikelyAutofilled = (
          backgroundColor !== 'rgba(0, 0, 0, 0)' && 
          backgroundColor !== 'white' && 
          backgroundColor !== '#ffffff' &&
          backgroundColor !== 'rgb(255, 255, 255)'
        );

        if (isLikelyAutofilled) {
          setIsAutoFilled(true);
        }
      };

      // Check immediately
      checkAutoFill();

      // Check multiple times as autofill can happen asynchronously
      const timers = [
        setTimeout(checkAutoFill, 10),
        setTimeout(checkAutoFill, 100),
        setTimeout(checkAutoFill, 500),
        setTimeout(checkAutoFill, 1000)
      ];

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }, [id, name, internalValue]);

    const handleChange = (e) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      setIsAutoFilled(false);
      onChange?.(e);
    };

    const handleBlur = (e) => {
      if (inputRef.current?.value && !internalValue) {
        setInternalValue(inputRef.current.value);
        setIsAutoFilled(true);
      }
      props.onBlur?.(e);
    };

    const inputType = isPassword && showPassword ? "text" : type;
    const currentValue = value ?? internalValue;
    const hasValue = currentValue !== "" && currentValue != null;
    const shouldFloatLabel = hasValue || isAutoFilled;

    const generatedId =
      id || name || (label ? String(label).toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="relative w-full">
        {prefix && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none select-none text-white font-semibold text-sm z-10">
            {Icon && <Icon className="w-4 h-4 text-slate-300 shrink-0" />}
            <span>{prefix}</span>
            <span className="text-white/30">|</span>
          </div>
        )}
        <input
          id={generatedId}
          ref={combinedRef}
          name={name}
          type={inputType}
          value={currentValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder || " "}
          className={cn(
            "peer block w-full h-12 rounded-full border border-white/20 bg-black/20 px-5 py-3 text-sm text-white placeholder-slate-400 backdrop-blur-sm",
            "focus:border-[#4fb3ff] focus:outline-none focus:ring-2 focus:ring-[#4fb3ff]/30 transition-all duration-200",
            "disabled:cursor-not-allowed disabled:opacity-50",
            prefix ? (Icon ? "pl-[82px]" : "pl-[68px]") : "pl-5",
            isPassword ? "pr-12" : "",
            className
          )}
          {...props}
        />

        {label && (
          <label
            htmlFor={generatedId}
            className={cn(
              "absolute left-5 pointer-events-none transition-all duration-200",
              "text-slate-400",
              (shouldFloatLabel || prefix)
                ? [
                    "-top-2.5 text-xs font-semibold text-[#4fb3ff]",
                    "bg-[#080d1a] px-2.5 rounded-full shadow-xs",
                  ].join(' ')
                : [
                    "top-3.5 text-sm",
                    "bg-transparent"
                  ].join(' '),
              "peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-[#4fb3ff] peer-focus:bg-[#080d1a] peer-focus:px-2.5 peer-focus:rounded-full"
            )}
          >
            {label}
          </label>
        )}

        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors focus:outline-none p-1 cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        {error && <p className="text-red-400 text-xs mt-1.5 ml-4">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
export { Input };