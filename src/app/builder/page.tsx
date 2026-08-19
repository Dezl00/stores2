import React from "react"
import { db } from "@/lib/db"
import { resolveStoreId } from "@/lib/store-context"
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
      select: { name: true, logoUrl: true, slug: true, customDomain: true }
    })
  ])

  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'localhost:3000'
  const cleanPlatform = platformDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const previewUrl = store?.customDomain 
    ? `${protocol}://${store.customDomain}/?preview=true`
    : `${protocol}://${store?.slug}.${cleanPlatform}/?preview=true`

  return (
    <BuilderClient 
      initialWidgets={widgetsData.widgets || []} 
      categories={categories}
      themeConfig={themeConfig}
      store={store}
      previewUrl={previewUrl}
    />
  )
}
