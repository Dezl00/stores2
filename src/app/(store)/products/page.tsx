import React from "react"
import { db } from "@/lib/db"
import { ProductGrid } from "@/components/storefront/product-grid"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { FilterSidebar } from "@/components/storefront/filter-sidebar"
import { StoreToolbar } from "@/components/storefront/store-toolbar"
import { StorePagination } from "@/components/storefront/pagination"

export const revalidate = 3600

import type { Metadata } from "next"

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

import { resolveStoreId } from "@/lib/store-context"

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const storeId = await resolveStoreId()
  const theme = await db.themeConfig.findUnique({ where: { storeId } });
  const storeName = theme?.storeName || "العسال";
  const logo = theme?.logoUrl || "/favicon.ico";
  
  let title = "جميع المنتجات"
  const brandSlug = resolvedParams?.brand as string
  if (brandSlug) {
    const brand = await db.brand.findFirst({ where: { slug: brandSlug, storeId } })
    if (brand) title = `منتجات ${brand.name}`
  }

  return {
    title: title,
    description: `تصفح ${title} في ${storeName}`,
    openGraph: {
      title: `${title} | ${storeName}`,
      description: `تصفح ${title} في ${storeName}`,
      url: `/products${brandSlug ? `?brand=${brandSlug}` : ''}`,
      type: 'website',
      images: [{ url: logo, width: 800, height: 600, alt: storeName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${storeName}`,
      description: `تصفح ${title} في ${storeName}`,
      images: [logo],
    },
  }
}

export default async function AllProductsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const storeId = await resolveStoreId()
  const brandSlugs = resolvedParams?.brand ? (resolvedParams.brand as string).split(",") : []
  const categorySlug = resolvedParams?.category as string
  const minPrice = resolvedParams?.minPrice ? parseFloat(resolvedParams.minPrice as string) : undefined
  const maxPrice = resolvedParams?.maxPrice ? parseFloat(resolvedParams.maxPrice as string) : undefined
  const sort = (resolvedParams?.sort as string) || "newest"
  const page = resolvedParams?.page ? parseInt(resolvedParams.page as string) : 1
  const limit = 20

  let currentBrand = null
  let whereClause: any = { isActive: true, storeId }

  // Apply filters
  if (brandSlugs.length === 1) {
    currentBrand = await db.brand.findFirst({ where: { slug: brandSlugs[0], storeId } })
  }

  if (brandSlugs.length > 0) {
    const brands = await db.brand.findMany({ where: { slug: { in: brandSlugs } } })
    if (brands.length > 0) {
      whereClause.brandId = { in: brands.map(b => b.id) }
    }
  }

  if (categorySlug) {
    const category = await db.category.findFirst({ where: { slug: categorySlug, storeId } })
    if (category) {
      whereClause.categoryId = category.id
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {}
    if (minPrice !== undefined) whereClause.price.gte = minPrice
    if (maxPrice !== undefined) whereClause.price.lte = maxPrice
  }

  const searchQuery = resolvedParams?.q as string
  if (searchQuery) {
    whereClause.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } }
    ]
  }

  const isDiscounted = resolvedParams?.discounted === "true"
  if (isDiscounted) {
    whereClause.discountPrice = { not: null }
  }

  // Apply sorting
  let orderByClause: any = { createdAt: "desc" }
  if (sort === "price_asc") {
    orderByClause = { price: "asc" }
  } else if (sort === "price_desc") {
    orderByClause = { price: "desc" }
  }

  // Fetch count and products
  const [totalProducts, products, categories, brands, priceAggregates] = await Promise.all([
    db.product.count({ where: whereClause }),
    db.product.findMany({
      where: whereClause,
      orderBy: orderByClause,
      take: limit,
      skip: (page - 1) * limit,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
      }
    }),
    db.category.findMany({ where: { storeId }, select: { id: true, name: true, slug: true } }),
    db.brand.findMany({ 
      where: categorySlug ? {
        storeId,
        products: { some: { category: { slug: categorySlug } } }
      } : { storeId },
      select: { id: true, name: true, slug: true } 
    }),
    db.product.aggregate({
      where: whereClause, // Get min/max price for the current filtered view (or remove whereClause to get global min/max)
      _min: { price: true },
      _max: { price: true }
    })
  ])

  const globalMinPrice = priceAggregates._min.price || 0
  const globalMaxPrice = priceAggregates._max.price || 10000

  const totalPages = Math.ceil(totalProducts / limit)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-12">
      {/* Page Header */}
      <div className="mb-8 sm:mb-12 relative overflow-hidden rounded-3xl bg-primary p-8 sm:p-16 text-center shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-primary-foreground mb-4">
            {currentBrand ? `منتجات ${currentBrand.name}` : "جميع المنتجات"}
          </h1>
          <p className="text-base sm:text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-6">
            {currentBrand ? `تصفح منتجات ماركة ${currentBrand.name} الفاخرة` : "تصفح تشكيلتنا الكاملة من المنتجات الفاخرة"}
          </p>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-primary-foreground/80 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Link prefetch={false} href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <span className="text-white font-medium">{currentBrand ? currentBrand.name : "جميع المنتجات"}</span>
          </nav>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar 
          categories={categories} 
          brands={brands}
          globalMinPrice={globalMinPrice}
          globalMaxPrice={globalMaxPrice}
        />
        
        <div className="flex-1 min-w-0">
          <StoreToolbar totalProducts={totalProducts} />
          
          {products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              <StorePagination totalPages={totalPages} currentPage={page} />
            </>
          ) : (
            <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
              <h2 className="text-2xl font-bold text-foreground mb-2">لا توجد منتجات</h2>
              <p className="text-muted-foreground">لم يتم العثور على منتجات تطابق معايير البحث الخاصة بك.</p>
              <Link prefetch={false} href="/products" className="inline-block mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">
                مسح الفلاتر
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
