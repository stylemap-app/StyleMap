import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type CardVariant = "default" | "flat" | "outlined";
export type CardSize = "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  size?: CardSize;
}

const variantClasses: Record<CardVariant, string> = {
  default:  "bg-white shadow-card",
  flat:     "bg-gray-100",
  outlined: "bg-white border border-gray-300",
};

const sizeClasses: Record<CardSize, string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn("rounded-card", variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
