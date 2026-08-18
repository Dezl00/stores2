"use server"

import { requireStoreAdmin, requirePermission } from "@/lib/auth/require-admin"
import { db } from "@/lib/db"
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
      await db.activityLog.create({
        data: {
          storeId,
          userId: session.user.id,
          action: "UPDATE_SETTINGS",
          entityType: "Settings"
        }
      })
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
      await db.activityLog.create({
        data: {
          storeId,
          userId: session.user.id,
          action: "CREATE_BRANCH",
          entityType: "Branch",
          entityId: branch.id,
          details: { name: branch.name }
        }
      })
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
      await db.activityLog.create({
        data: {
          storeId,
          userId: session.user.id,
          action: "UPDATE_BRANCH",
          entityType: "Branch",
          entityId: branch.id,
          details: { name: branch.name }
        }
      })
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
    const branch = await db.branch.delete({ where: { id }})
    const session = await auth()
    if (session?.user?.id) {
      await db.activityLog.create({
        data: {
          storeId,
          userId: session.user.id,
          action: "DELETE_BRANCH",
          entityType: "Branch",
          entityId: branch.id,
          details: { name: branch.name }
        }
      })
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
    await db.activityLog.deleteMany({ where: { storeId } })
    
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
