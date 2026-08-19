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
    
    if (!session?.user?.id || session.user.context !== 'store' || !session.user.storeId) {
      redirect('/login')
    }

    const store = await db.store.findUnique({
      where: { id: session.user.storeId }
    })

    if (!store) {
      throw new Error(`Store not found for session storeId: ${session.user.storeId}`)
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
      where: { storeId: store.id }
    })
    
    return (
      <AdminLayoutClient 
        storeName={config?.storeName || store.name || "منصة المتاجر"} 
        logoUrl={config?.logoUrl || null}
        initialRole={session.user.role || "MANAGER"}
        initialPermissions={(session.user.permissions as string[]) || []}
      >
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
