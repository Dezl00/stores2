"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { getValidLink } from "@/lib/utils"

export function HeroSlider({ widget }: { widget: any }) {

  const textAlign = widget.settings?.textAlign || 'center';
  const textPosition = widget.settings?.textPosition || 'center';

  const getFlexAlign = (pos: string) => {
    if (pos === 'top') return 'justify-start mt-12 md:mt-24';
    if (pos === 'center') return 'justify-center';
    return 'justify-end mb-12 md:mb-24';
  }
  const getTextJustify = (align: string) => {
    if (align === 'right') return 'items-end text-right';
    if (align === 'left') return 'items-start text-left';
    return 'items-center text-center';
  }


  const computeHref = (slide: any) => {
    if (slide.redirectType === 'Product' || slide.redirectType === 'product') return `/product/${slide.redirectId}`;
    if (slide.redirectType === 'Category' || slide.redirectType === 'category') return `/category/${slide.redirectId}`;
    if (slide.redirectType === 'Page' || slide.redirectType === 'page') return `/pages/${slide.redirectId}`;
    return slide.buttonUrl || '#';
  };

  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = widget.items || []

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full h-[50vh] md:h-[70vh] rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
          لم يتم إضافة صور للسلايدر
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden bg-black rounded-2xl" dir="ltr">
        {slides.map((slide: any, index: number) => {
          const offset = (currentSlide - index) * 100;
          return (
            <div 
              key={slide.id}
              className="absolute inset-0 transition-transform duration-700 ease-in-out w-full h-full"
              style={{ transform: `translateX(${offset}%)` }}
              dir="rtl"
            >
              <Image 
                src={slide.desktopImage}
                alt={slide.title || "Hero Slide"}
                fill
                priority={index === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
              {/* Overlay */}
              <div 
                className="absolute inset-0 bg-black"
                style={{ opacity: (slide.settings?.overlayOpacity ?? 40) / 100 }}
              />
              {/* Content Container */}
              <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-24">
                <div className={`container max-w-4xl ${
                  slide.settings?.alignment === "left" ? "mr-auto ml-0 text-left" : 
                  slide.settings?.alignment === "right" ? "ml-auto mr-0 text-right" : 
                  "mx-auto text-center"
                }`}>
                  {slide.title && (
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight animate-in slide-in-from-bottom-8 duration-700 drop-shadow-lg">
                      {slide.title}
                    </h2>
                  )}
                  {slide.subtitle && (
                    <p className="text-lg md:text-2xl text-white/90 mb-8 max-w-3xl animate-in slide-in-from-bottom-10 duration-700 delay-75 drop-shadow-md inline-block">
                      {slide.subtitle}
                    </p>
                  )}
                  {(slide.buttonUrl || slide.redirectType) && (
                    <div className="animate-in slide-in-from-bottom-12 duration-700 delay-150">
                      <Link prefetch={false} href={getValidLink(computeHref(slide))}>
                        {(() => {
                          const isOutline = slide.settings?.buttonStyle === "outline";
                          let bgStyle: any = {};
                          let textStyle: any = {};
                          let className = "px-8 text-lg hover:scale-105 transition-all duration-300 shadow-lg border-2 ";
                          
                          // Handle Colors
                          const bgColor = slide.settings?.buttonBgColor || "primary";
                          const customBg = slide.settings?.buttonCustomBgColor;
                          const txtColor = slide.settings?.buttonTextColor || "white";
                          const customTxt = slide.settings?.buttonCustomTextColor;

                          if (isOutline) {
                            className += "bg-transparent hover:bg-white/10 backdrop-blur-sm ";
                            if (bgColor === "primary") className += "border-primary text-primary ";
                            else if (bgColor === "secondary") className += "border-secondary text-secondary ";
                            else if (bgColor === "white") className += "border-white text-white hover:text-white ";
                            else if (bgColor === "custom" && customBg) {
                              bgStyle = { borderColor: customBg, color: customBg };
                            }
                          } else {
                            // Solid
                            if (bgColor === "primary") className += "bg-primary border-primary hover:brightness-110 ";
                            else if (bgColor === "secondary") className += "bg-secondary border-secondary hover:brightness-110 ";
                            else if (bgColor === "white") className += "bg-white border-white hover:bg-gray-100 ";
                            else if (bgColor === "custom" && customBg) {
                              bgStyle = { backgroundColor: customBg, borderColor: customBg };
                            }
                            
                            if (txtColor === "primary") className += "text-primary ";
                            else if (txtColor === "secondary") className += "text-secondary ";
                            else if (txtColor === "white") className += "text-white ";
                            else if (txtColor === "custom" && customTxt) {
                              textStyle = { color: customTxt };
                            }
                          }

                          return (
                            <Button size="lg" className={className} style={{ ...bgStyle, ...textStyle }}>
                              {slide.buttonText || "تسوق الآن"}
                            </Button>
                          );
                        })()}
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
              className="absolute right-2 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur border border-white/30 hover:bg-white/40 hover:scale-105 text-white flex items-center justify-center transition-all shadow-lg"
              aria-label="Previous slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button 
              onClick={() => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
              className="absolute left-2 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur border border-white/30 hover:bg-white/40 hover:scale-105 text-white flex items-center justify-center transition-all shadow-lg"
              aria-label="Next slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {slides.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    currentSlide === idx 
                      ? "w-8 h-2.5 bg-primary" 
                      : "w-2.5 h-2.5 bg-white/50 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
