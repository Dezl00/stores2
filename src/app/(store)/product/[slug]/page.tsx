import React from "react"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { ChevronRight, Truck, ShieldCheck, Tag } from "lucide-react"
import { ProductGallery } from "@/components/storefront/product-gallery"
import { AddToCartForm } from "@/components/storefront/add-to-cart-form"
import { ShareButton } from "@/components/storefront/share-button"
import { ProductTabs } from "@/components/storefront/product-tabs"
import { ProductFeatures } from "@/components/storefront/product-features"
import { ProductCard } from "@/components/storefront/product-card"
import { SimilarProductsCarousel } from "@/components/storefront/product/similar-products-carousel"

import type { Metadata } from "next"
import { logProductView } from "@/features/analytics/actions"

import { cache } from "react"

import { resolveStoreId } from "@/lib/store-context"

const getProduct = cache(async (slug: string) => {
  return db.product.findFirst({
    where: { slug, isActive: true, storeId: await resolveStoreId() },
    include: { 
      images: { orderBy: { sortOrder: 'asc' } },
      category: {
        include: {
          department: true,
          parent: { include: { department: true } }
        }
      },
      brand: true,
    }
  })
})

// Generate metadata for SEO
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const [product, theme] = await Promise.all([
    getProduct(decodeURIComponent(params.slug)),
    db.themeConfig.findUnique({ where: { storeId: await resolveStoreId() } })
  ])
  
  if (!product) return { title: "المنتج غير موجود" }
  
  const storeName = theme?.storeName || "العسال";
  const ogImages = product.images.length > 0 
    ? product.images.map(img => ({ url: img.url, width: 800, height: 800, alt: product.name }))
    : [];

  return {
    title: product.name, // Next.js layout template will automatically append | storeName to the <title> tag
    description: product.description || undefined,
    openGraph: {
      title: `${product.name} | ${storeName}`,
      description: product.description || undefined,
      url: `/product/${product.slug}`,
      type: 'website',
      siteName: storeName,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${storeName}`,
      description: product.description || undefined,
      images: ogImages.map(img => img.url),
    },
  }
}

import { headers } from "next/headers"

export default async function ProductDetailsPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const productSlug = decodeURIComponent(params.slug);
  const product = await getProduct(productSlug)

  if (!product || !product.isActive) {
    notFound()
  }

  // Log product view asynchronously
  logProductView(product.id)

  // Fetch related products
  const relatedProducts = await db.product.findMany({
    where: { 
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
      storeId: await resolveStoreId()
    },
    take: 4,
    include: { images: true, category: true }
  })

  const finalPrice = product.discountPrice ?? product.price
  const hasDiscount = product.discountPrice !== null && product.discountPrice < product.price

  const category = product.category
  const dept = category.department || (category.parent as any)?.department

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 overflow-hidden whitespace-nowrap">
        <Link prefetch={false} href="/" className="hover:text-primary transition-colors flex-shrink-0">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rtl-flip flex-shrink-0" />
        
        {dept && (
          <>
            <Link prefetch={false} href={`/department/${dept.slug}`} className="hover:text-primary transition-colors truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
              {dept.name}
            </Link>
            <ChevronRight className="w-4 h-4 rtl-flip flex-shrink-0" />
          </>
        )}
        
        {category.parent && (
          <>
            <Link prefetch={false} href={`/category/${category.parent.slug}`} className="hover:text-primary transition-colors truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
              {category.parent.name}
            </Link>
            <ChevronRight className="w-4 h-4 rtl-flip flex-shrink-0" />
          </>
        )}

        <Link prefetch={false} href={`/category/${category.slug}`} className="hover:text-primary transition-colors truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
          {category.name}
        </Link>
        <ChevronRight className="w-4 h-4 rtl-flip flex-shrink-0" />
        <span className="text-foreground font-medium truncate min-w-0 flex-1 sm:flex-none sm:max-w-none">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        
        {/* Gallery */}
        <div className="lg:sticky lg:top-28 self-start">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-semibold md:font-bold tracking-tight text-foreground leading-tight">
              {product.name}
            </h1>
            <ShareButton title={product.name} url={`https://assal1.vercel.app/product/${product.id}`} />
          </div>

          <div className="flex items-end gap-4 mb-3">
            <span className="text-3xl md:text-4xl font-bold md:font-black text-primary">{finalPrice.toFixed(2)} ج.م</span>
            {hasDiscount && (
              <span className="text-xl text-muted-foreground line-through mb-1">
                {product.price.toFixed(2)} ج.م
              </span>
            )}
            {hasDiscount && (
              <span className="bg-destructive/10 text-destructive font-bold px-3 py-1 rounded-full text-sm mb-1 ml-auto">
                توفير {((1 - finalPrice / product.price) * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {/* SKU and Brand */}
          <div className="flex flex-col gap-3 text-sm text-muted-foreground mb-8 pb-8 border-b border-border/50">
            {product.sku && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">الرمز (SKU):</span>
                <span className="font-mono">{product.sku}</span>
              </div>
            )}
            {product.brand && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">الماركة:</span>
                <Link prefetch={false} href={`/brand/${product.brand.slug}`} className="text-primary font-bold hover:underline">
                  {product.brand.name}
                </Link>
              </div>
            )}
          </div>

          {/* Add to Cart Actions */}
          <AddToCartForm product={product as any} />

          {/* Product Tabs (Description & Shipping) */}
          <div className="mt-8">
            <ProductTabs description={product.description} />
          </div>

          {/* Features Slider */}
          <ProductFeatures />
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-16 border-t border-border/50">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold tracking-tight">منتجات مشابهة</h2>
          </div>
          <SimilarProductsCarousel products={relatedProducts} />
        </div>
      )}
    </div>
  )
}
