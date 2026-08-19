import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireStoreAdmin } from "@/lib/auth/require-admin"
import { resolveStoreId } from "@/lib/store-context"
import * as XLSX from "xlsx"

export async function GET(request: Request) {
  try {
    await requireStoreAdmin()
  } catch (e: any) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
    const brandId = searchParams.get('brandId') || ''
  const categoryIdsParam = searchParams.get('categoryIds') || ''
  const status = searchParams.get('status') || 'all'

  const categoryIds = categoryIdsParam ? categoryIdsParam.split(',') : []

  const storeId = await resolveStoreId()
  const where: any = { storeId }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } }
    ]
  }

  if (categoryIds.length > 0) {
    where.categoryId = { in: categoryIds }
  }

  if (brandId) where.brandId = brandId
  if (status === 'active') where.isActive = true
  if (status === 'inactive') where.isActive = false

  const products = await db.product.findMany({
    where,
    include: {
      category: true,
      brand: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const categories = await db.category.findMany()

  const dataToExport = products.map((p) => {
    let parentCat = null
    let subCat = null
    if (p.category) {
      if (p.category.parentId) {
        parentCat = categories.find(c => c.id === p.category.parentId)
        subCat = p.category
      } else {
        parentCat = p.category
      }
    }
    
    return {
      "الاسم": p.name,
      "الرمز (SKU)": p.sku || "",
      "السعر": p.price,
      "المخزون": p.stock,
      "القسم": parentCat?.name || "",
      "التصنيف": subCat?.name || "",
      "الماركة": p.brand?.name || "",
      "الوصف": p.description || ""
    }
  })

  const ws = XLSX.utils.json_to_sheet(dataToExport)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "المنتجات")
  
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Assal_Products.xlsx"'
    }
  })
}
