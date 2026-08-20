import React from "react"
import { db } from "@/lib/db"
import { FeaturedProductsClient } from "./featured-products-client"

export async function FeaturedProducts({ widget }: { widget: any }) {
  const { resolveStoreId } = await import("@/lib/store-context")
  const storeId = await resolveStoreId().catch(() => null)
  
  if (!storeId) return null

  // Fetch up to 4 latest products
  const products = await db.product.findMany({
    where: { storeId },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: { images: true, category: true }
  })

  return <FeaturedProductsClient widget={widget} products={products} />
}
