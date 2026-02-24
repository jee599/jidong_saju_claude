"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-brand text-white hover:bg-brand-light active:scale-[0.98] shadow-elevation-2 hover:shadow-elevation-3",
      secondary:
        "bg-bg-elevated text-text-primary border border-border hover:border-brand/30 shadow-elevation-1",
      ghost:
        "text-text-secondary hover:text-text-primary hover:bg-white/5",
      accent:
        "bg-accent text-text-inverse font-semibold hover:bg-accent-hover active:scale-[0.98] shadow-elevation-2",
    };

    const sizes = {
      sm: "text-sm px-3 py-1.5",
      md: "text-sm px-5 py-2.5",
      lg: "text-base px-7 py-3.5",
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
