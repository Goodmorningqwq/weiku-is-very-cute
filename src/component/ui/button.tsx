import * as React from "react";

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button ref={ref} className={`bg-blue-500 text-white rounded px-4 py-2 ${className}`} {...props} />
  )
);

Button.displayName = "Button";
