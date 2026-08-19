"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function registerStorePublic(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const rawSlug = formData.get("slug") as string
    const slug = rawSlug ? rawSlug.toLowerCase() : ""
    const ownerName = formData.get("ownerName") as string
    const ownerEmail = formData.get("ownerEmail") as string
    const ownerPassword = formData.get("ownerPassword") as string
    
    if (!name || !slug || !ownerName || !ownerEmail || !ownerPassword) {
      return { success: false, error: "جميع الحقول مطلوبة" }
    }
    
    // Check if slug is taken
    const existingStore = await db.store.findUnique({ where: { slug } })
    if (existingStore) {
      return { success: false, error: "هذا الرابط (Slug) مستخدم بالفعل، يرجى اختيار رابط آخر" }
    }

    // Check if email is already taken for platform or globally? 
    // In our multi-tenant setup, email is scoped per store, but here it's a new store so it's fine.
    
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
          email: ownerEmail,
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

    // Generate auto-login token
    const crypto = await import("crypto")
    const secret = process.env.AUTH_SECRET || "matjark-platform-secret-key-change-me"
    
    // We need the newOwner ID, let's fetch it since transaction didn't return it
    const newOwner = await db.storeUser.findFirst({ where: { storeId: store.id, role: "STORE_OWNER" } })
    const timestamp = Date.now()
    const hash = crypto.createHmac("sha256", secret).update(`${newOwner?.id}:${timestamp}`).digest("hex")
    const autoLoginToken = `${newOwner?.id}:${timestamp}:${hash}`

    return { success: true, store, autoLoginToken }
  } catch (error: any) {
    console.error("Public Create Store Error:", error)
    return { success: false, error: "حدث خطأ أثناء إنشاء المتجر" }
  }
}