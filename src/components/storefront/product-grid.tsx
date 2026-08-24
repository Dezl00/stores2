"use client"
import React from "react"
import { ProductCard } from "./product-card"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { useUIStore } from "@/store/ui-store"
import { PackageSearch } from "lucide-react"

export function ProductGrid({ products, title, subtitle }: { products: any[], title?: string, subtitle?: string }) {
  const { themeConfig } = useUIStore()
  const mobileCols = themeConfig?.headerSettings?.productCard?.mobileCols || "2"
  const desktopCols = themeConfig?.headerSettings?.productCard?.desktopCols || "4"
  
  const getGridClass = () => {
    let cls = "gap-4 sm:gap-6 "
    
    // Mobile setup
    if (mobileCols === "1.5") {
      cls += "flex overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 [&>div]:min-w-[75vw] [&>div]:shrink-0 [&>div]:snap-center md:grid md:[&>div]:min-w-0 md:mx-0 md:px-0 md:pb-0 "
    } else {
      cls += "grid "
      cls += mobileCols === "1" ? "grid-cols-1 " : "grid-cols-2 "
    }
    
    // Desktop setup
    cls += "md:grid-cols-3 "
    cls += desktopCols === "4" ? "lg:grid-cols-4" : desktopCols === "5" ? "lg:grid-cols-5" : desktopCols === "6" ? "lg:grid-cols-6" : "lg:grid-cols-4"
    
    return cls
  }
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground">
          <PackageSearch className="w-10 h-10" strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-bold mb-2">لا توجد منتجات في القسم الحالي</h3>
      </div>
    )
  }

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-10 text-center md:text-right">
          {title && <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>}
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
      )}
      
      <div className={getGridClass()}>
        {products.map((product, index) => (
          <ScrollReveal
            key={product.id}
            variant="fade-up"
            delay={index * 0.08}
            duration={0.6}
            className="h-full"
          >
            <ProductCard product={product} disableAnimation={true} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
