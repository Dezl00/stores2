"use client"
import React from "react"
import Link from "next/link"
import { ProductGrid } from "@/components/storefront/product-grid"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function FeaturedProductsClient({ widget, products }: { widget: any, products: any[] }) {
  if (products.length === 0) {
    return (
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-6">
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl opacity-50">⭐</span>
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">{widget.title || "منتجات مختارة"}</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            لا توجد منتجات لعرضها. تأكد من إضافة منتجات لمتجرك لتظهر هنا.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-6">
      {widget.title && widget.title !== "" ? (
        <ScrollReveal variant="fade-up" duration={0.5}>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">{widget.title}</h2>
              {widget.subtitle && <p className="text-muted-foreground mt-2">{widget.subtitle}</p>}
            </div>
            <Link prefetch={false} href="/products" className="text-primary hover:underline font-medium text-sm hidden sm:block">
              عرض الكل
            </Link>
          </div>
        </ScrollReveal>
      ) : (
        <ScrollReveal variant="fade-up" duration={0.4}>
          <div className="flex justify-end mb-6">
            <Link prefetch={false} href="/products" className="text-primary hover:underline font-medium text-sm hidden sm:block">
              عرض الكل
            </Link>
          </div>
        </ScrollReveal>
      )}
      
      <ProductGrid products={products} />
    </div>
  )
}
