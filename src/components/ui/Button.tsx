import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   "bg-clay text-white hover:opacity-90 active:opacity-75",
  secondary: "border border-ink text-ink hover:bg-gray-100 active:bg-gray-100",
  ghost:     "text-gray-900 hover:bg-gray-100 active:bg-gray-100",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8  px-3 text-xs  rounded-button",
  md: "h-10 px-4 text-sm  rounded-button",
  lg: "h-12 px-6 text-base rounded-button",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
