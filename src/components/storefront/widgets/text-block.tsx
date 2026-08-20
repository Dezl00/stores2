"use client"
import React from "react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export function TextBlock({ widget }: { widget: any }) {
  if (!widget.title && !widget.subtitle) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl opacity-50">📝</span>
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">نص مخصص</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            الرجاء إضافة نص من خلال إعدادات القسم.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <ScrollReveal variant="fade-up" duration={0.7}>
        <div className="max-w-3xl mx-auto text-center bg-secondary/30 rounded-3xl p-12 border border-border/50 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <ScrollReveal variant="fade-up" delay={0.1} duration={0.5}>
              <span className="text-4xl mb-4 block">🍯</span>
            </ScrollReveal>
            {widget.title && (
              <ScrollReveal variant="fade-up" delay={0.2} duration={0.5}>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">{widget.title}</h2>
              </ScrollReveal>
            )}
            {widget.subtitle && (
              <ScrollReveal variant="fade-up" delay={0.3} duration={0.5}>
                <p className="text-lg text-muted-foreground leading-relaxed">{widget.subtitle}</p>
              </ScrollReveal>
            )}
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}
