"use server"

import { requirePermission } from "@/lib/auth/require-admin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { resolveStoreId } from "@/lib/store-context"
import { OptionBehavior, OptionDataType, OptionDisplayType } from "@prisma/client"

export async function addProductOption(productId: string, data: any) {
  try {
    await requirePermission("products.edit")
    const storeId = await resolveStoreId()
    
    // Verify product belongs to store
    const product = await db.product.findFirst({ where: { id: productId, storeId } })
    if (!product) throw new Error("Product not found")

    const option = await db.productOption.create({
      data: {
        productId,
        name: data.name,
        dataType: data.dataType as OptionDataType,
        displayType: data.displayType as OptionDisplayType,
        behavior: data.behavior as OptionBehavior,
        systemOptionId: data.systemOptionId || null,
        isRequired: data.isRequired ?? false,
        sortOrder: data.sortOrder || 0,
      }
    })
    
    revalidatePath(`/admin/catalog/products`)
    return { success: true, option }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateProductOption(optionId: string, data: any) {
  try {
    await requirePermission("products.edit")
    const storeId = await resolveStoreId()
    
    const existing = await db.productOption.findFirst({ 
      where: { id: optionId, product: { storeId } } 
    })
    if (!existing) throw new Error("Option not found")

    const option = await db.productOption.update({
      where: { id: optionId },
      data: {
        name: data.name,
        dataType: data.dataType,
        displayType: data.displayType,
        behavior: data.behavior,
        isRequired: data.isRequired,
        sortOrder: data.sortOrder,
      }
    })
    
    revalidatePath(`/admin/catalog/products`)
    return { success: true, option }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteProductOption(optionId: string) {
  try {
    await requirePermission("products.edit")
    const storeId = await resolveStoreId()
    
    const existing = await db.productOption.findFirst({ 
      where: { id: optionId, product: { storeId } } 
    })
    if (!existing) throw new Error("Option not found")

    await db.productOption.delete({ where: { id: optionId } })
    
    // Deleting an option might invalidate variants, so we'd normally re-generate or warn.
    // For now, cascade will delete OptionValues. We leave Variants as is, or we could delete them.
    // Since variants rely on specific options, if an option is deleted, we should clear variants or they become orphaned from this option.
    // We will let the merchant manage variants separately.
    
    revalidatePath(`/admin/catalog/products`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function addProductOptionValue(optionId: string, data: { label: string, value: string }) {
  try {
    await requirePermission("products.edit")
    const storeId = await resolveStoreId()
    
    const option = await db.productOption.findFirst({ 
      where: { id: optionId, product: { storeId } } 
    })
    if (!option) throw new Error("Option not found")

    const optionValue = await db.productOptionValue.create({
      data: {
        optionId,
        label: data.label,
        value: data.value,
      }
    })
    
    revalidatePath(`/admin/catalog/products`)
    return { success: true, optionValue }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteProductOptionValue(valueId: string) {
  try {
    await requirePermission("products.edit")
    const storeId = await resolveStoreId()
    
    const existing = await db.productOptionValue.findFirst({ 
      where: { id: valueId, option: { product: { storeId } } },
      include: { option: true }
    })
    if (!existing) throw new Error("Option value not found")

    await db.productOptionValue.delete({ where: { id: valueId } })
    
    revalidatePath(`/admin/catalog/products`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Variant Generation Logic
export async function generateVariants(productId: string) {
  try {
    await requirePermission("products.edit")
    const storeId = await resolveStoreId()
    
    const product = await db.product.findFirst({ 
      where: { id: productId, storeId },
      include: {
        options: {
          where: { behavior: OptionBehavior.VARIANT_OPTION },
          include: { values: true },
          orderBy: { sortOrder: 'asc' } // Ensure consistent combination ordering
        }
      }
    })
    
    if (!product) throw new Error("Product not found")
    
    // Permutation generator
    const generatePermutations = (options: any[]): any[][] => {
      if (options.length === 0) return [];
      if (options.length === 1) return options[0].values.map((v: any) => [v]);
      const result: any[][] = [];
      const others = generatePermutations(options.slice(1));
      for (const val of options[0].values) {
        for (const other of others) {
          result.push([val, ...other]);
        }
      }
      return result;
    }

    const combinations = generatePermutations(product.options);
    
    // Protection: Max 1000 variants
    if (combinations.length > 1000) {
      throw new Error(`Cannot generate ${combinations.length} variants. Maximum limit is 1000.`);
    }

    // Wrap in transaction
    await db.$transaction(async (tx) => {
      // For simplicity in this engine, we wipe existing variants when regenerating.
      // In a more complex system, we would match existing combinations to preserve SKU/Price.
      await tx.productVariant.deleteMany({ where: { productId } });

      for (const combo of combinations) {
        const variant = await tx.productVariant.create({
          data: {
            productId,
            price: product.price, // Default to base product price
            stock: 0,
            sku: product.sku ? `${product.sku}-${combo.map(v => v.label.substring(0,3).toUpperCase()).join('-')}` : null,
          }
        });
        
        // Create VariantSelections
        for (const val of combo) {
          await tx.variantSelection.create({
            data: {
              variantId: variant.id,
              optionValueId: val.id
            }
          });
        }
      }
    });

    revalidatePath(`/admin/products/${productId}`)
    return { success: true, count: combinations.length }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateVariant(variantId: string, data: any) {
  try {
    await requirePermission("products.edit")
    const storeId = await resolveStoreId()
    
    const existing = await db.productVariant.findFirst({ 
      where: { id: variantId, product: { storeId } } 
    })
    if (!existing) throw new Error("Variant not found")

    const variant = await db.productVariant.update({
      where: { id: variantId },
      data: {
        price: data.price !== "" ? parseFloat(data.price) : null,
        compareAtPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice) : null,
        stock: data.stock !== "" ? parseInt(data.stock) : 0,
        sku: data.sku || null,
        barcode: data.barcode || null,
        weight: data.weight ? parseFloat(data.weight) : null,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive ?? true,
      }
    })
    
    revalidatePath(`/admin/products/${existing.productId}`)
    return { success: true, variant }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}


export async function getProductOptions(productId: string) {
  try {
    const storeId = await resolveStoreId()
    const options = await db.productOption.findMany({
      where: { productId, product: { storeId } },
      include: { values: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' }
    })
    
    const variants = await db.productVariant.findMany({
      where: { productId, product: { storeId } },
      include: { selections: true }
    })
    
    return { success: true, options, variants }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
