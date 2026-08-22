"use client"
import React from "react"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { ProductCard } from "@/components/storefront/product-card"
import { ChevronLeft } from "lucide-react"
import { SimilarProductsCarousel } from "@/components/storefront/product/similar-products-carousel"

export function ProductListClient({ widget, products, collectionItem }: { widget: any, products: any[], collectionItem: any }) {
  if (products.length === 0) return null

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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

        {widget.settings?.displayMode !== "grid" ? (
          <div className="w-full">
            <SimilarProductsCarousel products={products} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product, index) => (
              <ScrollReveal key={product.id} variant="fade-up" delay={index * 0.1}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
