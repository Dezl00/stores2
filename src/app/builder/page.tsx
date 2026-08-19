import React from "react"
import { db } from "@/lib/db"
import { resolveStoreId } from "@/lib/utils/resolve-store"
import { BuilderClient } from "./builder-client"
import { getWidgets } from "@/features/widget-builder/actions"

export default async function BuilderPage() {
  const storeId = await resolveStoreId()
  
  const [widgetsData, categories, themeConfig, store] = await Promise.all([
    getWidgets(),
    db.category.findMany({ 
      where: { storeId },
      select: { id: true, name: true, slug: true } 
    }),
    db.themeConfig.findUnique({
      where: { storeId }
    }),
    db.store.findUnique({
      where: { id: storeId },
      select: { name: true, logoUrl: true }
    })
  ])

  return (
    <BuilderClient 
      initialWidgets={widgetsData.widgets || []} 
      categories={categories}
      themeConfig={themeConfig}
      store={store}
    />
  )
}
