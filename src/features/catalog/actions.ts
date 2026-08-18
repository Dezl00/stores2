"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { resolveStoreId } from "@/lib/store-context"

const CategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
})

export async function createCategory(data: z.infer<typeof CategorySchema>) {
  try {
    const storeId = await resolveStoreId()
    const parsed = CategorySchema.parse(data)
    const category = await db.category.create({ data: { ...parsed, storeId } })
    
    await db.activityLog.create({
      data: {
        storeId,
        action: "Create",
        entityType: "Category",
        entityId: category.id,
        details: { name: category.name }
      }
    })
    
    revalidatePath("/admin/categories")
    revalidatePath("/")
    return { success: true, category }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category" }
  }
}

export async function getCategories() {
  try {
    const storeId = await resolveStoreId()
    const categories = await db.category.findMany({
      where: { storeId },
      include: { children: true, parent: true },
      orderBy: { createdAt: "desc" }
    })
    return { success: true, categories }
  } catch (error: any) {
    return { success: false, error: "Failed to fetch categories" }
  }
}

export async function deleteCategory(id: string) {
  try {
    const storeId = await resolveStoreId()
    await db.category.delete({ where: { id, storeId } })
    
    await db.activityLog.create({
      data: {
        storeId,
        action: "Delete",
        entityType: "Category",
        entityId: id,
      }
    })
    
    revalidatePath("/admin/categories")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete category. Ensure it has no products or children." }
  }
}

const ProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().min(0),
  discountPrice: z.number().optional().nullable(),
  stock: z.number().min(0),
  categoryId: z.string(),
  brandId: z.string().optional().nullable(),
  recommendationMode: z.string().default("Automatic"),
})

export async function createProduct(data: z.infer<typeof ProductSchema>, imageIds: string[]) {
  try {
    const storeId = await resolveStoreId()
    const parsed = ProductSchema.parse(data)
    
    const product = await db.product.create({
      data: {
        storeId,
        name: parsed.name,
        slug: parsed.slug,
        sku: parsed.sku || null,
        barcode: parsed.barcode || null,
        description: parsed.description || null,
        price: parsed.price,
        discountPrice: parsed.discountPrice || null,
        stock: parsed.stock,
        categoryId: parsed.categoryId,
        brandId: parsed.brandId || null,
        recommendationMode: parsed.recommendationMode,
        images: {
          create: imageIds.map((id, index) => ({
            url: id, // Assuming `id` passed is the Cloudinary secure_url for simplicity in this action
            isPrimary: index === 0,
            sortOrder: index
          }))
        }
      }
    })
    
    await db.activityLog.create({
      data: {
        storeId,
        action: "Create",
        entityType: "Product",
        entityId: product.id,
        details: { name: product.name, sku: product.sku }
      }
    })
    
    revalidatePath("/admin/products")
    revalidatePath("/")
    return { success: true, product }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create product" }
  }
}

export async function getProducts(options?: { categoryId?: string, limit?: number }) {
  try {
    const storeId = await resolveStoreId()
    const products = await db.product.findMany({
      where: {
        storeId,
        ...(options?.categoryId && { categoryId: options.categoryId }),
      },
      take: options?.limit,
      include: { images: true, category: true, brand: true },
      orderBy: { createdAt: "desc" }
    })
    return { success: true, products }
  } catch (error: any) {
    return { success: false, error: "Failed to fetch products" }
  }
}
