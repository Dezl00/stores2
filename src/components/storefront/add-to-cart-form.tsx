"use client"
import React, { useState } from "react"
import { Minus, Plus, ShoppingBag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import { toast } from "sonner"

interface AddToCartProps {
  product: {
    id: string
    name: string
    price: number
    discountPrice?: number | null
    images: { url: string }[]
    stock: number
  }
}

export function AddToCartForm({ product, variantId }: AddToCartProps & { variantId?: string }) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem, setIsOpen } = useCartStore()

  const finalPrice = product.discountPrice ?? product.price
  const isOutOfStock = product.stock <= 0

  const handleAdd = () => {
    setIsAdding(true)
    
    // Simulate a brief loading state for UX
    setTimeout(() => {
      addItem({
        productId: product.id,
        name: product.name,
        price: finalPrice,
        quantity,
        image: product.images[0]?.url
      }, false)
      
      setIsAdding(false)

      toast.success("تمت الإضافة للسلة", {
        description: product.name,
        action: {
          label: 'عرض السلة',
          onClick: () => setIsOpen(true)
        }
      })
    }, 400) // 400ms delay to show the loader to user
  }

  if (isOutOfStock) {
    return (
      <div className="mt-8 bg-destructive/10 text-destructive font-bold py-4 px-6 rounded-2xl text-center border border-destructive/20">
        عذراً، هذا المنتج غير متوفر في المخزون حالياً
      </div>
    )
  }

  return (
    <div className="mt-8 flex items-center gap-3 w-full">
      {/* Quantity Selector */}
      <div className="flex items-center justify-between h-14 bg-background border border-border/50 rounded-2xl px-1 min-w-[120px] shrink-0">
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          disabled={isAdding}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-center font-bold text-lg">{quantity}</span>
        <button 
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          disabled={isAdding}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add Button */}
      <Button 
        onClick={handleAdd}
        disabled={isAdding}
        className="h-14 flex-1 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-lg font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
      >
        {isAdding ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            <ShoppingBag className="w-5 h-5" />
            <span>أضف للسلة</span>
            <span className="opacity-80 font-normal text-sm mr-1 hidden sm:inline">
              ({(finalPrice * quantity).toFixed(2)} ج.م)
            </span>
          </>
        )}
      </Button>
    </div>
  )
}
