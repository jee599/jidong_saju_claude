"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-[#6C3CE1] text-white hover:bg-[#5A2FC0] active:scale-[0.98]",
      secondary: "bg-[#1E1A3A] text-[#E8E4F0] border border-white/10 hover:border-[#6C3CE1]/50",
      ghost: "text-[#8B85A0] hover:text-[#E8E4F0] hover:bg-white/5",
      gold: "bg-gradient-to-r from-[#6C3CE1] to-[#D4A84B] text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#6C3CE1]/20",
    };

    const sizes = {
      sm: "text-sm px-3 py-1.5",
      md: "text-sm px-4 py-2.5",
      lg: "text-base px-6 py-3.5",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
