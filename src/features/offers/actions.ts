"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireStoreAdmin } from "@/lib/auth/require-admin"
import { resolveStoreId } from "@/lib/store-context"

// -- Coupons --

export async function getCoupons() {
  const storeId = await resolveStoreId()
  return await db.coupon.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createCoupon(data: { code: string; type: string; value: number; maxUses?: number | null; expiresAt?: Date | null; isActive?: boolean }) {
  await requireStoreAdmin()
  const storeId = await resolveStoreId()
  
  const exists = await db.coupon.findUnique({ where: { code_storeId: { code: data.code, storeId } } })
  if (exists) throw new Error("هذا الكود موجود مسبقاً")

  const coupon = await db.coupon.create({ data: { ...data, storeId } })
  revalidatePath('/admin/offers')
  return coupon
}

export async function updateCoupon(id: string, data: { code?: string; type?: string; value?: number; maxUses?: number | null; expiresAt?: Date | null; isActive?: boolean }) {
  await requireStoreAdmin()
  const storeId = await resolveStoreId()
  
  const couponExists = await db.coupon.findFirst({ where: { id, storeId } })
  if (!couponExists) throw new Error("Coupon not found")

  const coupon = await db.coupon.update({ where: { id }, data })
  revalidatePath('/admin/offers')
  return coupon
}

export async function deleteCoupon(id: string) {
  await requireStoreAdmin()
  const storeId = await resolveStoreId()
  
  const couponExists = await db.coupon.findFirst({ where: { id, storeId } })
  if (!couponExists) throw new Error("Coupon not found")

  await db.coupon.delete({ where: { id } })
  revalidatePath('/admin/offers')
  return { success: true }
}

// -- Offer Settings (ThemeConfig) --

export async function getOfferSettings() {
  const storeId = await resolveStoreId()
  const theme = await db.themeConfig.findUnique({ where: { storeId } })
  return {
    freeShippingThreshold: theme?.freeShippingThreshold,
    promoPopupEnabled: theme?.promoPopupEnabled,
    promoPopupDelay: theme?.promoPopupDelay,
    promoPopupTitle: theme?.promoPopupTitle,
    promoPopupDescription: theme?.promoPopupDescription,
    promoPopupCode: theme?.promoPopupCode,
    whatsappOrderEnabled: theme?.whatsappOrderEnabled ?? false,
    whatsappNumber: theme?.whatsappNumber ?? null,
  }
}

export async function updateOfferSettings(data: any) {
  await requireStoreAdmin()
  const storeId = await resolveStoreId()
  
  const existing = await db.themeConfig.findUnique({ where: { storeId } })
  if (!existing) {
    await db.themeConfig.create({ data: { ...data, storeId } })
  } else {
    await db.themeConfig.update({ where: { storeId }, data })
  }
  
  revalidatePath('/admin/offers')
  revalidatePath('/') // Revalidate storefront to update popup settings
  return { success: true }
}
