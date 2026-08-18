'use server'

import { db } from "@/lib/db"
import { headers } from "next/headers"
import { resolveStoreId } from "@/lib/store-context"

const isBot = (userAgent: string) => {
  const bots = ['bot', 'spider', 'crawl', 'lighthouse', 'google', 'bing', 'yahoo', 'yandex']
  const ua = userAgent.toLowerCase()
  return bots.some(bot => ua.includes(bot))
}

export async function logPageVisit(path: string) {
  try {
    const storeId = await resolveStoreId()
    const reqHeaders = await headers()
    const userAgent = reqHeaders.get("user-agent") || "unknown"
    
    if (isBot(userAgent)) return

    const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown"
    const country = reqHeaders.get("x-vercel-ip-country") || "غير محدد"
    const city = reqHeaders.get("x-vercel-ip-city") || "غير محدد"

    await db.pageVisit.create({
      data: {
        path,
        ipAddress: ip,
        userAgent,
        country: decodeURIComponent(country),
        city: decodeURIComponent(city),
        storeId
      }
    })
  } catch (error) {
    console.error("Failed to log page visit", error)
  }
}

export async function logProductView(productId: string) {
  try {
    const storeId = await resolveStoreId()
    const reqHeaders = await headers()
    const userAgent = reqHeaders.get("user-agent") || "unknown"
    
    if (isBot(userAgent)) return

    const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown"
    const country = reqHeaders.get("x-vercel-ip-country") || "غير محدد"
    const city = reqHeaders.get("x-vercel-ip-city") || "غير محدد"

    await db.productView.create({
      data: {
        productId,
        ipAddress: ip,
        userAgent,
        country: decodeURIComponent(country),
        city: decodeURIComponent(city),
        storeId
      }
    })
  } catch (error) {
    console.error("Failed to log product view", error)
  }
}
