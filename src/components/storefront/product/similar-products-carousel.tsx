"use client"

import React, { useState, useEffect, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ProductCard } from "@/components/storefront/product-card"
import { ChevronRight, ChevronLeft } from "lucide-react"

import { useUIStore } from "@/store/ui-store"

export function SimilarProductsCarousel({ products }: { products: any[] }) {
  const { themeConfig } = useUIStore()
  const mobileCols = themeConfig?.headerSettings?.productCard?.mobileCols || "2"
  const desktopCols = themeConfig?.headerSettings?.productCard?.desktopCols || "5"

  const getFlexBasis = () => {
    let basis = ""
    
    // Mobile
    if (mobileCols === "1.5") basis += "flex-[0_0_75%] "
    else if (mobileCols === "1") basis += "flex-[0_0_100%] "
    else basis += "flex-[0_0_50%] "
    
    // Desktop
    if (desktopCols === "4") basis += "md:flex-[0_0_33.33%] lg:flex-[0_0_25%]"
    else if (desktopCols === "5") basis += "md:flex-[0_0_33.33%] lg:flex-[0_0_25%] xl:flex-[0_0_20%]"
    else if (desktopCols === "6") basis += "md:flex-[0_0_33.33%] lg:flex-[0_0_25%] xl:flex-[0_0_20%] 2xl:flex-[0_0_16.66%]"
    else basis += "md:flex-[0_0_33.33%] lg:flex-[0_0_25%]"

    return basis
  }
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", direction: "rtl" },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on("reInit", onInit)
    emblaApi.on("reInit", onSelect)
    emblaApi.on("select", onSelect)
  }, [emblaApi, onInit, onSelect])

  if (!products || products.length === 0) return null;

  return (
    <div className="relative group px-2 sm:px-0">
      <div className="overflow-hidden" ref={emblaRef} dir="rtl">
        <div className="flex pb-2 -mx-2 sm:-mx-3">
          {products.map((product) => (
            <div key={product.id} className={`${getFlexBasis()} min-w-0 px-2 sm:px-3`}>
              <ProductCard product={product} disableAnimation={true} />
            </div>
          ))}
        </div>
      </div>

      <button
        className="absolute top-[40%] right-2 sm:-right-5 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-md shadow-md border border-border/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center hover:bg-background/90 hover:scale-105"
        onClick={scrollPrev}
      >
        <ChevronRight className="w-5 h-5 text-foreground" />
      </button>

      <button
        className="absolute top-[40%] left-2 sm:-left-5 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-md shadow-md border border-border/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center hover:bg-background/90 hover:scale-105"
        onClick={scrollNext}
      >
        <ChevronLeft className="w-5 h-5 text-foreground" />
      </button>

      <div className="flex justify-center gap-2 mt-4">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "w-6 bg-primary"
                : "w-2 bg-primary/20 hover:bg-primary/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
