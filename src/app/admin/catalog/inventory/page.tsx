import React from "react"
import { db } from "@/lib/db"
import { resolveStoreId } from "@/lib/store-context"
import { InventoryClient } from "./inventory-client"

export const dynamic = "force-dynamic"

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const storeId = await resolveStoreId()
  const resolvedParams = await searchParams
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : ''

  const limit = 20
  const skip = (page - 1) * limit

  const where: any = { storeId }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } }
    ]
  }

  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.product.count({ where })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <span>الرئيسية</span>
        <span>/</span>
        <span className="text-foreground">المخزون</span>
      </nav>
      
      <InventoryClient 
        products={products} 
        currentPage={page}
        totalPages={totalPages}
        initialSearch={search}
      />
    </div>
  )
}