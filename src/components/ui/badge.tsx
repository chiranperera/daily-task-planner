import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-neutral-900 text-white",
        secondary: "border-neutral-200 bg-neutral-100 text-neutral-700",
        destructive: "border-transparent bg-neutral-900 text-white",
        outline: "border-neutral-300 text-neutral-900",
        // Status — conveyed via tone, not hue
        success: "border-neutral-200 bg-white text-neutral-500",
        warning: "border-neutral-300 bg-neutral-100 text-neutral-800",
        danger: "border-transparent bg-neutral-900 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
