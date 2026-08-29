import React from "react"
import { db } from "@/lib/db"
import { resolveStoreId } from "@/lib/store-context"
import { MenuItemsClient } from "./menu-items-client"
import { notFound } from "next/navigation"

export default async function AdminMenuItemsPage(props: { params: Promise<{ id: string }> }) {
  const storeId = await resolveStoreId();
  const params = await props.params;
  const menu = await db.menu.findFirst({
    where: { id: params.id, storeId },
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
