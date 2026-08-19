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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          المخزون
        </h1>
      </div>
      
      <InventoryClient 
        products={products} 
        currentPage={page}
        totalPages={totalPages}
        initialSearch={search}
      />
    </div>
  )
}