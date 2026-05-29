import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputVariant = "default" | "search";
export type InputSize = "sm" | "md" | "lg";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
}

const sizeClasses: Record<InputSize, string> = {
  sm: "h-8  text-xs  px-3",
  md: "h-10 text-sm  px-4",
  lg: "h-12 text-base px-4",
};

const searchPaddingClasses: Record<InputSize, string> = {
  sm: "pl-8",
  md: "pl-9",
  lg: "pl-10",
};

const iconSizeClasses: Record<InputSize, string> = {
  sm: "left-2.5 w-3.5 h-3.5",
  md: "left-3   w-4   h-4",
  lg: "left-3   w-4   h-4",
};

export function Input({
  variant = "default",
  size = "md",
  label,
  className,
  id,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-gray-600 tracking-label"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {variant === "search" && (
          <svg
            className={cn("absolute top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none", iconSizeClasses[size])}
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
        <input
          id={id}
          className={cn(
            "w-full rounded-button border border-gray-300 bg-white text-ink",
            "placeholder:text-gray-300 outline-none transition-all duration-150",
            "focus:border-clay focus:ring-2 focus:ring-clay/20",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            sizeClasses[size],
            variant === "search" && searchPaddingClasses[size],
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}
