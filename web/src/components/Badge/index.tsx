import type { HTMLAttributes, ReactNode } from "react";
import { baseStyles, variantStyles, type Variant } from "./styles";


interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: Variant;
  children: ReactNode;
}

export default function Badge({
  variant,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >

      {children}
    </span>
  )
}