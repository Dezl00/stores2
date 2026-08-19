"use server"

import { requireStoreAdmin, requirePermission } from "@/lib/auth/require-admin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { resolveStoreId } from "@/lib/store-context"
import { auth } from "@/lib/auth"

export async function createProduct(formData: FormData) {
  try {
    try {
      await requirePermission("products.create")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    const name = formData.get("name") as string
    let slug = formData.get("slug") as string
    let sku: string | null = formData.get("sku") as string || null
    
    if (!slug) {
      // Find the next available sequential number efficiently scoped by store
      const lastProduct = await db.product.findFirst({
        where: { slug: { startsWith: 'P-' }, storeId },
        orderBy: { slug: 'desc' },
        select: { slug: true }
      });
      let nextId = 10001;
      if (lastProduct) {
        const match = lastProduct.slug.match(/^P-(\d+)$/i);
        if (match) {
          const lastNum = parseInt(match[1], 10);
          nextId = lastNum >= 10001 ? lastNum + 1 : 10001;
        }
      }
      slug = `P-${nextId}`;
    }
    

    const price = parseFloat(formData.get("price") as string)
    const discountPrice = formData.get("discountPrice") ? parseFloat(formData.get("discountPrice") as string) : null
    const stock = parseInt(formData.get("stock") as string)
    const categoryId = formData.get("categoryId") as string
    const departmentId = formData.get("departmentId") as string || null
    const brandId = formData.get("brandId") as string || null
    const description = formData.get("description") as string
    
    // Parse images array from hidden input
    let images: string[] = []
    try {
      images = JSON.parse(formData.get("images") as string || "[]")
    } catch (e) {}

    if (!name || isNaN(price) || !categoryId) {
      return { success: false, error: "Missing required fields" }
    }

    // 2. Create the Product and the ProductImages
    const product = await db.product.create({
      data: {
        name,
        slug,
        sku,
        price,
        discountPrice,
        stock: isNaN(stock) ? 0 : stock,
        categoryId,
        brandId,
        description: description || null,
        storeId,
        ...(images.length > 0 && {
          images: {
            create: images.map((url, idx) => ({
              url,
              isPrimary: idx === 0,
              sortOrder: idx
            }))
          }
        })
      }
    })

    revalidatePath("/admin/products")
    revalidatePath("/")
    return { success: true, product }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create product" }
  }
}


export async function deleteProduct(id: string) {
  try {
    const session = await auth()
    const isStoreAdmin = session?.user?.role === "STORE_OWNER" || session?.user?.role === "MANAGER"
    const hasPerm = session?.user?.permissions?.includes("products.delete")
    if (!isStoreAdmin && !hasPerm) {
      return { success: false, error: "Not authorized to delete products" }
    }
    const storeId = await resolveStoreId()
    
    // Use findFirst to ensure the product belongs to the store before deleting (since we need to pass the id and storeId)
    // Actually, prisma supports where: { id, storeId } for delete if we define a composite unique, but since we didn't:
    const product = await db.product.findFirst({ where: { id, storeId } });
    if (!product) return { success: false, error: "Product not found" }

    await db.product.delete({
      where: { id: product.id }
    })
    
    

    revalidatePath("/admin/products")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete product" }
  }
}

export async function bulkDeleteProducts(ids: string[]) {
  try {
    const session = await auth()
    const isStoreAdmin = session?.user?.role === "STORE_OWNER" || session?.user?.role === "MANAGER"
    const hasPerm = session?.user?.permissions?.includes("products.delete")
    if (!isStoreAdmin && !hasPerm) {
      return { success: false, error: "Not authorized to delete products" }
    }
    const storeId = await resolveStoreId()

    await db.product.deleteMany({
      where: { id: { in: ids }, storeId }
    })
    revalidatePath("/admin/products")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete products" }
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    try {
      await requirePermission("products.edit")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    
    // Verify product ownership
    const productExists = await db.product.findFirst({ where: { id, storeId } });
    if (!productExists) return { success: false, error: "Product not found" };

    const name = formData.get("name") as string
    let slug = formData.get("slug") as string
    let sku: string | null = formData.get("sku") as string || null
    
    if (!slug) slug = `product-${Date.now()}`
    const price = parseFloat(formData.get("price") as string)
    const discountPrice = formData.get("discountPrice") ? parseFloat(formData.get("discountPrice") as string) : null
    const stock = parseInt(formData.get("stock") as string)
    const categoryId = formData.get("categoryId") as string
    const departmentId = formData.get("departmentId") as string || null
    const brandId = formData.get("brandId") as string || null
    const description = formData.get("description") as string
    
    let images: string[] = []
    try {
      images = JSON.parse(formData.get("images") as string || "[]")
    } catch (e) {}

    if (!name || isNaN(price) || !categoryId) {
      return { success: false, error: "Missing required fields" }
    }

    // Delete old images first to replace them with the new ordered array
    await db.productImage.deleteMany({
      where: { productId: id }
    })

    const product = await db.product.update({
      where: { id },
      data: {
        name,
        slug,
        sku,
        price,
        discountPrice,
        stock: isNaN(stock) ? 0 : stock,
        categoryId,
        brandId,
        description: description || null,
        ...(images.length > 0 && {
          images: {
            create: images.map((url, idx) => ({
              url,
              isPrimary: idx === 0,
              sortOrder: idx
            }))
          }
        })
      }
    })

    revalidatePath("/admin/products")
    revalidatePath("/")
    return { success: true, product }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update product" }
  }
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  try {
    try {
      await requirePermission("products.edit")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()
    
    const product = await db.product.findFirst({ where: { id, storeId } });
    if (!product) return { success: false, error: "Product not found" }

    await db.product.update({
      where: { id },
      data: { isActive }
    })
    revalidatePath("/admin/products")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update product status" }
  }
}

export async function bulkToggleProductsStatus(ids: string[], isActive: boolean) {
  try {
    try {
      await requirePermission("products.edit")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()

    await db.product.updateMany({
      where: { id: { in: ids }, storeId },
      data: { isActive }
    })
    revalidatePath("/admin/products")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update products status" }
  }
}

export async function bulkUpdateProducts(productsData: any[]) {
  try {
    try {
      await requirePermission("products.edit")
    } catch (e: any) {
      return { success: false, error: e.message || 'Unauthorized' }
    }
    const storeId = await resolveStoreId()

    // Ensure all products belong to this store first
    const ids = productsData.map(p => p.id);
    const validProducts = await db.product.findMany({ where: { id: { in: ids }, storeId }, select: { id: true } });
    const validIds = validProducts.map(p => p.id);
    const validUpdates = productsData.filter(p => validIds.includes(p.id));

    await db.$transaction(
      validUpdates.map(p => 
        db.product.update({
          where: { id: p.id },
          data: {
            name: p.name,
            price: p.price,
            stock: p.stock,
            categoryId: p.categoryId,
            brandId: p.brandId || null,
            isActive: p.isActive
          }
        })
      )
    )
    revalidatePath("/admin/products")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update products" }
  }
}

export async function bulkImportProducts(products: any[], duplicateHandling: 'skip' | 'update') {
  try {
    const session = await auth()
    const isStoreAdmin = session?.user?.role === "STORE_OWNER" || session?.user?.role === "MANAGER"
    const hasPerm = session?.user?.permissions?.includes("products.create")
    if (!isStoreAdmin && !hasPerm) {
      return { success: false, error: "Not authorized to import products" }
    }
    const storeId = await resolveStoreId()

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Pre-fetch references scoped by store
    const [existingProducts, categories, brands] = await Promise.all([
      db.product.findMany({ where: { storeId }, select: { id: true, sku: true, name: true } }),
      db.category.findMany({ where: { storeId }, select: { id: true, name: true, parentId: true } }),
      db.brand.findMany({ where: { storeId }, select: { id: true, name: true } })
    ]);
    
    const existingByName = new Map(existingProducts.map(p => [p.name.toLowerCase().trim(), p]));
    const existingBySku = new Map(existingProducts.filter(p => p.sku).map(p => [p.sku!.toLowerCase().trim(), p]));
    
    const categoriesByName = new Map();
    categories.forEach(c => {
      if (!c.parentId) categoriesByName.set(c.name.toLowerCase().trim(), c);
    });

    const subCategoriesMap = new Map(); // parentId -> name -> Category
    categories.forEach(c => {
      if (c.parentId) {
        if (!subCategoriesMap.has(c.parentId)) subCategoriesMap.set(c.parentId, new Map());
        subCategoriesMap.get(c.parentId).set(c.name.toLowerCase().trim(), c);
      }
    });

    const brandsByName = new Map(brands.map(b => [b.name.toLowerCase().trim(), b]));

    const toCreate = [];
    const toUpdate = [];
      
    for (const item of products) {
      // Resolve Category ID
      let finalCategoryId = null;
      if (item.categoryName) {
        const mainCat = categoriesByName.get(item.categoryName.toLowerCase().trim());
        if (mainCat) {
          finalCategoryId = mainCat.id;
          if (item.subCategoryName) {
            const subCatMap = subCategoriesMap.get(mainCat.id);
            if (subCatMap && subCatMap.has(item.subCategoryName.toLowerCase().trim())) {
              finalCategoryId = subCatMap.get(item.subCategoryName.toLowerCase().trim()).id;
            } else {
              skippedCount++;
              continue; 
            }
          }
        } else {
          skippedCount++;
          continue;
        }
      } else {
        skippedCount++;
        continue;
      }

      // Resolve Brand ID
      let finalBrandId = null;
      if (item.brandName) {
        const b = brandsByName.get(item.brandName.toLowerCase().trim());
        if (b) finalBrandId = b.id;
      }

      let existing = null;
      if (item.sku && existingBySku.has(item.sku.toLowerCase().trim())) {
        existing = existingBySku.get(item.sku.toLowerCase().trim());
      } else if (!item.sku && item.name && existingByName.has(item.name.toLowerCase().trim())) {
        existing = existingByName.get(item.name.toLowerCase().trim());
      }

      if (existing) {
        if (duplicateHandling === 'skip') {
          skippedCount++;
          continue;
        } else if (duplicateHandling === 'update') {
          toUpdate.push(
            db.product.update({
              where: { id: existing.id },
              data: {
                price: item.price,
                stock: item.stock,
                categoryId: finalCategoryId,
                brandId: finalBrandId,
                description: item.description || null,
                isActive: item.isActive,
              }
            })
          );
          continue;
        }
      }

      let slug = item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u0600-\u06FF-]/g, '');
      if (!slug) slug = `product-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;

      toCreate.push({
        name: item.name,
        slug: slug,
        sku: item.sku || null,
        price: item.price,
        stock: item.stock || 0,
        categoryId: finalCategoryId,
        brandId: finalBrandId,
        description: item.description || null,
        isActive: item.isActive !== undefined ? item.isActive : true,
        storeId
      });
    }

    if (toCreate.length > 0) {
      await db.product.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
      createdCount += toCreate.length;
    }

    if (toUpdate.length > 0) {
      await db.$transaction(toUpdate);
      updatedCount += toUpdate.length;
    }

    revalidatePath("/admin/products")
    return { success: true, createdCount, updatedCount, skippedCount }
  } catch (error: any) {
    console.error("Bulk Import Error:", error);
    return { success: false, error: "حدث خطأ أثناء الاستيراد الجماعي" }
  }
}
