import React from "react"
import { db } from "@/lib/db"
import { SettingsClient } from "./settings-client"
import { auth } from "@/lib/auth"
import { requireStoreId } from "@/lib/tenant"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const storeId = await requireStoreId()

  let config = await db.themeConfig.findUnique({
    where: { storeId }
  })

  // Fallback to default if not exists
  if (!config) {
    config = {
      id: "default",
      storeName: "متجري",
      storeDescription: "",
      logoUrl: null,
      faviconUrl: null,
      primaryColor: "#D97706",
      secondaryColor: "#FBBF24",
      borderRadius: "8px",
      buttonStyle: "solid",
      adminColor: "#2453E3",
      whatsappNumber: null,
      whatsappEnabled: true,
      facebookUrl: null,
      instagramUrl: null,
      snapchatUrl: null,
      tiktokUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any
  }

  const branches = await db.branch.findMany({
    where: { storeId },
    orderBy: { sortOrder: 'asc' }
  })

  const backups = await db.backup.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' }
  })

  const notificationCampaigns = await db.notificationCampaign.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  const subscribersCount = await db.pushSubscription.count({
    where: { storeId, OR: [{ role: "CUSTOMER" }, { role: null }] }
  })

  const session = await auth()
  const currentUser = session?.user
  const isAdmin = currentUser?.role === "STORE_OWNER"
  const permissions = currentUser?.permissions || []

  const store = await db.store.findUnique({
    where: { id: storeId },
    select: { slug: true, customDomain: true, domainVerified: true }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <span>الرئيسية</span>
        <span>/</span>
        <span className="text-foreground">الإعدادات</span>
      </nav>

      <SettingsClient 
        config={config} 
        branches={branches} 
        backups={backups} 
        notificationCampaigns={notificationCampaigns}
        subscribersCount={subscribersCount}
        initialIsAdmin={isAdmin} 
        initialPermissions={permissions} 
        store={store}
      />
    </div>
  )
}
