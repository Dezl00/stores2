import React from "react"
import { db } from "@/lib/db"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/storefront/product-card"
import { notFound } from "next/navigation"

export const revalidate = 3600

import { resolveStoreId } from "@/lib/store-context"

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const storeId = await resolveStoreId()
  
  const collection = await db.collection.findFirst({
    where: { slug: slug, storeId },
    include: {
      products: {
        include: {
          category: true,
          brand: true,
          images: true,
        }
      }
    }
  })

  if (!collection) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-12">
      <div className="mb-8 sm:mb-12 relative overflow-hidden rounded-3xl bg-primary p-8 sm:p-16 text-center shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-primary-foreground mb-4">
            {collection.name}
          </h1>
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-primary-foreground/80 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Link prefetch={false} href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <span className="text-white font-medium">{collection.name}</span>
          </nav>
        </div>
      </div>

      {collection.products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {collection.products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-20 bg-secondary/20 rounded-2xl">
          لا توجد منتجات في هذه القائمة حتى الآن.
        </div>
      )}
    </div>
  )
}
