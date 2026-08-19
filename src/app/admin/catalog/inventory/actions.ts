"use server"

import { requirePermission } from "@/lib/auth/require-admin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { resolveStoreId } from "@/lib/store-context"

export async function updateStockAction(productId: string, stock: number) {
  try {
    try {
      await requirePermission("products.edit")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    
    const productExists = await db.product.findFirst({ where: { id: productId, storeId } });
    if (!productExists) return { success: false, error: "Product not found" };

    await db.product.update({
      where: { id: productId },
      data: { stock }
    })

    revalidatePath("/admin/catalog/inventory")
    revalidatePath("/admin/catalog/products")
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update stock" }
  }
}
