import React from "react";
import { twMerge } from "tailwind-merge";

export default function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      className={twMerge(
        "flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-brand-black placeholder-slate-400 shadow-sm transition-all focus:border-brand-violet focus:outline-none focus:ring-1 focus:ring-brand-violet disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}
