"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { resolveStoreId } from "@/lib/store-context"

export async function updateUserAccount(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id || session.user.context !== 'store') {
    return { error: "غير مصرح لك بإجراء هذا التعديل" }
  }

  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  const address = formData.get("address") as string
  const password = formData.get("password") as string
  const newPassword = formData.get("newPassword") as string

  try {
    const storeId = await resolveStoreId()

    if (session.user.storeId !== storeId) {
       return { error: "غير مصرح لك بإجراء هذا التعديل في هذا المتجر" }
    }

    const user = await db.storeUser.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return { error: "المستخدم غير موجود" }
    }

    let updatedData: any = {
      name: name || user.name,
      phone: phone || user.phone,
      email: email !== undefined ? email : user.email,
      address: address || user.address,
    }

    // Password update logic
    if (password && newPassword) {
      // Support both bcrypt and legacy plaintext
      let currentPasswordValid = false
      if (user.passwordHash?.startsWith("$2")) {
        currentPasswordValid = await bcrypt.compare(password, user.passwordHash)
      } else {
        currentPasswordValid = password === user.passwordHash
      }
      if (!currentPasswordValid) {
        return { error: "كلمة المرور الحالية غير صحيحة" }
      }
      updatedData.passwordHash = await bcrypt.hash(newPassword, 10)
    }

    await db.storeUser.update({
      where: { id: user.id },
      data: updatedData
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to update user:", error)
    return { error: "حدث خطأ أثناء حفظ التعديلات" }
  }
}
