"use server"

import { db } from "@/lib/db"
import { resolveStoreId } from "@/lib/store-context"

export async function searchProductsLive(query: string) {
  if (!query || query.trim().length === 0) return []
  
  try {
    const storeId = await resolveStoreId()
    const products = await db.product.findMany({
      where: {
        storeId,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } }
        ]
      },
      take: 5,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        category: { select: { slug: true, name: true } }
      }
    })
    
    return products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      discountPrice: p.discountPrice,
      images: p.images, // ProductCard expects this
      imageUrl: p.images[0]?.url,
      categorySlug: p.category?.slug || 'uncategorized',
      categoryName: p.category?.name || '',
      stock: p.stock // Add stock for ProductCard quick add
    }))
  } catch (error) {
    console.error("Live search error:", error)
    return []
  }
}
