"use server"

import { requireStoreAdmin } from "@/lib/auth/require-admin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { resolveStoreId } from "@/lib/store-context"

export async function createMenu(formData: FormData) {
  try {
    try {
      await requireStoreAdmin()
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    const name = formData.get("name") as string

    if (!name) {
      return { success: false, error: "Name is required" }
    }

    await db.menu.create({
      data: { name, storeId }
    })

    revalidatePath("/admin/navigation")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create menu" }
  }
}

export async function deleteMenu(id: string) {
  try {
    try {
      await requireStoreAdmin()
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    await db.menu.delete({ where: { id }})
    revalidatePath("/admin/navigation")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete menu" }
  }
}

export async function createMenuItem(menuId: string, formData: FormData) {
  try {
    try {
      await requireStoreAdmin()
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    const label = formData.get("label") as string
    const url = formData.get("url") as string
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0

    if (!label) {
      return { success: false, error: "Label is required" }
    }

    await db.menuItem.create({
      data: {
        menuId,
        label,
        url,
        sortOrder,
        storeId
      }
    })

    revalidatePath(`/admin/navigation/${menuId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to create menu item" }
  }
}

export async function updateMenuItem(id: string, menuId: string, formData: FormData) {
  try {
    try {
      await requireStoreAdmin()
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    const label = formData.get("label") as string
    const url = formData.get("url") as string
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0

    if (!label) {
      return { success: false, error: "Label is required" }
    }

    await db.menuItem.update({ where: { id },
      data: {
        label,
        url,
        sortOrder
      }
    })

    revalidatePath(`/admin/navigation/${menuId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update menu item" }
  }
}

export async function deleteMenuItem(id: string, menuId: string) {
  try {
    try {
      await requireStoreAdmin()
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    await db.menuItem.delete({ where: { id }})
    revalidatePath(`/admin/navigation/${menuId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete menu item" }
  }
}
