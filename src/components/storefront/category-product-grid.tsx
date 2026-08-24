"use client"
import React from "react"
import { useUIStore } from "@/store/ui-store"
import { ProductCard } from "./product-card"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { PackageSearch } from "lucide-react"
import { motion } from "framer-motion"

export function CategoryProductGrid({ products, title, subtitle }: { products: any[], title?: string, subtitle?: string }) {
  const { categoryViewMode: viewMode } = useUIStore()
  
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
    ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4"
    : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4"

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="text-center md:text-right">
            {title && <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>}
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>
        </div>
      )}
      
      <motion.div layout className={gridClasses}>
        {products.map((product, index) => (
          <motion.div 
            layout 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.4 }}
            key={product.id} 
            className="h-full"
          >
            <ScrollReveal
              variant="fade-up"
              delay={index * 0.08}
              duration={0.6}
              className="h-full"
            >
              <ProductCard product={product} disableAnimation={true} />
            </ScrollReveal>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
