import React from "react"
import { db } from "@/lib/db"
import { resolveStoreId } from "@/lib/store-context"
import { ProductListClient } from "./product-list-client"

export async function ProductList({ widget }: { widget: any }) {
  let products: any[] = []
  
  const mode = widget.settings?.sourceMode || "category"
  const categoryId = widget.settings?.categoryId
  const productIds = widget.settings?.productIds || []
  const productCount = widget.settings?.productCount || 6
  let collectionItem = widget.items?.[0] || { title: widget.title }

  try {
    const storeId = await resolveStoreId()
    
    if (mode === "category" && categoryId) {
      const cat = await db.category.findUnique({
        where: { id: categoryId },
        include: { 
          products: { 
            include: { category: true, brand: true, images: true }, 
            take: productCount 
          } 
        }
      })
      if (cat?.products) {
        products = cat.products
        collectionItem = { ...collectionItem, title: widget.title || cat.name, buttonUrl: `/category/${cat.id}` }
      }
    } else if (mode === "custom" && productIds.length > 0) {
      const fetchedProducts = await db.product.findMany({
        where: { id: { in: productIds }, storeId },
        include: { category: true, brand: true, images: true },
        take: productCount
      })
      
      // Preserve user selected order
      products = productIds
        .map((id: string) => fetchedProducts.find(p => p.id === id))
        .filter(Boolean)
        
      collectionItem = { ...collectionItem, title: widget.title || "منتجات مختارة", buttonUrl: "/products" }
    } else if (collectionItem?.buttonUrl) {
      // Legacy fallback
      const slug = collectionItem.buttonUrl.replace('/collection/', '')
      const collection = await db.collection.findFirst({
        where: { slug, storeId },
        include: { products: { include: { category: true, brand: true, images: true } } }
      })
      if (collection?.products) products = collection.products
    }
  } catch (e) {
    console.error(e)
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl mx-4 my-8">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl opacity-50">🛍️</span>
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-2">{widget.title || "قائمة منتجات"}</h3>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          لم يتم تحديد تصنيف أو إضافة منتجات بعد. يرجى إعداد هذا القسم من لوحة التحكم.
        </p>
      </div>
    )
  }

  return (
    <ProductListClient widget={widget} products={products} collectionItem={collectionItem} />
  )
}
