"use client"
import React from "react"
import Link from "next/link"
import { getValidLink } from "@/lib/utils"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function BannerGrid({ widget }: { widget: any }) {
  const items = widget.items || []

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl opacity-50">🖼️</span>
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">{widget.title || "شبكة بانرات"}</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            قم بإضافة صور للبانرات من الإعدادات لتظهر هنا.
          </p>
        </div>
      </div>
    )
  }

  // If 1 item, full width. If 2, half. If 3+, grid.
  const gridCols = items.length === 1 ? 'grid-cols-1' : items.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'

  // Settings
  const textPosition = widget.settings?.textPosition || "bottom"
  const textAlign = widget.settings?.textAlign || "center"
  const overlayEnabled = widget.settings?.overlayEnabled ?? false
  const overlayOpacity = widget.settings?.overlayOpacity ?? 40

  const flexPosition = 
    textPosition === "top" ? "justify-start" : 
    textPosition === "center" ? "justify-center" : 
    "justify-end"
  
  const textJustify = 
    textAlign === "right" ? "items-start text-start" : 
    textAlign === "left" ? "items-end text-end" : 
    "items-center text-center"

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {widget.title && (
        <ScrollReveal variant="fade-up" duration={0.5}>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">{widget.title}</h2>
            {widget.subtitle && <p className="text-muted-foreground mt-2">{widget.subtitle}</p>}
          </div>
        </ScrollReveal>
      )}
      
      <div className={`grid gap-6 ${gridCols}`}>
        {items.slice(0, 3).map((item: any, index: number) => (
          <ScrollReveal 
            key={item.id} 
            variant="fade-up"
            delay={index * 0.12}
            duration={0.7}
          >
            <Link prefetch={false} 
              href={getValidLink(item.buttonUrl)} 
              className="group relative h-[300px] md:h-[400px] overflow-hidden rounded-2xl block"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${item.desktopImage})` }}
              />
              {overlayEnabled && overlayOpacity > 0 && (
                <div 
                  className="absolute inset-0 transition-colors duration-500" 
                  style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }}
                />
              )}
              <div className={`absolute inset-0 flex flex-col ${flexPosition} ${textJustify} p-6 md:p-8`}>
                <h3 className="text-2xl md:text-3xl font-semibold text-white transition-transform duration-500 group-hover:-translate-y-2">
                  {item.title}
                </h3>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
