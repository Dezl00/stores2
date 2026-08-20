"use server"

import { requireStoreAdmin, requirePermission } from "@/lib/auth/require-admin"
import { db } from "@/lib/db"
import { addDomainToVercel, removeDomainFromVercel, checkDomainStatus, verifyDomain } from "@/lib/vercel"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { resolveStoreId } from "@/lib/store-context"

export async function updateThemeConfig(formData: FormData) {
  try {
    try {
      await requirePermission("settings.general")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    const existing = await db.themeConfig.findUnique({ where: { storeId } })
    const data: any = {}
    
    const stringFields = [
      "storeName", "storeDescription", "logoUrl", "faviconUrl",
      "primaryColor", "secondaryColor", "adminColor", "whatsappNumber",
      "facebookUrl", "instagramUrl", "twitterUrl", "tiktokUrl", "snapchatUrl", "backupFrequency"
    ]

    stringFields.forEach(field => {
      if (formData.has(field)) {
        data[field] = formData.get(field) as string
      }
    })

    // Special case for boolean checkbox which is omitted if unchecked
    if (formData.has("whatsappNumber") || formData.has("whatsappEnabled")) {
      data.whatsappEnabled = formData.get("whatsappEnabled") === "true"
    }

    if (formData.has("whatsappOrderEnabled")) {
      data.whatsappOrderEnabled = formData.get("whatsappOrderEnabled") === "true"
    }

    if (!existing) {
      // If creating for the first time, ensure required fields have fallback
      data.storeName = data.storeName || "متجر العسال"
    }

    await db.themeConfig.upsert({
      where: { storeId },
      update: data,
      create: { storeId, storeName: "متجر العسال", ...data }
    })

    const session = await auth()
    if (session?.user?.id) {
      
    }

    revalidatePath("/admin/settings")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    console.error("Save settings error:", error)
    return { success: false, error: "فشل حفظ الاعدادات: " + (error?.message || String(error)) }
  }
}

export async function createBranch(formData: FormData) {
  try {
    try {
      await requirePermission("settings.general")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    const branch = await db.branch.create({
      data: {
        storeId,
        name: formData.get("name") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        mapUrl: formData.get("mapUrl") as string,
      }
    })

    const session = await auth()
    if (session?.user?.id) {
      
    }
    revalidatePath("/admin/settings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to create branch" }
  }
}

export async function updateBranch(id: string, formData: FormData) {
  try {
    try {
      await requirePermission("settings.general")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    const existing = await db.branch.findFirst({ where: { id, storeId } })
    if (!existing) return { success: false, error: "Not found or unauthorized" }
    const branch = await db.branch.update({ where: { id },
      data: {
        name: formData.get("name") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        mapUrl: formData.get("mapUrl") as string,
        isActive: formData.get("isActive") === "true",
      }
    })

    const session = await auth()
    if (session?.user?.id) {
      
    }
    revalidatePath("/admin/settings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update branch" }
  }
}

export async function deleteBranch(id: string) {
  try {
    try {
      await requirePermission("settings.general")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    const existing = await db.branch.findFirst({ where: { id, storeId } })
    if (!existing) return { success: false, error: "Not found or unauthorized" }
    const branch = await db.branch.delete({ where: { id }})
    const session = await auth()
    if (session?.user?.id) {
      
    }
    revalidatePath("/admin/settings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete branch" }
  }
}

export async function resetStoreStats() {
  try {
    try {
      await requirePermission("settings.general")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    // Delete order items first to satisfy foreign keys
    await db.orderItem.deleteMany({ where: { order: { storeId } } })
    // Delete orders
    await db.order.deleteMany({ where: { storeId } })
    // Delete analytics data
    await db.pageVisit.deleteMany({ where: { storeId } })
    await db.productView.deleteMany({ where: { product: { storeId } } })
    // Delete notifications and activity logs
    await db.notification.deleteMany({ where: { storeId } })
        
    revalidatePath("/admin/analytics")
    revalidatePath("/admin/orders")
    revalidatePath("/admin/settings")
    revalidatePath("/admin/security")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "فشل في تصفير بيانات المتجر" }
  }
}

export async function getNotificationCampaigns() {
  await requireStoreAdmin()
  const storeId = await resolveStoreId()
  return await db.notificationCampaign.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
}

export async function getSubscribersCount() {
  await requireStoreAdmin()
  const storeId = await resolveStoreId()
  return await db.pushSubscription.count({
    where: {
      storeId,
      OR: [
        { role: "CUSTOMER" },
        { role: null }
      ]
    }
  })
}
export async function updateDomainSettings(slug: string, customDomain: string | null) {
  try {
    try {
      await requirePermission("settings.general")
    } catch (e: any) {
      return { success: false, error: e.message || "Unauthorized" }
    }
    const storeId = await resolveStoreId()
    
    const slugRegex = /^[a-zA-Z0-9-]+$/
    if (!slug || !slugRegex.test(slug) || slug.length < 3) {
      return { success: false, error: "رابط المتجر غير صالح. يجب أن يحتوي على أحرف وأرقام إنجليزية فقط وأن لا يقل عن 3 أحرف." }
    }

    const existingSlug = await db.store.findFirst({
      where: { slug, id: { not: storeId } }
    })
    if (existingSlug) {
      return { success: false, error: "هذا الرابط مستخدم بالفعل من قبل متجر آخر." }
    }

    let cleanCustomDomain = customDomain?.toLowerCase().trim() || null
    if (cleanCustomDomain) {
      cleanCustomDomain = cleanCustomDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')
      const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}/
      if (!domainRegex.test(cleanCustomDomain)) {
        return { success: false, error: "اسم النطاق المخصص غير صالح." }
      }

      const existingDomain = await db.store.findFirst({
        where: { customDomain: cleanCustomDomain, id: { not: storeId } }
      })
      if (existingDomain) {
        return { success: false, error: "النطاق المخصص مستخدم بالفعل." }
      }
    }

    // Check current store to see if domain changed
    const store = await db.store.findUnique({ where: { id: storeId } })
    const oldDomain = store?.customDomain

    if (cleanCustomDomain !== oldDomain) {
      // Remove old domain if it existed
      if (oldDomain) {
        await removeDomainFromVercel(oldDomain)
      }
      
      // Add new domain to Vercel
      if (cleanCustomDomain) {
        const vercelRes = await addDomainToVercel(cleanCustomDomain)
        if (vercelRes.error) {
          return { success: false, error: vercelRes.error.message || "حدث خطأ أثناء إضافة الدومين في Vercel." }
        }
      }
    }

    await db.store.update({
      where: { id: storeId },
      data: { slug, customDomain: cleanCustomDomain, domainVerified: false }
    })

    revalidatePath("/admin/system/settings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "حدث خطأ غير متوقع" }
  }
}

export async function checkDomainVerification() {
  try {
    try {
      await requirePermission("settings.general")
    } catch (e: any) {
      return { success: false, error: e.message || "Unauthorized" }
    }
    const storeId = await resolveStoreId()
    const store = await db.store.findUnique({ where: { id: storeId }, select: { customDomain: true, domainVerified: true } })
    
    if (!store?.customDomain) return { success: false, error: "لا يوجد دومين مخصص" }

    // First try to verify
    const verifyRes = await verifyDomain(store.customDomain)
    if (verifyRes.verified) {
      await db.store.update({ where: { id: storeId }, data: { domainVerified: true } })
      return { success: true, verified: true, message: "تم التحقق من الدومين بنجاح" }
    }

    // If not verified, check config status
    const configRes = await checkDomainStatus(store.customDomain)
    
    if (configRes.misconfigured) {
      return { success: true, verified: false, message: "إعدادات DNS غير صحيحة، تأكد من إضافة السجلات كما هو موضح." }
    } else if (configRes.configuredBy) {
      return { success: true, verified: false, message: "هذا الدومين مستخدم في مشروع آخر على Vercel." }
    } else {
      return { success: true, verified: false, message: "جاري التحقق من إعدادات الـ DNS... قد يستغرق الأمر بعض الوقت." }
    }

  } catch (error: any) {
    return { success: false, error: "حدث خطأ أثناء فحص الدومين" }
  }
}
