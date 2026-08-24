"use client"
import React from "react"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { ProductGrid } from "@/components/storefront/product-grid"
import { ChevronLeft } from "lucide-react"
import { SimilarProductsCarousel } from "@/components/storefront/product/similar-products-carousel"

export function ProductListClient({ widget, products, collectionItem }: { widget: any, products: any[], collectionItem: any }) {
  if (products.length === 0) return null

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6">
        <ScrollReveal variant="fade-up">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{collectionItem.title || widget.title}</h2>
              {(collectionItem.subtitle || widget.subtitle) && (
                <p className="text-muted-foreground mt-1">{collectionItem.subtitle || widget.subtitle}</p>
              )}
            </div>
            
            {collectionItem.buttonUrl && (
              <Link prefetch={false} 
                href={collectionItem.buttonUrl} 
                className="group flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                عرض الكل
                <ChevronLeft className="ml-1 w-4 h-4 rtl-flip transition-transform group-hover:-translate-x-1" />
              </Link>
            )}
          </div>
        </ScrollReveal>

        {widget.settings?.displayMode === 'carousel' ? (
          <div className="w-full">
            <SimilarProductsCarousel products={products} />
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </section>
  )
}
