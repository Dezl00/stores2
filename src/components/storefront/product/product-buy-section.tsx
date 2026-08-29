"use client"

import React, { useState } from 'react'
import { ProductOptionsRenderer } from './product-options-renderer'
import { AddToCartForm } from '@/components/storefront/add-to-cart-form'
import { ShieldCheck, Tag, Truck } from 'lucide-react'

export function ProductBuySection({ product, options, variants }: { product: any, options: any[], variants: any[] }) {
  const [resolvedVariant, setResolvedVariant] = useState<any | null>(null)
  const [isCombinationAvailable, setIsCombinationAvailable] = useState(true)

  const hasVariants = variants.length > 0
  
  // Calculate display price
  const displayPrice = resolvedVariant?.price ?? product.discountPrice ?? product.price
  const displayCompareAt = resolvedVariant?.compareAtPrice ?? product.price
  
  // Stock display
  const displayStock = resolvedVariant ? resolvedVariant.stock : product.stock
  const isOutOfStock = displayStock <= 0 || !isCombinationAvailable

  return (
    <div className="space-y-6">
      {/* Price Block */}
      <div className="flex flex-col gap-1 mt-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black text-primary">
            {displayPrice.toFixed(2)} ج.م
          </span>
          {displayCompareAt > displayPrice && (
            <span className="text-xl text-muted-foreground line-through font-medium">
              {displayCompareAt.toFixed(2)} ج.م
            </span>
          )}
        </div>
        
        {displayCompareAt > displayPrice && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
              <Tag className="w-3 h-3" />
              خصم {Math.round(((displayCompareAt - displayPrice) / displayCompareAt) * 100)}%
            </span>
          </div>
        )}
      </div>
      
      {/* Options Renderer */}
      {options && options.length > 0 && (
        <ProductOptionsRenderer 
          options={options} 
          variants={variants} 
          basePrice={product.price}
          onVariantResolved={(variant, available) => {
            setResolvedVariant(variant)
            setIsCombinationAvailable(available)
          }}
        />
      )}

      {/* Add To Cart Form */}
      {(!hasVariants || resolvedVariant) ? (
        <AddToCartForm 
          product={{
            ...product, 
            price: displayPrice, // override with variant price
            discountPrice: null, // already handled
            stock: displayStock,
            id: product.id,
          }}
          variantId={resolvedVariant?.id} 
        />
      ) : (
        <div className="mt-8 bg-amber-50 text-amber-800 font-medium py-4 px-6 rounded-2xl text-center border border-amber-200">
          الرجاء اختيار جميع الخيارات المطلوبة
        </div>
      )}

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
          <div className="bg-background rounded-lg p-2 shadow-sm text-primary">
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-sm font-medium">توصيل سريع</div>
        </div>
        <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
          <div className="bg-background rounded-lg p-2 shadow-sm text-primary">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-sm font-medium">ضمان الجودة</div>
        </div>
      </div>
    </div>
  )
}
