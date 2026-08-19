import React from "react"
import { db } from "@/lib/db"
import { CategoriesClient } from "./categories-client"
import { resolveStoreId } from "@/lib/store-context"

export const dynamic = "force-dynamic"

export default async function AdminCategoriesPage() {
  const storeId = await resolveStoreId()
  const categories = await db.category.findMany({
    where: { storeId },
    include: {
      _count: {
        select: { products: true }
      },
      parent: true
    },
    orderBy: { name: "asc" },
  })
  
  return <CategoriesClient categories={categories} />
}
