"use client"
import React, { useState } from "react"
import { ProductCard } from "./product-card"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { PackageSearch, LayoutGrid, Rows } from "lucide-react"

export function CategoryProductGrid({ products, title, subtitle }: { products: any[], title?: string, subtitle?: string }) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
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

  // Base classes for responsive scaling
  // For mobile: List = 1 col, Grid = 2 cols
  // For desktop: Always scales 3 -> 4 -> 5 comfortably
  const gridClasses = viewMode === "list" 
    ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
    : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        {(title || subtitle) ? (
          <div className="text-center md:text-right">
            {title && <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>}
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>
        ) : <div />}
        
        {/* View mode toggle - shown primarily on mobile/tablet screens */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl md:hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold \${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold \${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Rows className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className={gridClasses}>
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
