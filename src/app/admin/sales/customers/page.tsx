import React from "react"
import { db } from "@/lib/db"
import { CustomersClient } from "./customers-client"

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : ''
  const limit = 20
  const skip = (page - 1) * limit

  const whereClause = {
    role: "CUSTOMER" as const,
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search } },
      ]
    } : {})
  }

  const [customers, totalCount] = await Promise.all([
    db.storeUser.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        orders: {
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: { orders: true }
        }
      }
    }),
    db.storeUser.count({ where: whereClause })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return <CustomersClient 
    customers={customers} 
    currentPage={page} 
    totalPages={totalPages}
    initialSearch={search}
  />
}
