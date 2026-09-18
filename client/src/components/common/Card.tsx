import type { HTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        "rounded-xl border border-gray-200 bg-white shadow-md p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
