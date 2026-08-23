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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
    <div className={cn("space-y-4", alignClass, imageUrl && "md:flex-1 md:w-full")}>
      {widget.title && (
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">{widget.title}</h2>
      )}
      {widget.subtitle && (
        <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">{widget.subtitle}</p>
      )}
      {buttonText && (
        <div className={cn(
          "pt-4 flex", 
          textAlign === "right" ? "justify-start" : textAlign === "left" ? "justify-end" : "justify-center"
        )}>
          {hasLink ? (
            <Link href={href}>
              <Button className="rounded-full px-8 py-5 text-base font-bold shadow-md">
                {buttonText}
              </Button>
            </Link>
          ) : (
            <Button className="rounded-full px-8 py-5 text-base font-bold shadow-md">
              {buttonText}
            </Button>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className={cn(
        "w-full",
        imageUrl ? "flex flex-col md:flex-row items-center gap-8 md:gap-12" : ""
      )}>
        {imageUrl ? (
          <>
            {textContent}
            <div className="w-full md:w-2/5 shrink-0">
              <img
                src={imageUrl}
                alt={widget.title || ""}
                className="w-full h-auto rounded-2xl object-cover max-h-[400px] shadow-sm"
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
