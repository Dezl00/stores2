"use client"
import React from "react"
import { useUIStore } from "@/store/ui-store"
import { ProductCard } from "./product-card"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { PackageSearch } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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

  // Instead of CSS Grid, we use Flexbox with calculated widths so Framer Motion can animate the resizing smoothly!
  const getCardWidthClass = () => {
    if (viewMode === "list") {
      // 1 column on mobile, 3 on md, 4 on lg, 5 on xl
      // Mobile uses gap-2 (8px), sm+ uses gap-4 (16px)
      return "w-full md:w-[calc(33.33%-10.66px)] lg:w-[calc(25%-12px)] xl:w-[calc(20%-12.8px)]"
    } else {
      // 2 columns on mobile, 3 on md, 4 on lg, 5 on xl
      return "w-[calc(50%-4px)] md:w-[calc(33.33%-10.66px)] lg:w-[calc(25%-12px)] xl:w-[calc(20%-12.8px)]"
    }
  }

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
      
      <motion.div layout className="flex flex-wrap gap-2 sm:gap-4">
        <AnimatePresence>
          {products.map((product, index) => (
            <motion.div 
              layout 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ 
                layout: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 }
              }}
              key={product.id} 
              className={getCardWidthClass()}
            >
              <ProductCard product={product} disableAnimation={true} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
