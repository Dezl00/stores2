"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { getValidLink } from "@/lib/utils"

export function HeroSlider({ widget }: { widget: any }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = widget.items || []

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

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
        لم يتم إضافة صور للسلايدر
      </div>
    )
  }

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-[85vh] overflow-hidden bg-black" dir="ltr">
      {slides.map((slide: any, index: number) => {
        const offset = (currentSlide - index) * 100
        return (
          <div 
            key={slide.id}
            className="absolute inset-0 transition-transform duration-700 ease-in-out w-full h-full"
            style={{ transform: `translateX(${offset}%)` }}
            dir="rtl"
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
              style={{ opacity: (slide.settings?.overlayOpacity ?? 40) / 100 }}
            />
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 pb-16 md:p-16 md:pb-24 lg:p-24 lg:pb-32">
              <div className={`max-w-3xl ${
                slide.settings?.alignment === "left" ? "mr-auto ml-0 text-left" : 
                slide.settings?.alignment === "right" ? "ml-auto mr-0 text-right" : 
                "mx-auto text-center"
              }`}>
                {slide.title && (
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-5 leading-tight drop-shadow-lg">
                    {slide.title}
                  </h2>
                )}
                {slide.subtitle && (
                  <p className="text-base md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-8 leading-relaxed drop-shadow-md max-w-2xl inline-block">
                    {slide.subtitle}
                  </p>
                )}
                {(slide.buttonUrl || slide.redirectType) && slide.buttonText && (
                  <div>
                    <Link prefetch={false} href={getValidLink(computeHref(slide))}>
                      <Button size="lg" className="px-8 md:px-10 py-5 md:py-6 text-base md:text-lg font-bold bg-white text-black hover:bg-white/90 rounded-full shadow-xl hover:scale-105 transition-all duration-300 border-0">
                        {slide.buttonText}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            className="absolute right-3 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/30 hover:scale-105 text-white flex items-center justify-center transition-all shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
            className="absolute left-3 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/30 hover:scale-105 text-white flex items-center justify-center transition-all shadow-lg"
            aria-label="Next slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
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
