"use client"

import React, { useEffect, useState, useMemo } from "react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { Leaf, Lightbulb, Star, Award } from "lucide-react"

const DEFAULT_VALUES = [
  { id: 1, title: "الإستدامة", icon: Leaf },
  { id: 2, title: "الإبتكار", icon: Lightbulb },
  { id: 3, title: "التميز", icon: Star },
  { id: 4, title: "الجودة", icon: Award },
]

export function ValuesSlider({ widget }: { widget?: any }) {
  const items = widget?.items?.length > 0 ? widget.items : DEFAULT_VALUES
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(4)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1)
      else if (window.innerWidth < 768) setItemsPerPage(2)
      else if (window.innerWidth < 1024) setItemsPerPage(3)
      else setItemsPerPage(4)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, items.length - itemsPerPage)

  useEffect(() => {
    if (maxIndex <= 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
    }, 3000)
    return () => clearInterval(interval)
  }, [maxIndex])

  return (
    <div className="bg-primary py-16 text-primary-foreground overflow-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8">
        <ScrollReveal variant="fade-up">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">{widget?.title || "قيمنا"}</h2>
          </div>
        </ScrollReveal>
          
        <div className="relative max-w-5xl mx-auto">
          <div className="overflow-hidden" dir="rtl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translate3d(${currentIndex * (100 / itemsPerPage)}%, 0, 0)` }}
              >
                {items.map((item: any, idx: number) => {
                  const Icon = item.icon || Leaf
                  return (
                    <div 
                      key={item.id || idx} 
                      className="px-4 flex-shrink-0"
                      style={{ flexBasis: `${100 / itemsPerPage}%`, maxWidth: `${100 / itemsPerPage}%` }}
                    >
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center mb-4 text-primary shadow-lg transition-transform hover:scale-105">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title || item.name} className="w-16 h-16 object-contain" />
                          ) : (
                            <Icon className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={1.5} />
                          )}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-medium text-white">{item.title || item.name}</h3>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Dots */}
            {maxIndex > 0 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? "bg-white w-6" 
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
      </div>
    </div>
  )
}
