"use client"
import React, { useRef, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Loader2 } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { useUIStore } from "@/store/ui-store"
import { toast } from "sonner"

interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    price: number
    discountPrice?: number | null
    stock: number
    images: { url: string }[]
    category?: { name: string; slug: string }
    description?: string | null
  }
  disableAnimation?: boolean
  index?: number
}

export function ProductCard({ product, disableAnimation = false, index = 0 }: ProductCardProps) {
  const { addItem } = useCartStore()
  const { storeLogo, themeConfig } = useUIStore()
  const cardRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(disableAnimation)
  const [isAdding, setIsAdding] = useState(false)
  
  const cardSettings = themeConfig?.headerSettings?.productCard || {}
  const showCategory = cardSettings.showCategory !== false
  const showDescription = cardSettings.showDescription === true
  const priceColor = cardSettings.priceColor || "var(--color-primary)"
  const showAddToCart = cardSettings.showAddToCart !== false
  const addToCartText = cardSettings.addToCartText || "أضف للسلة"
  const addToCartStyle = cardSettings.addToCartStyle || "solid"
  const addToCartColor = cardSettings.addToCartColor || "var(--color-primary)"
  
  const aspectClass = cardSettings.aspectRatio === "portrait" ? "aspect-[3/4]" : cardSettings.aspectRatio === "landscape" ? "aspect-[4/3]" : "aspect-square"
  
  const finalPrice = product.discountPrice ?? product.price
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price
  const isOutOfStock = product.stock <= 0

  useEffect(() => {
    if (disableAnimation) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    )
    
    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [disableAnimation])

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isOutOfStock || isAdding) return

    setIsAdding(true)
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      addItem({
        productId: product.id,
        name: product.name,
        price: finalPrice,
        quantity: 1,
        image: product.images[0]?.url
      })
      toast.success("تمت الإضافة للسلة")
      setIsAdding(false)
    }, 400)
  }

  // Stagger delay: each card gets a small delay based on its index (max 0.4s)
  const staggerDelay = disableAnimation ? 0 : Math.min(index * 0.08, 0.4)

  return (
    <div 
      ref={cardRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${staggerDelay}s, transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${staggerDelay}s`,
      }}
      className="group/card relative rounded-2xl bg-card p-2 sm:p-3 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col h-full"
    >
      
      {/* Badges */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {hasDiscount && (
          <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            خصم {((1 - finalPrice / product.price) * 100).toFixed(0)}%
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            نفدت الكمية
          </span>
        )}
      </div>

      <Link prefetch={false} href={`/product/${product.slug}`} className={`block relative ${aspectClass} overflow-hidden rounded-xl mb-4 bg-transparent shrink-0`}>
        {product.images[0] ? (
          <Image 
            src={product.images[0].url} 
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover/card:scale-110"
          />
        ) : storeLogo ? (
          <Image 
            src={storeLogo} 
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-8 opacity-10 grayscale transition-transform duration-700 group-hover/card:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground/50">
            <ShoppingBag className="w-8 h-8 opacity-20" />
          </div>
        )}
        
        
      </Link>
      
      <div className="flex flex-col flex-1 justify-between text-center">
        <div className="space-y-1 mb-4">
          {showCategory && product.category && (
            <p className="text-xs text-muted-foreground">{product.category.name}</p>
          )}
          <Link prefetch={false} href={`/product/${product.slug}`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 text-sm sm:text-base leading-snug">
            {product.name}
          </Link>
          {showDescription && product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">{product.description}</p>
          )}
        </div>
        
        <div className="flex items-center justify-center mt-auto">
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg" style={{ color: priceColor }}>{finalPrice.toFixed(2)} ج.م</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">{product.price.toFixed(2)} ج.م</span>
            )}
          </div>
        </div>
        
        {showAddToCart && !isOutOfStock && (
          <div className="mt-4">
            <button 
              onClick={handleQuickAdd}
              disabled={isAdding}
              style={{
                backgroundColor: addToCartStyle === 'solid' ? addToCartColor : 'transparent',
                color: addToCartStyle === 'solid' ? '#fff' : addToCartColor,
                borderColor: addToCartColor,
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-none font-normal transition-transform hover:scale-[1.02] active:scale-[0.98] ${addToCartStyle === 'outline' ? 'border-2' : ''}`}
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
              <span>{isAdding ? "جاري الإضافة..." : addToCartText}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}