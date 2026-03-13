import type { HTMLAttributes, ReactNode } from "react";
import { baseStyles, variantStyles, type Variant } from "./styles";

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  children: ReactNode;
};

export default function Card({
  variant = "surface",
  className = "",
  children,
  ...props
}: Props) {
  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}