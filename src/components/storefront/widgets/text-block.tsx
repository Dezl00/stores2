"use client"
import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function TextBlock({ widget }: { widget: any }) {
  const textAlign = widget.settings?.textAlign || "center"
  const imageUrl = widget.settings?.imageUrl
  const buttonText = widget.settings?.buttonText
  const buttonUrl = widget.settings?.buttonUrl
  const redirectType = widget.settings?.redirectType
  const redirectId = widget.settings?.redirectId

  let href = buttonUrl || '#'
  if (redirectType === 'product') href = `/product/${redirectId}`
  else if (redirectType === 'category') href = `/category/${redirectId}`
  else if (redirectType === 'page') href = `/pages/${redirectId}`
  const hasLink = !!(buttonUrl || (redirectType && redirectId))

  const alignClass =
    textAlign === "right" ? "text-right" :
    textAlign === "left" ? "text-left" :
    "text-center"

  if (!widget.title && !widget.subtitle) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-700 mb-2">نص مخصص</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            الرجاء إضافة نص من خلال إعدادات القسم.
          </p>
        </div>
      </div>
    )
  }

  const textContent = (
    <div className={cn("relative z-10 space-y-4", alignClass)}>
      {widget.title && (
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">{widget.title}</h2>
      )}
      {widget.subtitle && (
        <p className="text-lg text-muted-foreground leading-relaxed">{widget.subtitle}</p>
      )}
      {buttonText && hasLink && (
        <div className={cn("pt-4", textAlign === "center" && "flex justify-center")}>
          <Link href={href}>
            <Button className="rounded-full px-8 py-5 text-base font-bold shadow-lg">
              {buttonText}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className={cn(
        "max-w-5xl mx-auto bg-secondary/30 rounded-3xl p-8 md:p-12 border border-border/50 relative overflow-hidden",
        imageUrl ? "flex flex-col md:flex-row items-center gap-8" : ""
      )}>
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {imageUrl ? (
          <>
            <div className="flex-1 w-full">{textContent}</div>
            <div className="w-full md:w-2/5 shrink-0">
              <img
                src={imageUrl}
                alt={widget.title || ""}
                className="w-full h-auto rounded-2xl object-cover max-h-[400px]"
              />
            </div>
          </>
        ) : (
          textContent
        )}
      </div>
    </div>
  )
}
