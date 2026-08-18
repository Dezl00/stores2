import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import JSZip from "jszip"
import { resolveStoreId } from "@/lib/store-context"

export async function POST(req: Request) {
  try {
    const storeId = await resolveStoreId()
    const session = await auth()
    if (session?.user?.role !== "STORE_OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const buffer = await file.arrayBuffer()
    let parsedData = null

    if (file.name.endsWith('.zip')) {
      const zip = new JSZip()
      const unzipped = await zip.loadAsync(buffer)
      const jsonFile = unzipped.file("backup.json")
      if (!jsonFile) return NextResponse.json({ error: "No backup.json found in zip" }, { status: 400 })
      const jsonString = await jsonFile.async("string")
      parsedData = JSON.parse(jsonString)
    } else {
      const text = new TextDecoder().decode(buffer)
      parsedData = JSON.parse(text)
    }

    if (!parsedData || !parsedData.data) {
      return NextResponse.json({ error: "Invalid backup format" }, { status: 400 })
    }

    const { products, categories, departments, brands, themeConfig } = parsedData.data

    // We do a very basic restore: clear existing and insert new
    // Note: Due to foreign keys, order of deletion and insertion matters
    
    // Using transaction
    await db.$transaction(async (tx) => {
      // Clear data (Order is important)
      await tx.productImage.deleteMany()
      await tx.product.deleteMany()
      await tx.category.deleteMany()
      await tx.department.deleteMany()
      await tx.brand.deleteMany()

      // Insert data
      if (departments && departments.length > 0) {
        await tx.department.createMany({ data: departments.map((d: any) => ({ id: d.id, name: d.name, slug: d.slug, imageUrl: d.imageUrl, isActive: d.isActive })) })
      }
      if (categories && categories.length > 0) {
        await tx.category.createMany({ data: categories.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, imageUrl: c.imageUrl, parentId: c.parentId, departmentId: c.departmentId })) })
      }
      if (brands && brands.length > 0) {
        await tx.brand.createMany({ data: brands.map((b: any) => ({ id: b.id, name: b.name, slug: b.slug, imageUrl: b.imageUrl, isActive: b.isActive })) })
      }
      if (products && products.length > 0) {
        await tx.product.createMany({ 
          data: products.map((p: any) => ({ 
            id: p.id, 
            name: p.name, 
            slug: p.slug, 
            description: p.description, 
            price: p.price, 
            costPrice: p.costPrice,
            discountPrice: p.discountPrice,
            stock: p.stock,
            sku: p.sku,
            barcode: p.barcode,
            isActive: p.isActive,
            isFeatured: p.isFeatured,
            categoryId: p.categoryId,
            departmentId: p.departmentId,
            brandId: p.brandId
          })) 
        })
      }
      if (themeConfig) {
        await tx.themeConfig.upsert({
          where: { storeId },
          update: { 
            storeName: themeConfig.storeName,
            logoUrl: themeConfig.logoUrl,
            faviconUrl: themeConfig.faviconUrl,
            primaryColor: themeConfig.primaryColor
          },
          create: {
            storeId,
            storeName: themeConfig.storeName,
            logoUrl: themeConfig.logoUrl,
            faviconUrl: themeConfig.faviconUrl,
            primaryColor: themeConfig.primaryColor
          }
        })
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Backup import failed", error)
    return NextResponse.json({ error: "Failed to import backup" }, { status: 500 })
  }
}
