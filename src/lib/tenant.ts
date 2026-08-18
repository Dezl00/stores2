import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { cache } from 'react'

export interface TenantInfo {
  storeId: string
  storeSlug: string
  storeName: string
  isActive: boolean
}

function getPlatformDomain(): string {
  return process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'localhost:3000'
}

export function isPlatformDomain(hostname: string): boolean {
  const platformDomain = getPlatformDomain()
  const cleanHost = hostname.split(':')[0]
  const cleanPlatform = platformDomain.split(':')[0]
  return cleanHost === cleanPlatform || cleanHost === 'localhost' || cleanHost.startsWith('app.')
}

export const getStoreBySlug = cache(async (slug: string) => {
  return db.store.findUnique({
    where: { slug }
  })
})

export const getStoreByDomain = cache(async (domain: string) => {
  return db.store.findFirst({
    where: { customDomain: domain }
  })
})

export const getCurrentStore = cache(async (): Promise<TenantInfo | null> => {
  const headersList = await headers()
  const hostname = headersList.get('x-hostname') || ''
  const storeSlugHeader = headersList.get('x-store-slug')
  
  if (!hostname) return null

  let store = null

  // 1. If it's a custom domain
  if (!isPlatformDomain(hostname) && !storeSlugHeader) {
    store = await getStoreByDomain(hostname.split(':')[0])
  } 
  // 2. If it's a subdomain (middleware set x-store-slug)
  else if (storeSlugHeader) {
    store = await getStoreBySlug(storeSlugHeader)
  }

  if (!store) return null

  return {
    storeId: store.id,
    storeSlug: store.slug,
    storeName: store.name,
    isActive: store.status === "ACTIVE",
  }
})

export async function requireStoreId(): Promise<string> {
  const store = await getCurrentStore()
  if (!store) {
    throw new Error('Not in a store context')
  }
  if (!store.isActive) {
    throw new Error('Store is suspended')
  }
  return store.storeId
}

export async function isPlatformContext(): Promise<boolean> {
  const headersList = await headers()
  return headersList.get('x-platform-context') === 'true'
}
