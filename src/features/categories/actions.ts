"use server"

import { requirePermission } from "@/lib/auth/require-admin"
import { resolveStoreId } from "@/lib/store-context"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function createCategory(formData: FormData) {
  try {
    try {
      await requirePermission("categories.create")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    const categoryType = formData.get("categoryType") as string
    const imageUrl = formData.get("imageUrl") as string
    const parentId = categoryType === "sub" ? (formData.get("parentId") as string) : null

    if (!name || !slug) {
      return { success: false, error: "Name and Slug are required" }
    }

    await db.category.create({
      data: {
        storeId,
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        parentId: parentId || null,
      }
    })

    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category" }
  }
}

export async function deleteCategory(id: string) {
  try {
    try {
      await requirePermission("categories.delete")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }

    const storeId = await resolveStoreId()

    // Safety: check for products in this category
    const productCount = await db.product.count({ where: { categoryId: id, storeId } })
    if (productCount > 0) {
      return { success: false, error: `لا يمكن حذف هذا القسم لأنه يحتوي على ${productCount} منتج. قم بنقل المنتجات أولاً.` }
    }

    // Safety: check for child categories
    const childCount = await db.category.count({ where: { parentId: id, storeId } })
    if (childCount > 0) {
      return { success: false, error: `لا يمكن حذف هذا القسم لأنه يحتوي على ${childCount} أقسام فرعية. قم بحذفها أولاً.` }
    }

    await db.category.deleteMany({
      where: { id, storeId }
    })
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete category" }
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    try {
      await requirePermission("categories.edit")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    const isActiveStr = formData.get("isActive");
    if (isActiveStr !== null) {
      await db.category.updateMany({
        where: { id, storeId },
        data: { isActive: isActiveStr === "true" }
      });
      revalidatePath("/admin/categories")
      return { success: true }
    }

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string
    const categoryType = formData.get("categoryType") as string
    const imageUrl = formData.get("imageUrl") as string
    const parentId = categoryType === "sub" ? (formData.get("parentId") as string) : null

    if (!name || !slug) {
      return { success: false, error: "Name and Slug are required" }
    }

    await db.category.updateMany({
      where: { id, storeId },
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        parentId: parentId || null,
      }
    })

    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update category" }
  }
}

export async function bulkUpdateCategories(ids: string[], data: { parentId?: string }) {
  try {
    try {
      await requirePermission("categories.edit")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    if (!ids.length) return { success: false, error: "لا توجد أقسام محددة" }

    await db.category.updateMany({
      where: { id: { in: ids }, storeId },
      data: {
        ...(data.parentId !== undefined && { parentId: data.parentId }),
      }
    })

    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "فشل تحديث الأقسام" }
  }
}

export async function bulkCreateCategories(categoriesToCreate: { main: string, sub?: string }[]) {
  try {
    const session = await auth()
    const isAdmin = session?.user?.role === "STORE_OWNER" || session?.user?.role === "MANAGER"
    const hasPerm = session?.user?.permissions?.includes("categories.create")
    if (!isAdmin && !hasPerm) {
      return { success: false, error: "Not authorized to create categories" }
    }

    const storeId = await resolveStoreId()

    if (!categoriesToCreate || categoriesToCreate.length === 0) return { success: true, categories: [] }

    // 1. Process Main Categories first
    const uniqueMains = [...new Set(categoriesToCreate.map(c => c.main.trim()))].filter(Boolean)
    
    for (const mainName of uniqueMains) {
      let mainCat = await db.category.findFirst({
        where: { name: mainName, parentId: null, storeId }
      })
      if (!mainCat) {
        let slug = mainName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        if (!slug || slug.trim() === '') slug = `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        
        // Ensure slug is unique
        let existingSlug = await db.category.findUnique({ where: { slug_storeId: { slug, storeId } } })
        if (existingSlug) slug = `${slug}-${Date.now()}`

        mainCat = await db.category.create({
          data: { name: mainName, slug, storeId }
        })
      }

      // 2. Process Sub Categories for this main category
      const subsForMain = categoriesToCreate.filter(c => c.main === mainName && c.sub).map(c => c.sub!.trim());
      const uniqueSubs = [...new Set(subsForMain)].filter(Boolean);

      for (const subName of uniqueSubs) {
        const subCat = await db.category.findFirst({
          where: { name: subName, parentId: mainCat.id, storeId }
        })
        if (!subCat) {
          let subSlug = subName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          if (!subSlug || subSlug.trim() === '') subSlug = `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`
          
          let existingSubSlug = await db.category.findUnique({ where: { slug_storeId: { slug: subSlug, storeId } } })
          if (existingSubSlug) subSlug = `${subSlug}-${Date.now()}`

          await db.category.create({
            data: { name: subName, slug: subSlug, parentId: mainCat.id, storeId }
          })
        }
      }
    }

    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error: any) {
    console.error("bulkCreateCategories error:", error)
    return { success: false, error: "حدث خطأ أثناء إنشاء الأقسام" }
  }
}
