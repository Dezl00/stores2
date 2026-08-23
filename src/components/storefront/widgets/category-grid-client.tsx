"use client"
import React from "react"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function CategoryGridClient({ widget, categories }: { widget: any, categories: any[] }) {
  if (categories.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl opacity-50">📁</span>
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">{widget.title || "التصنيفات"}</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            لا توجد تصنيفات لعرضها. يرجى إضافة تصنيفات لمتجرك لتظهر هنا.
          </p>
        </div>
      </div>
    )
  }

  const {
    aspectRatio = "circle",
    titlePosition = "bottom",
    titleBgEnabled = false,
    titleBgColor = "#ffffff",
    titleColor = "#000000",
    borderRadius = 16
  } = widget.settings || {};

  const getAspectClass = () => {
    if (aspectRatio === "1:1") return "aspect-square w-full";
    if (aspectRatio === "3:4") return "aspect-[3/4] w-full";
    if (aspectRatio === "4:3") return "aspect-[4/3] w-full";
    return "h-24 w-24 md:h-32 md:w-32 rounded-full";
  };

  const isCircle = aspectRatio === "circle";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {widget.title && (
        <ScrollReveal variant="fade-up" duration={0.5}>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">{widget.title}</h2>
            {widget.subtitle && <p className="mt-4 text-muted-foreground">{widget.subtitle}</p>}
          </div>
        </ScrollReveal>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {categories.map((category, index) => (
          <ScrollReveal 
            key={category.id} 
            variant="fade-up" 
            delay={index * 0.08} 
            duration={0.5}
          >
            <Link prefetch={false} 
              href={`/category/${category.slug}`}
              className={`group relative flex flex-col items-center transition-all hover:-translate-y-1 ${
                isCircle ? "gap-3 p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/50 hover:shadow-md" : ""
              }`}
            >
              <div 
                className={`relative flex items-center justify-center bg-muted/30 overflow-hidden ${getAspectClass()}`}
                style={{ 
                  borderRadius: isCircle ? '9999px' : `${borderRadius}px`,
                  transition: 'transform 0.3s ease'
                }}
              >
                {category.imageUrl ? (
                  <img 
                    src={category.imageUrl} 
                    alt={category.name}
                    loading="lazy"
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-105">
                    <span className="text-3xl font-semibold">{category.name.charAt(0)}</span>
                  </div>
                )}

                {/* Title Inside */}
                {titlePosition === "inside" && !isCircle && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 transition-opacity duration-300" />
                )}
                {titlePosition === "inside" && !isCircle && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10 flex justify-center">
                    <div 
                      className="px-4 py-2 rounded-lg backdrop-blur-sm"
                      style={{ 
                        backgroundColor: titleBgEnabled ? titleBgColor : 'transparent',
                        color: titleColor
                      }}
                    >
                      <h3 className="font-bold text-center text-sm md:text-base">{category.name}</h3>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Title Outside (Bottom) */}
              {(titlePosition === "bottom" || (titlePosition === "inside" && isCircle)) && (
                <div 
                  className={`mt-3 px-4 py-1.5 rounded-lg ${!isCircle ? 'w-full text-center' : ''}`}
                  style={{ 
                    backgroundColor: titleBgEnabled ? titleBgColor : 'transparent',
                    color: titleColor
                  }}
                >
                  <h3 className="font-semibold transition-colors text-base md:text-lg">{category.name}</h3>
                </div>
              )}
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
