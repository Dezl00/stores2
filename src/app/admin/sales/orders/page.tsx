import React from "react"
import { db } from "@/lib/db"
import { resolveStoreId } from "@/lib/store-context"
import { OrdersClient } from "./orders-client"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const storeId = await resolveStoreId()
  const resolvedParams = await searchParams
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : ''
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : 'all'

  const limit = 20
  const skip = (page - 1) * limit

  const where: any = { storeId }
  
  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { userId: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { phone: { contains: search, mode: "insensitive" } } }
    ]
  }

  if (status && status !== 'all') {
    where.status = status
  }

  const [orders, totalCount] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      },
      skip,
      take: limit,
    }),
    db.order.count({ where })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <OrdersClient 
      orders={orders} 
      currentPage={page}
      totalPages={totalPages}
      initialSearch={search}
      initialStatus={status}
    />
  )
}
