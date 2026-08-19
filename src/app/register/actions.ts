"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function registerStorePublic(formData: FormData) {
  try {
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
      return { success: false, error: "هذا الرابط (Slug) مستخدم بالفعل، يرجى اختيار رابط آخر" }
    }

    const passwordHash = await bcrypt.hash(ownerPassword, 10)

    // Transaction to create store, theme config, and owner user
    const store = await db.$transaction(async (tx) => {
      const newStore = await tx.store.create({
        data: {
          name,
          slug,
          status: "ACTIVE", // Active by default for public registration
        }
      })

      await tx.themeConfig.create({
        data: {
          storeId: newStore.id,
          storeName: name,
        }
      })

      const newOwner = await tx.storeUser.create({
        data: {
          storeId: newStore.id,
          name: ownerName,
          phone: ownerPhone,
          passwordHash,
          role: "STORE_OWNER",
        }
      })

      await tx.store.update({
        where: { id: newStore.id },
        data: { ownerId: newOwner.id }
      })

      return newStore
    })

    return { success: true, store }
  } catch (error: any) {
    console.error("Public Create Store Error:", error)
    return { success: false, error: "حدث خطأ أثناء إنشاء المتجر" }
  }
}