"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { resolveStoreId } from "@/lib/store-context"

export async function addAddress(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "غير مصرح" }

    const title = formData.get("title") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const governorate = formData.get("governorate") as string
    const phone = formData.get("phone") as string
    const isDefault = formData.get("isDefault") === "true"

    if (!title || !address || !governorate || !phone) {
      return { error: "يرجى تعبئة الحقول المطلوبة" }
    }

    if (!/^01[0-9]{9}$/.test(phone)) {
      return { error: "رقم الهاتف يجب أن يتكون من 11 رقم ويبدأ بـ 01" }
    }

    const existingAddressesCount = await db.address.count({ where: { userId: session.user.id } })
    const shouldBeDefault = isDefault || existingAddressesCount === 0

    if (shouldBeDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      })
    }

    await db.address.create({
      data: {
        userId: session.user.id,
        title,
        address,
        city,
        governorate,
        phone,
        isDefault: shouldBeDefault
      }
    })

    revalidatePath("/account")
    return { success: true }
  } catch (error) {
    return { error: "حدث خطأ أثناء إضافة العنوان" }
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "غير مصرح" }

    await db.address.deleteMany({
      where: { 
        id: addressId,
        userId: session.user.id
      }
    })

    revalidatePath("/account")
    return { success: true }
  } catch (error) {
    return { error: "حدث خطأ أثناء حذف العنوان" }
  }
}

export async function setDefaultAddress(addressId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "غير مصرح" }

    await db.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false }
    })

    await db.address.updateMany({
      where: { 
        id: addressId,
        userId: session.user.id
      },
      data: { isDefault: true }
    })

    revalidatePath("/account")
    return { success: true }
  } catch (error) {
    return { error: "حدث خطأ أثناء تعيين العنوان الافتراضي" }
  }
}
