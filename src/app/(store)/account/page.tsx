import React from "react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { AccountClient } from "./account-client"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "حسابي | العسال",
}

export default async function AccountPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/")
  }

  const user = await db.storeUser.findUnique({
    where: { id: session.user.id },
    include: {
      addresses: {
        orderBy: { createdAt: "desc" }
      },
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                include: { images: true }
              }
            }
          }
        }
      }
    }
  })

  if (!user) {
    redirect("/")
  }

  // Serialize Date objects to strings before passing to Client Component
  const serializedUser = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    orders: user.orders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })),
    addresses: user.addresses.map((addr) => ({
      ...addr,
      createdAt: addr.createdAt.toISOString(),
      updatedAt: addr.updatedAt.toISOString(),
    }))
  }

  const governorates = await db.governorate.findMany({
    where: { isActive: true },
    include: {
      cities: {
        where: { isActive: true },
        orderBy: { name: "asc" }
      }
    },
    orderBy: { name: "asc" }
  })

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 min-h-[70vh]">
      <AccountClient user={serializedUser} governorates={governorates} />
    </div>
  )
}
