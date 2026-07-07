import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const buttonVariants = {
  primary:
    "bg-brand-blue hover:bg-brand-blue/90 text-white shadow-sm shadow-brand-blue/10 focus:ring-brand-blue",
  secondary:
    "bg-slate-100 hover:bg-slate-200 text-brand-black border border-slate-200 focus:ring-slate-300",
  success:
    "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/10 focus:ring-emerald-500",
  danger:
    "bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/10 focus:ring-rose-500",
  ghost:
    "hover:bg-slate-100 text-slate-600 hover:text-brand-black focus:ring-slate-200",
  outline:
    "border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-slate-300",
  ai: "text-white bg-violet-500 hover:bg-violet-600 shadow-sm shadow-brand-violet/20 border-0 focus:ring-brand-violet font-semibold tracking-wide",
};

const buttonSizes = {
  sm: "px-2.5 py-1.5 text-xs rounded-md",
  md: "px-3.5 py-2 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-base rounded-lg",
};

export default function Button({
  children,
  variant = "secondary",
  size = "md",
  className,
  disabled,
  isLoading,
  ...props
}) {
  return (
    <button
      disabled={disabled || isLoading}
      className={twMerge(
        "inline-flex items-center justify-center font-medium transition-all duration-250 select-none outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer gap-2",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-1 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
