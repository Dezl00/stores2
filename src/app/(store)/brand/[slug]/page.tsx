import React from "react"
import { db } from "@/lib/db"
import { CategoryProductGrid } from "@/components/storefront/category-product-grid"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { FilterSidebar } from "@/components/storefront/filter-sidebar"
import { StoreToolbar } from "@/components/storefront/store-toolbar"
import { StorePagination } from "@/components/storefront/pagination"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

import { cache } from "react"

import { resolveStoreId } from "@/lib/store-context"

export const revalidate = 3600

const getBrand = cache(async (slug: string) => {
  const storeId = await resolveStoreId()
  return db.brand.findFirst({ where: { slug, storeId } })
})

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const brandSlug = decodeURIComponent(params.slug);
  const brand = await getBrand(brandSlug)
  const theme = await db.themeConfig.findUnique({ where: { storeId: await resolveStoreId() } })
  
  if (!brand) return { title: "الماركة غير موجودة" }
  
  const storeName = theme?.storeName || "العسال"
  const title = `منتجات ${brand.name}`
  const logo = brand.logoUrl || theme?.logoUrl || "/favicon.ico"

  return {
    title: title,
    description: `تصفح ${title} في ${storeName}`,
    openGraph: {
      title: `${title} | ${storeName}`,
      description: `تصفح ${title} في ${storeName}`,
      url: `/brand/${brand.slug}`,
      type: 'website',
      images: [{ url: logo, width: 800, height: 600, alt: brand.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${storeName}`,
      description: `تصفح ${title} في ${storeName}`,
      images: [logo],
    },
  }
}

export default async function BrandPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const brandSlug = decodeURIComponent(params.slug);
  const brand = await getBrand(brandSlug)
  if (!brand) notFound()

  const categorySlug = searchParams?.category as string
  const minPrice = searchParams?.minPrice ? parseFloat(searchParams.minPrice as string) : undefined
  const maxPrice = searchParams?.maxPrice ? parseFloat(searchParams.maxPrice as string) : undefined
  const sort = (searchParams?.sort as string) || "newest"
  const page = searchParams?.page ? parseInt(searchParams.page as string) : 1
  const limit = 20

  let whereClause: any = { brandId: brand.id, isActive: true, storeId: await resolveStoreId() }

  if (categorySlug) {
    const category = await db.category.findFirst({ where: { slug: categorySlug, storeId: await resolveStoreId() } })
    if (category) {
      whereClause.categoryId = category.id
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {}
    if (minPrice !== undefined) whereClause.price.gte = minPrice
    if (maxPrice !== undefined) whereClause.price.lte = maxPrice
  }

  let orderByClause: any = { createdAt: "desc" }
  if (sort === "price_asc") orderByClause = { price: "asc" }
  else if (sort === "price_desc") orderByClause = { price: "desc" }

  const [totalProducts, products, categories] = await Promise.all([
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
    db.category.findMany({ 
      where: { storeId: await resolveStoreId() },
      select: { id: true, name: true, slug: true } 
    }),
  ])

  const totalPages = Math.ceil(totalProducts / limit)

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-12 min-h-[60vh]">
      <div className="mb-8 sm:mb-12 relative overflow-hidden rounded-3xl bg-primary p-8 sm:p-16 text-center shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          {brand.logoUrl && (
            <div className="w-24 h-24 rounded-full border-4 border-white/20 bg-white overflow-hidden shrink-0 flex items-center justify-center p-3 shadow-xl mb-4">
              <img src={brand.logoUrl} alt={brand.name} className="max-w-full max-h-full object-contain" />
            </div>
          )}
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-primary-foreground mb-4">{brand.name}</h1>
          <p className="text-base sm:text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-6">{totalProducts} منتجات</p>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-primary-foreground/80 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Link prefetch={false} href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <Link prefetch={false} href="/brands" className="hover:text-white transition-colors">الماركات</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <span className="text-white font-medium">{brand.name}</span>
          </nav>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar categories={categories} brands={[]} />
        
        <div className="flex-1 min-w-0">
          <StoreToolbar totalProducts={totalProducts} />
          
          {products.length > 0 ? (
            <>
              <CategoryProductGrid products={products} />
              <StorePagination totalPages={totalPages} currentPage={page} />
            </>
          ) : (
            <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
              <h2 className="text-2xl font-bold text-foreground mb-2">لا توجد منتجات</h2>
              <p className="text-muted-foreground">لم يتم العثور على منتجات تطابق معايير البحث.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
