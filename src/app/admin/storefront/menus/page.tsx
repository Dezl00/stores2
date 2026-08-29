import React from "react"
import { db } from "@/lib/db"
import { NavigationClient } from "./navigation-client"
import { resolveStoreId } from "@/lib/store-context"

export const dynamic = "force-dynamic"

export default async function AdminNavigationPage() {
  const storeId = await resolveStoreId()
  const menus = await db.menu.findMany({
    where: { storeId },
    include: {
      _count: {
        select: { items: true }
      }
    },
    orderBy: { createdAt: "desc" },
  })
  return <NavigationClient menus={menus} />
}
