"use client"
import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { getValidLink } from "@/lib/utils"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"

export function HeroSlider({ widget }: { widget: any }) {
  const slides = widget.items || []

  // Global settings for the widget
  const textAlign = widget.settings?.textAlign || 'center'
  const textPosition = widget.settings?.textPosition || 'bottom'
  const overlayOpacity = widget.settings?.overlayOpacity ?? 40

  const getFlexAlign = (pos: string) => {
    if (pos === 'top') return 'justify-start pt-20 md:pt-28'
    if (pos === 'center') return 'justify-center'
    return 'justify-end pb-24 md:pb-32 lg:pb-40' // Increased padding bottom to raise it higher
  }
  
  const getTextJustify = (align: string) => {
    if (align === 'right') return 'mr-0 ml-auto text-right items-end'
    if (align === 'left') return 'ml-0 mr-auto text-left items-start'
    return 'mx-auto text-center items-center'
  }

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, direction: "rtl", duration: 40 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  )

  const [currentSlide, setCurrentSlide] = useState(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentSlide(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi, onSelect])

  const computeHref = (slide: any) => {
    if (slide.redirectType === 'product') return `/product/${slide.redirectId}`
    if (slide.redirectType === 'category') return `/category/${slide.redirectId}`
    if (slide.redirectType === 'page') return `/pages/${slide.redirectId}`
    if (slide.redirectType === 'productList') return `/products`
    return slide.buttonUrl || '#'
  }

  if (slides.length === 0) {
    return (
      <div className="w-full h-[50vh] md:h-[70vh] bg-secondary flex items-center justify-center text-muted-foreground">
        لا توجد شرائح مضافة
      </div>
    )
  }

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-[85vh] bg-black">
      <div className="overflow-hidden w-full h-full" ref={emblaRef} dir="rtl">
        <div className="flex h-full">
          {slides.map((slide: any, index: number) => {
            return (
              <div 
                key={slide.id}
                className="relative flex-[0_0_100%] h-full w-full min-w-0"
              >
                {/* Desktop Image */}
                <Image 
                  src={slide.desktopImage}
                  alt={slide.title || "Hero Slide"}
                  fill
                  priority={index === 0}
                  className="hidden md:block object-cover object-center"
                  sizes="100vw"
                />
                {/* Mobile Image (fallback to desktop if no mobile image) */}
                <Image 
                  src={slide.mobileImage || slide.desktopImage}
                  alt={slide.title || "Hero Slide"}
                  fill
                  priority={index === 0}
                  className="block md:hidden object-cover object-center"
                  sizes="100vw"
                />
                {/* Overlay */}
                <div 
                  className="absolute inset-0 bg-black"
                  style={{ opacity: overlayOpacity / 100 }}
                />
                {/* Content */}
                <div className={`absolute inset-0 flex flex-col p-6 md:p-16 lg:p-24 ${getFlexAlign(textPosition)}`}>
                  <div className={`max-w-3xl flex flex-col ${getTextJustify(textAlign)}`}>
                    {slide.title && (
                      <motion.h2 
                        initial={{ opacity: 0, y: 50 }}
                          animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-5 leading-tight"
                      >
                        {slide.title}
                      </motion.h2>
                    )}
                    {slide.subtitle && (
                      <motion.p 
                        initial={{ opacity: 0, y: 50 }}
                          animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="text-base md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-8 leading-relaxed max-w-2xl inline-block"
                      >
                        {slide.subtitle}
                      </motion.p>
                    )}
                    {(slide.buttonUrl || slide.redirectType) && (
                      <motion.div
                        initial={{ opacity: 0, y: 50 }}
                          animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                          transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link prefetch={false} href={getValidLink(computeHref(slide))}>
                          <Button size="lg" variant="outline" className="px-8 md:px-10 py-5 md:py-6 text-base md:text-lg font-bold bg-transparent text-white border-2 border-white hover:bg-white hover:text-black rounded-full shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group">
                            {slide.buttonText || "تسوق الآن"}
                            <ChevronLeft className="w-5 h-5 -translate-x-1 group-hover:-translate-x-2 transition-transform" />
                          </Button>
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={scrollNext}
            className="absolute left-3 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/30 hover:scale-105 text-white flex items-center justify-center transition-all shadow-lg"
            aria-label="Next slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button 
            onClick={scrollPrev}
            className="absolute right-3 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/30 hover:scale-105 text-white flex items-center justify-center transition-all shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === idx 
                    ? "w-8 h-2.5 bg-white" 
                    : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
