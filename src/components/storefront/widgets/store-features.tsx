"use client"

import React from "react"
import { Truck, ShieldCheck, Tag, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

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
  // Merge saved items with defaults (always 4 features, never more/less)
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
  const visibleItems = items.filter(f => !f.hidden)

  if (visibleItems.length === 0) return null

  return (
    <div className={cn("w-full", bgEnabled ? "bg-secondary" : "bg-transparent")}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {visibleItems.map((item) => {
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
                    bgEnabled ? "text-secondary-foreground" : "text-foreground"
                  )}>{item.title}</h3>
                  <p className={cn(
                    "text-sm",
                    bgEnabled ? "text-secondary-foreground/80" : "text-muted-foreground"
                  )}>{item.subtitle}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
