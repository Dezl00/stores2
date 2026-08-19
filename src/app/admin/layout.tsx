import React from "react"
import { db } from "@/lib/db"
import { AdminLayoutClient } from "./admin-layout-client"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import type { Metadata } from "next"
import { getCurrentStore } from "@/lib/tenant"
import { headers } from "next/headers"

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getCurrentStore()
  if (!store) {
    return { title: 'إدارة المتجر' }
  }

  const config = await db.themeConfig.findUnique({
    where: { storeId: store.storeId }
  })
  
  return {
    title: {
      template: '%s | لوحة التحكم',
      default: `${config?.storeName || 'المتجر'} - الإدارة`,
    },
    manifest: '/api/admin/manifest',
    themeColor: config?.adminColor || '#2453E3',
    icons: {
      icon: config?.faviconUrl || config?.logoUrl || '/favicon.ico',
      apple: config?.faviconUrl || config?.logoUrl || '/apple-icon.png',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: `${config?.storeName || 'المتجر'} - الإدارة`,
    },
    formatDetection: {
      telephone: false,
    },
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const session = await auth()
    const store = await getCurrentStore()
    
    if (!store) {
      const headersList = await headers()
      const hostname = headersList.get('x-hostname')
      const storeSlugHeader = headersList.get('x-store-slug')
      throw new Error(`Not in a store context - AdminLayout. Hostname: ${hostname}, Slug: ${storeSlugHeader}, ENV: ${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN}`)
    }

    if (!session?.user?.id || session.user.context !== 'store') {
      redirect('/login')
    }

    if (session.user.role !== "STORE_OWNER" && session.user.role !== "MANAGER") {
      redirect('/')
    }

    const dbUser = await db.storeUser.findUnique({
      where: { id: session.user.id },
      select: { isActive: true }
    })
    
    if (!dbUser || dbUser.isActive === false) {
      redirect('/login?locked=true')
    }

    const config = await db.themeConfig.findUnique({
      where: { storeId: store.storeId }
    })
    
    return (
      <AdminLayoutClient storeName={config?.storeName || store.storeName || "إدارة المتجر"} logoUrl={config?.logoUrl || null}>
        {children}
      </AdminLayoutClient>
    )
  } catch (error: any) {
    if (error?.message?.includes('NEXT_REDIRECT')) {
      throw error
    }
    return (
      <div style={{ padding: 20, color: 'red', backgroundColor: '#fee' }}>
        <h1>CRITICAL ADMIN LAYOUT ERROR</h1>
        <pre>{error?.message}</pre>
        <pre>{error?.stack}</pre>
      </div>
    )
  }
}
