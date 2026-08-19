"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { sendNotification } from "@/lib/send-notification"
import { resolveStoreId } from "@/lib/store-context"

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "جميع الحقول مطلوبة" }
  }

  try {
    const storeId = await resolveStoreId()

    const existingUser = await db.storeUser.findUnique({
      where: { email_storeId: { email, storeId } }
    })

    if (existingUser) {
      return { error: "البريد الإلكتروني مسجل مسبقاً في هذا المتجر" }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await db.storeUser.create({
      data: {
        name,
        email,
        passwordHash,
        role: "CUSTOMER",
        storeId
      }
    })

    const config = await db.themeConfig.findUnique({ where: { storeId } })
    if (config?.adminNewCustomerNotifications !== false) {
      await sendNotification({
        targetRole: "MANAGER", // Or STORE_OWNER
        title: "عميل جديد!",
        message: `تم تسجيل عميل جديد: ${name} (${email})`,
        type: "NEW_CUSTOMER",
        link: "/admin/customers",
        storeId
      });
    }

    return { success: true, user: { id: user.id, phone: user.phone, name: user.name } }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "حدث خطأ أثناء إنشاء الحساب" }
  }
}

export async function loginUser(formData: FormData) {
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string

  if (!phone || !password) {
    return { error: "رقم الهاتف وكلمة المرور مطلوبان" }
  }

  try {
    const storeId = await resolveStoreId()

    const user = await db.storeUser.findUnique({
      where: { phone_storeId: { phone, storeId } }
    })

    if (!user || !user.passwordHash) {
      return { error: "رقم الهاتف أو كلمة المرور غير صحيحة" }
    }

    // Check password with bcrypt, with legacy plaintext migration
    let isValid = false
    if (user.passwordHash.startsWith("$2")) {
      isValid = await bcrypt.compare(password, user.passwordHash)
    } else {
      isValid = password === user.passwordHash
      if (isValid) {
        // Auto-migrate plaintext to bcrypt hash
        const hashedPassword = await bcrypt.hash(password, 10)
        await db.storeUser.update({
          where: { id: user.id },
          data: { passwordHash: hashedPassword }
        })
      }
    }

    if (!isValid) {
      return { error: "رقم الهاتف أو كلمة المرور غير صحيحة" }
    }

    if (user.isActive === false) {
      return { error: "تم تعطيل هذا الحساب. يرجى مراجعة الإدارة" }
    }

    return { success: true, role: user.role, permissions: user.permissions }
  } catch (error) {
    console.error("Login check error:", error)
    return { error: "حدث خطأ أثناء تسجيل الدخول" }
  }
}

export async function getRedirectUrlAfterLogin() {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  
  if (!session?.user) return "/login"
  
  if (session.user.context === 'platform') {
    return "/platform"
  }
  
  // It's a store context
  return "/admin"
}
