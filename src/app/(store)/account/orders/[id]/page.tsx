import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { CustomerOrderDetailsClient } from "./customer-order-details-client"

export default async function CustomerOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  
  if (!session || !session.user) {
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

  if (!order || order.userId !== session.user.id) {
    notFound()
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-12 min-h-[70vh]">
      <CustomerOrderDetailsClient order={order} />
    </div>
  )
}
