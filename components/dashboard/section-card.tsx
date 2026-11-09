import type { ReactNode } from "react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function SectionCard({
  title,
  description,
  action,
  footer,
  children,
  className,
  contentClassName,
}: {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-2xl border border-white/8 bg-[#0b0b12] py-0 text-white ring-0",
        className
      )}
    >
      {(title || description || action) && (
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-white/6 px-5 py-4">
          <div className="min-w-0 space-y-1">
            {title ? (
              <CardTitle className="font-manrope text-[15px] font-semibold text-white">
                {title}
              </CardTitle>
            ) : null}
            {description ? (
              <CardDescription className="text-[13px] leading-relaxed text-white/45">
                {description}
              </CardDescription>
            ) : null}
          </div>
          {action ? <CardAction className="static">{action}</CardAction> : null}
        </CardHeader>
      )}
      <CardContent className={cn("p-5", contentClassName)}>
        {children}
      </CardContent>
      {footer ? (
        <CardFooter className="border-white/6 bg-white/[0.02] px-5 py-3 text-xs text-white/45">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  )
}
