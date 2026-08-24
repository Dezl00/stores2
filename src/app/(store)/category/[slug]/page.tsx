import React from "react"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { CategoryProductGrid } from "@/components/storefront/category-product-grid"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { FilterSidebar } from "@/components/storefront/filter-sidebar"
import { StoreToolbar } from "@/components/storefront/store-toolbar"
import { StorePagination } from "@/components/storefront/pagination"

import type { Metadata } from "next"

import { cache } from "react"

export const revalidate = 3600

import { resolveStoreId } from "@/lib/store-context"

const getCategory = cache(async (slug: string) => {
  return db.category.findFirst({
    where: { slug, storeId: await resolveStoreId() },
    include: {
      parent: true,
      children: { orderBy: { createdAt: "asc" } },
    }
  })
})

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const [category, theme] = await Promise.all([
    getCategory(decodeURIComponent(params.slug)),
    db.themeConfig.findUnique({ where: { storeId: await resolveStoreId() } })
  ])
  
  if (!category) return { title: "القسم غير موجود" }
  
  const storeName = theme?.storeName || "العسال";
  const ogImages = category.imageUrl 
    ? [{ url: category.imageUrl, width: 800, height: 600, alt: category.name }]
    : [];

  return {
    title: category.name,
    description: category.description || `تصفح منتجات قسم ${category.name} في ${storeName}`,
    openGraph: {
      title: `${category.name} | ${storeName}`,
      description: category.description || `تصفح منتجات قسم ${category.name} في ${storeName}`,
      url: `/category/${category.slug}`,
      type: 'website',
      siteName: storeName,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} | ${storeName}`,
      description: category.description || `تصفح منتجات قسم ${category.name} في ${storeName}`,
      images: ogImages.map(img => img.url),
    },
  }
}

export default async function CategoryPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const categorySlug = decodeURIComponent(params.slug);
  const category = await getCategory(categorySlug)

  if (!category) notFound()

  // Build filter where clause
  const brandSlugs = searchParams?.brand ? (searchParams.brand as string).split(",") : []
  const minPrice = searchParams?.minPrice ? parseFloat(searchParams.minPrice as string) : undefined
  const maxPrice = searchParams?.maxPrice ? parseFloat(searchParams.maxPrice as string) : undefined
  const sort = (searchParams?.sort as string) || "newest"
  const page = searchParams?.page ? parseInt(searchParams.page as string) : 1
  const limit = 20

  let whereClause: any = { categoryId: category.id, isActive: true, storeId: await resolveStoreId() }

  if (brandSlugs.length > 0) {
    const brands = await db.brand.findMany({ where: { slug: { in: brandSlugs }, storeId: await resolveStoreId() } })
    if (brands.length > 0) {
      whereClause.brandId = { in: brands.map(b => b.id) }
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

  const [totalProducts, products, brands, priceAggregates] = await Promise.all([
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
    db.brand.findMany({ 
      where: { storeId: await resolveStoreId(), products: { some: { categoryId: category.id } } },
      select: { id: true, name: true, slug: true } 
    }),
    db.product.aggregate({
      where: { categoryId: category.id, storeId: await resolveStoreId() },
      _min: { price: true },
      _max: { price: true }
    })
  ])

  const globalMinPrice = priceAggregates._min.price || 0
  const globalMaxPrice = priceAggregates._max.price || 10000

  const totalPages = Math.ceil(totalProducts / limit)
  const isMainCategory = !category.parentId

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-12">
      {/* Category Header */}
      <div className="mb-12 relative overflow-hidden rounded-3xl bg-primary p-10 sm:p-16 text-center shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary-foreground mb-4">{category.name}</h1>
          
          <nav className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80 justify-center">
            <Link prefetch={false} href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronRight className="w-4 h-4 rtl-flip" />
            
            {category.parent && (
              <>
                <Link prefetch={false} href={`/category/${category.parent.slug}`} className="hover:text-white transition-colors">
                  {category.parent.name}
                </Link>
                <ChevronRight className="w-4 h-4 rtl-flip" />
              </>
            )}
            
            <span className="text-white font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {isMainCategory && category.children.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">الأقسام الفرعية</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {category.children.map(child => (
              <Link prefetch={false} 
                key={child.id} 
                href={`/category/${child.slug}`}
                className="group relative rounded-2xl border border-border/50 bg-card p-4 text-center transition-all hover:border-primary/50 hover:shadow-lg"
              >
                {child.imageUrl && (
                  <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border border-border/50 bg-muted flex items-center justify-center p-4">
                    <img src={child.imageUrl} alt={child.name} className="h-full w-full object-contain transition-transform group-hover:scale-110" />
                  </div>
                )}
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{child.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(!isMainCategory || category.children.length === 0 || products.length > 0) && (
        <div className="flex flex-col lg:flex-row gap-8">
          {(!isMainCategory || category.children.length === 0) && (
            <FilterSidebar 
              categories={[]} 
              brands={brands} 
              globalMinPrice={globalMinPrice}
              globalMaxPrice={globalMaxPrice}
            />
          )}
          
          <div className="flex-1 min-w-0">
            <StoreToolbar totalProducts={totalProducts} hideToolbar={isMainCategory && category.children.length > 0} />
            <CategoryProductGrid products={products} />
            {products.length > 0 && <StorePagination totalPages={totalPages} currentPage={page} />}
          </div>
        </div>
      )}
    </div>
  )
}
