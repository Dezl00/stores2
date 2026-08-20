import React from "react"
import { db } from "@/lib/db"
import { CategoryGridClient } from "./category-grid-client"

export async function CategoryGrid({ widget }: { widget: any }) {
  const { resolveStoreId } = await import("@/lib/store-context")
  const storeId = await resolveStoreId().catch(() => null)
  
  if (!storeId) return null

  // Fetch main categories (parentId = null)
  const categories = await db.category.findMany({
    where: { parentId: null, storeId },
    take: 8,
    orderBy: { createdAt: 'desc' }
  })

  return <CategoryGridClient widget={widget} categories={categories} />
}
