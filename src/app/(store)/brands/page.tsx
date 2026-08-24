import React from "react"
import { db } from "@/lib/db"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export const revalidate = 3600

export default async function BrandsPage() {
  const brands = await db.brand.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  })

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-12 md:py-20">
      {/* Internal Header */}
      <div className="mb-8 sm:mb-12 relative overflow-hidden rounded-3xl bg-primary p-8 sm:p-16 text-center shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-primary-foreground mb-4">الماركات</h1>
          <p className="text-base sm:text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-6">تصفح منتجاتنا حسب الماركات المفضلة لديك</p>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-primary-foreground/80 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Link prefetch={false} href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <span className="text-white font-medium">الماركات</span>
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {brands.map(brand => (
          <Link prefetch={false} href={`/brand/${brand.slug}`} key={brand.id}>
            <div className="bg-card border border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 h-full aspect-square text-center group">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.name} className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300">
                  {brand.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{brand.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{brand._count.products} منتج</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {brands.length === 0 && (
        <div className="text-center text-muted-foreground py-20 bg-secondary/20 rounded-2xl">
          لا توجد ماركات مضافة حتى الآن.
        </div>
      )}
    </div>
  )
}
