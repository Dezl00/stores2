"use server"

import { requireSuperAdmin } from "@/lib/auth/require-admin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function createStore(formData: FormData) {
  try {
    const session = await requireSuperAdmin()
    
    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const ownerName = formData.get("ownerName") as string
    const ownerPhone = formData.get("ownerPhone") as string
    const ownerPassword = formData.get("ownerPassword") as string
    
    if (!name || !slug || !ownerName || !ownerPhone || !ownerPassword) {
      return { success: false, error: "جميع الحقول مطلوبة" }
    }
    
    // Check if slug is taken
    const existingStore = await db.store.findUnique({ where: { slug } })
    if (existingStore) {
      return { success: false, error: "هذا الرابط (Slug) مستخدم بالفعل" }
    }

    const passwordHash = await bcrypt.hash(ownerPassword, 10)

    // Transaction to create store, theme config, and owner user
    const store = await db.$transaction(async (tx) => {
      const newStore = await tx.store.create({
        data: {
          name,
          slug,
          isActive: true,
        }
      })

      await tx.themeConfig.create({
        data: {
          storeId: newStore.id,
          storeName: name,
        }
      })

      await tx.storeUser.create({
        data: {
          storeId: newStore.id,
          name: ownerName,
          phone: ownerPhone,
          passwordHash,
          role: "STORE_OWNER",
        }
      })

      return newStore
    })

    revalidatePath("/platform/stores")
    revalidatePath("/platform")
    return { success: true, store }
  } catch (error: any) {
    console.error("Create Store Error:", error)
    return { success: false, error: "حدث خطأ أثناء إنشاء المتجر" }
  }
}

export async function toggleStoreStatus(storeId: string, isActive: boolean) {
  try {
    await requireSuperAdmin()
    await db.store.update({
      where: { id: storeId },
      data: { isActive }
    })
    revalidatePath("/platform/stores")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "حدث خطأ أثناء تحديث حالة المتجر" }
  }
}

export async function deleteStore(storeId: string) {
  try {
    await requireSuperAdmin()
    
    // Cascading delete is set up in Prisma schema, but we should be careful.
    // Ensure it exists
    const store = await db.store.findUnique({ where: { id: storeId } })
    if (!store) return { success: false, error: "المتجر غير موجود" }

    await db.store.delete({
      where: { id: storeId }
    })

    revalidatePath("/platform/stores")
    revalidatePath("/platform")
    return { success: true }
  } catch (error: any) {
    console.error("Delete Store Error:", error)
    return { success: false, error: "حدث خطأ أثناء حذف المتجر. قد تكون هناك بيانات مرتبطة تمنع الحذف." }
  }
}
