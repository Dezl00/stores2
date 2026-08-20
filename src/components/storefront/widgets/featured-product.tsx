import React from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { AddToCartForm } from "@/components/storefront/add-to-cart-form"
import { Badge } from "@/components/ui/badge"

export async function FeaturedProductWidget({ widget }: { widget: any }) {
  const productIdOrSlug = widget.settings?.productId

  if (!productIdOrSlug) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl opacity-50">🏷️</span>
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">{widget.title || "منتج مميز"}</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            الرجاء اختيار منتج من إعدادات القسم لعرضه هنا.
          </p>
        </div>
      </div>
    )
  }

  // Since it was saved as slug by the ProductPickerModal with returnSlug={true}, we fetch by slug or ID
  const product = await db.product.findFirst({
    where: {
      OR: [
        { slug: productIdOrSlug },
        { id: productIdOrSlug }
      ]
    },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1
      },
      category: true
    }
  })

  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl opacity-50">🏷️</span>
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">{widget.title || "منتج مميز"}</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            المنتج المحدد غير موجود. يرجى اختيار منتج آخر من الإعدادات.
          </p>
        </div>
      </div>
    )
  }

  const themeConfig = await db.themeConfig.findUnique({ where: { id: "default" } })
  const fallbackLogo = themeConfig?.logoUrl

  const mainImage = product.images[0]?.url || fallbackLogo || "/placeholder-product.jpg"
  const finalPrice = product.discountPrice ?? product.price
  const hasDiscount = product.discountPrice !== null && product.discountPrice < product.price
  
  let discountPercentage = 0;
  if (hasDiscount && product.price > 0) {
    discountPercentage = Math.round(((product.price - product.discountPrice!) / product.price) * 100);
  }

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

      <ScrollReveal variant="fade-up" delay={0.1}>
        <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 p-4 md:p-10">
            {/* Image Column */}
            <div className="relative h-[250px] sm:h-[300px] md:h-[350px] lg:h-[450px] bg-muted/10 rounded-xl overflow-hidden flex items-center justify-center p-4 md:p-8">
              {hasDiscount && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="destructive" className="px-3 py-1 text-sm font-bold">
                    خصم {discountPercentage}%
                  </Badge>
                </div>
              )}
              <Link prefetch={false} href={`/product/${product.slug}`} className="absolute inset-0 z-0">
                <div 
                  className="w-full h-full bg-contain bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
                  style={{ backgroundImage: `url(${mainImage})` }}
                />
              </Link>
            </div>

            {/* Content Column */}
            <div className="flex flex-col justify-center space-y-3">
              <div className="space-y-1">
                {product.category && (
                  <Link prefetch={false} href={`/category/${product.category.slug}`} className="text-sm font-medium text-primary hover:underline">
                    {product.category.name}
                  </Link>
                )}
                <Link prefetch={false} href={`/product/${product.slug}`}>
                  <h3 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
              </div>

              {product.description && (
                <p className="text-muted-foreground line-clamp-3 text-lg leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="flex items-end gap-4 pb-4 border-b border-border/50">
                <div className="flex flex-col">
                  <span className="text-3xl font-semibold text-foreground">
                    {finalPrice} <span className="text-lg text-muted-foreground font-normal">ج.م</span>
                  </span>
                </div>
                {hasDiscount && (
                  <div className="flex flex-col mb-1">
                    <span className="text-lg text-muted-foreground line-through decoration-destructive/50 decoration-2">
                      {product.price} ج.م
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-0 w-full">
                <AddToCartForm product={product} />
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}
