import React from "react"
import { db } from "@/lib/db"
import { MenuItemsClient } from "./menu-items-client"
import { notFound } from "next/navigation"

export default async function AdminMenuItemsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const menu = await db.menu.findUnique({
    where: { id: params.id },
    include: {
      items: {
        orderBy: { sortOrder: "asc" }
      }
    }
  })

  if (!menu) {
    notFound()
  }

  return <MenuItemsClient menu={menu} />
}
