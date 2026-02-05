type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const buttonBase =
  "rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-blue-700 hover:opacity-90 hover:shadow-lg hover:shadow-blue-900/30",
  outline:
    "border border-white/30 bg-white/10 text-white hover:bg-white/20 hover:shadow-lg hover:shadow-blue-900/30",
  ghost:
    "bg-white/20 text-white hover:bg-white/30 hover:shadow-lg hover:shadow-blue-900/30",
  danger:
    "bg-red-600 text-white hover:opacity-90 hover:shadow-lg hover:shadow-red-900/40",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function buttonClass({
  variant = "outline",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return [buttonBase, buttonVariants[variant], buttonSizes[size], className]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant = "outline",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const classes = buttonClass({ variant, size, className });
  return <button className={classes} {...props} />;
}

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

const cardBase =
  "rounded-2xl border border-white/20 bg-white/10 shadow-lg shadow-blue-900/25 backdrop-blur-sm";

export function Card({
  className = "",
  hover = false,
  ...props
}: CardProps) {
  const hoverClass = hover
    ? "transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/40"
    : "";
  const classes = [cardBase, hoverClass, className].filter(Boolean).join(" ");
  return <div className={classes} {...props} />;
}

type BadgeProps = React.HTMLAttributes<HTMLSpanElement>;

export function Badge({ className = "", ...props }: BadgeProps) {
  const classes = [
    "rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <span className={classes} {...props} />;
}
import React from "react";
