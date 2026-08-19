import React from "react"
import { db } from "@/lib/db"
import { NavigationClient } from "./navigation-client"

export const dynamic = "force-dynamic"

export default async function AdminNavigationPage() {
  const menus = await db.menu.findMany({
    include: {
      _count: {
        select: { items: true }
      }
    },
    orderBy: { createdAt: "desc" },
  })
  return <NavigationClient menus={menus} />
}
