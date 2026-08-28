"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Truck, ShieldCheck, Tag, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

const ICON_MAP: Record<string, any> = {
  Truck,
  ShieldCheck,
  Tag,
  RotateCcw,
}

const DEFAULT_FEATURES = [
  { id: "feat-1", title: "شحن سريع", subtitle: "لجميع المدن", iconName: "Truck", hidden: false },
  { id: "feat-2", title: "ضمان الجودة", subtitle: "أصلية 100%", iconName: "ShieldCheck", hidden: false },
  { id: "feat-3", title: "أفضل الأسعار", subtitle: "قيمة ممتازة", iconName: "Tag", hidden: false },
  { id: "feat-4", title: "إمكانية الإرجاع", subtitle: "استرجاع سهل", iconName: "RotateCcw", hidden: false },
]

export function StoreFeatures({ widget }: { widget?: any }) {
  const savedItems = widget?.items || []
  const items = DEFAULT_FEATURES.map((def, idx) => {
    const saved = savedItems[idx]
    if (saved) {
      return {
        ...def,
        title: saved.title || def.title,
        subtitle: saved.subtitle || saved.description || def.subtitle,
        hidden: saved.hidden === true || saved.settings?.hidden === true,
      }
    }
    return def
  })

  const bgEnabled = widget?.settings?.bgEnabled !== false
  const bgColor = widget?.settings?.backgroundColor || "#f1f5f9" // default secondary
  const sliderEnabled = widget?.settings?.sliderEnabled !== false // default true

  const visibleItems = items.filter(f => !f.hidden)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, direction: "rtl", align: "start" },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi, onSelect])

  if (visibleItems.length === 0) return null

  const renderFeatureItem = (item: any) => {
    const Icon = ICON_MAP[item.iconName] || Truck
    return (
      <div key={item.id} className="flex flex-col items-center justify-center text-center group">
        <div className={cn(
          "w-16 h-16 md:w-20 md:h-20 rounded-full shadow-sm flex items-center justify-center mb-3 md:mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md",
          bgEnabled
            ? "bg-primary text-primary-foreground group-hover:bg-primary/90"
            : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
        )}>
          <Icon className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
        </div>
        <h3 className={cn(
          "font-semibold text-base md:text-lg mb-1",
          bgEnabled ? "text-foreground" : "text-foreground" // user said dark color like other texts when no bg
        )}>{item.title}</h3>
        <p className={cn(
          "text-sm",
          bgEnabled ? "text-foreground/80" : "text-muted-foreground"
        )}>{item.subtitle}</p>
      </div>
    )
  }

  return (
    <div 
      className="w-full"
      style={bgEnabled ? { backgroundColor: bgColor } : {}}
    >
      <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          {sliderEnabled ? (
            <div className="relative">
              <div className="overflow-hidden" ref={emblaRef} dir="rtl">
                <div className="flex -ml-4">
                  {visibleItems.map((item) => (
                    <div key={item.id} className="pl-4 min-w-[50%] md:min-w-[25%] shrink-0">
                      {renderFeatureItem(item)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-8 md:hidden">
                {visibleItems.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      index === selectedIndex
                        ? "bg-primary w-6"
                        : bgEnabled ? "bg-primary/30" : "bg-slate-300"
                    )}
                    onClick={() => emblaApi?.scrollTo(index)}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {visibleItems.map((item) => renderFeatureItem(item))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
