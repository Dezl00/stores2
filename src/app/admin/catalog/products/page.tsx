import React from "react"
import { db } from "@/lib/db"
import { ProductsClient } from "./products-client"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : ''
    const brandId = typeof resolvedParams.brandId === 'string' ? resolvedParams.brandId : ''
  const categoryIds = typeof resolvedParams.categoryIds === 'string' ? resolvedParams.categoryIds.split(',') : []
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : 'all'

  const limit = 20
  const skip = (page - 1) * limit

  // Prepare where clause
  const where: any = {}
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } }
    ]
  }

  if (categoryIds.length > 0) {
    where.categoryId = { in: categoryIds }
  }

  if (brandId) {
    where.brandId = brandId
  }

  if (status === 'active') where.isActive = true
  if (status === 'inactive') where.isActive = false

  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        options: { include: { values: true } },
        variants: {
          include: {
            selections: {
              include: { optionValue: true }
            }
          }
        },
        images: {
          where: { isPrimary: true },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.product.count({ where })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  const [categories, brands, globalOptions] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
    db.globalOption.findMany({
      where: { isActive: true },
      include: {
        values: { orderBy: { sortOrder: 'asc' } }
      }
    })
  ])

  return (
    <ProductsClient 
      products={products} 
      categories={categories} 
      brands={brands} 
      globalOptions={globalOptions}
      
      currentPage={page}
      totalPages={totalPages}
      initialSearch={search}
      
      initialBrand={brandId}
      initialCats={categoryIds}
      initialStatus={status}
    />
  )
}
