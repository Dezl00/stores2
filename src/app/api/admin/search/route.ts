import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q") || ""

    if (!q || q.length < 2) {
      return NextResponse.json({ orders: [], users: [], products: [], categories: [] })
    }

    const [orders, users, products, categories] = await Promise.all([
      db.order.findMany({
        where: {
          OR: [
            { id: { contains: q, mode: 'insensitive' } },
            { customerName: { contains: q, mode: 'insensitive' } },
            { customerPhone: { contains: q, mode: 'insensitive' } },
          ]
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      db.storeUser.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
          ]
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      db.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { sku: { contains: q, mode: 'insensitive' } },
          ]
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      db.category.findMany({
        where: {
          name: { contains: q, mode: 'insensitive' }
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    ])

    return NextResponse.json({ orders, users, products, categories })
  } catch (error) {
    console.error("Global search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
