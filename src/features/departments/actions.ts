"use server"

import { requireStoreAdmin, requirePermission } from "@/lib/auth/require-admin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { resolveStoreId } from "@/lib/store-context"

export async function createDepartment(formData: FormData) {
  try {
    try {
      await requirePermission("departments.create")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    const imageUrl = formData.get("imageUrl") as string

    if (!name || !slug) {
      return { success: false, error: "Name and Slug are required" }
    }

    await db.department.create({
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        storeId,
      }
    })

    revalidatePath("/admin/departments")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create department" }
  }
}

export async function deleteDepartment(id: string) {
  try {
    try {
      await requirePermission("departments.delete")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()

    // Safety: check for categories in this department
    const categoryCount = await db.category.count({ where: { departmentId: id, storeId } })
    if (categoryCount > 0) {
      return { success: false, error: `لا يمكن حذف هذا المجال لأنه يحتوي على ${categoryCount} أقسام. قم بنقلها أولاً.` }
    }

    await db.department.delete({ where: { id }})
    revalidatePath("/admin/departments")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete department" }
  }
}

export async function updateDepartment(id: string, formData: FormData) {
  try {
    try {
      await requirePermission("departments.edit")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    const isActiveStr = formData.get("isActive");
    if (isActiveStr !== null) {
      await db.department.update({ where: { id },
        data: { isActive: isActiveStr === "true" }
      });
      revalidatePath("/admin/departments")
      return { success: true }
    }

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    const imageUrl = formData.get("imageUrl") as string

    if (!name || !slug) {
      return { success: false, error: "Name and Slug are required" }
    }

    await db.department.update({ where: { id },
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
      }
    })

    revalidatePath("/admin/departments")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update department" }
  }
}
