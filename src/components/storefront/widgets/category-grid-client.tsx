"use client"
import React from "react"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function CategoryGridClient({ widget, categories }: { widget: any, categories: any[] }) {
  if (categories.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              className="group relative flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md hover:-translate-y-1"
            >
              <div className="relative h-24 w-24 md:h-32 md:w-32 flex items-center justify-center rounded-full bg-muted/30 transition-transform group-hover:scale-105 overflow-hidden">
                {category.imageUrl ? (
                  <img 
                    src={category.imageUrl} 
                    alt={category.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="text-3xl font-semibold">{category.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-center group-hover:text-primary transition-colors text-lg">{category.name}</h3>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
