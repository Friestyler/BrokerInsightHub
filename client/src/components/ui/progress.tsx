"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ExtendedProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorColor?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ExtendedProgressProps
>(({ className, value, indicatorColor, style, ...props }, ref) => {
  // Extract potentially passed custom color from style prop
  let progressColor = indicatorColor;
  if (!progressColor && style && (style as any)['--progress-background']) {
    progressColor = (style as any)['--progress-background'];
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          progressColor ? "" : "bg-primary"
        )}
        style={{ 
          transform: `translateX(-${100 - (value || 0)}%)`,
          backgroundColor: progressColor || undefined
        }}
      />
    </ProgressPrimitive.Root>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
