"use client"
import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { getValidLink } from "@/lib/utils"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function BrandSlider({ widget }: { widget: any }) {

  const computeHref = (item: any) => {
    if (item.redirectType === 'Product' || item.redirectType === 'product') return `/product/${item.redirectId}`;
    if (item.redirectType === 'Category' || item.redirectType === 'category') return `/category/${item.redirectId}`;
    if (item.redirectType === 'Page' || item.redirectType === 'page') return `/pages/${item.redirectId}`;
    return item.buttonUrl || '#';
  };

  const originalItems = widget.items || []
  
  // Embla Carousel hook
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", direction: "rtl", slidesToScroll: 1 },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
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

  if (originalItems.length === 0) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl opacity-50">✨</span>
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">{widget.title || "شريط الماركات"}</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            قم بإضافة الماركات أو الشركاء لتظهر هنا.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-background py-10 border-y border-border/50">
      {widget.title && widget.title !== "" && (
        <ScrollReveal variant="fade-up" duration={0.5}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold tracking-tight">{widget.title}</h2>
          </div>
        </ScrollReveal>
      )}
      
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-12 group">
        <div className="overflow-hidden w-full cursor-grab active:cursor-grabbing" ref={emblaRef} dir="rtl">
          <div className="flex items-center">
            {originalItems.map((item: any, index: number) => (
              <div key={`${item.id}-${index}`} className="flex-[0_0_33.33%] sm:flex-[0_0_20%] md:flex-[0_0_16.66%] min-w-0 px-2 flex justify-center">
                {!widget?.settings?.disableRouting && (item.buttonUrl || item.redirectType) ? (
                  <Link prefetch={false} href={getValidLink(computeHref(item))} className="block transition-transform hover:scale-110">
                    <img 
                      src={item.desktopImage} 
                      alt={item.title || "Brand Logo"} 
                      className="h-14 sm:h-16 w-auto object-contain transition-all duration-300"
                    />
                  </Link>
                ) : (
                  <img 
                    src={item.desktopImage} 
                    alt={item.title || "Brand Logo"} 
                    className="h-14 sm:h-16 w-auto object-contain transition-all duration-300"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {originalItems.length > 3 && (
          <>
            <button 
              onClick={scrollPrev}
              className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-background/60 backdrop-blur-md border border-border/50 shadow-sm flex items-center justify-center text-foreground hover:bg-background hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous slide"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button 
              onClick={scrollNext}
              className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-background/60 backdrop-blur-md border border-border/50 shadow-sm flex items-center justify-center text-foreground hover:bg-background hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next slide"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
