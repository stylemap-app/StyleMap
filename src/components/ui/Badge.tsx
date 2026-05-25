import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "style" | "vibe" | "category" | "neutral";
export type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

// タグ種別ごとに色を分けてフィルターUIで区別しやすくする
const variantClasses: Record<BadgeVariant, string> = {
  style:    "bg-clay/15 text-clay",
  vibe:     "bg-ink/10  text-gray-900",
  category: "bg-gray-100 text-gray-600",
  neutral:  "bg-gray-100 text-gray-600",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2    py-0.5 text-[11px]",
  md: "px-3    py-1   text-xs",
};

export function Badge({
  variant = "neutral",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium tracking-label",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
