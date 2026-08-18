import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { OrderDetailsClient } from "./order-details-client"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  
  if (!session || (session.user.role !== "STORE_OWNER" && session.user.role !== "MANAGER")) {
    redirect("/")
  }

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id: id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true
            }
          }
        }
      },
      user: true,
    }
  })

  if (!order) {
    notFound()
  }

  const config = await db.themeConfig.findUnique({
    where: { id: "default" }
  })

  const branches = await db.branch.findMany({
    orderBy: { createdAt: 'asc' }
  })

  return <OrderDetailsClient order={order} logoUrl={config?.logoUrl} storeName={config?.storeName} branches={branches} />
}
