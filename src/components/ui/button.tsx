import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-blue-400",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-slate-50 hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-800",
        outline: "border-2 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:text-slate-50",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 hover:shadow-md hover:-translate-y-0.5 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700",
        ghost: "hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:text-slate-50",
        link: "text-slate-900 underline-offset-4 hover:underline hover:text-blue-600 dark:text-slate-50 dark:hover:text-blue-400"
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };