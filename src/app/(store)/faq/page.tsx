import React from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "الأسئلة الشائعة | العسال",
  description: "الأسئلة الشائعة حول المتجر",
}

import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function FAQPage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-12 max-w-4xl">
      {/* Page Header */}
      <div className="mb-12 relative overflow-hidden rounded-3xl bg-primary p-10 sm:p-16 text-center shadow-lg shadow-primary/20">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary-foreground mb-4">الأسئلة الشائعة</h1>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-primary-foreground/80 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Link prefetch={false} href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <span className="text-white font-medium">الأسئلة الشائعة</span>
          </nav>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="p-6 bg-card rounded-2xl border border-border/50">
          <h3 className="text-xl font-bold mb-3">هل المنتجات طبيعية 100%؟</h3>
          <p className="text-muted-foreground leading-relaxed">
            نعم، جميع منتجاتنا من العسل طبيعية 100% وخالية من أي إضافات صناعية أو مواد حافظة، ومفحوصة مخبرياً لضمان أعلى معايير الجودة.
          </p>
        </div>
        
        <div className="p-6 bg-card rounded-2xl border border-border/50">
          <h3 className="text-xl font-bold mb-3">كم يستغرق التوصيل؟</h3>
          <p className="text-muted-foreground leading-relaxed">
            يستغرق التوصيل عادة من يومين إلى 5 أيام عمل داخل المملكة، وقد تختلف المدة حسب المنطقة.
          </p>
        </div>
        
        <div className="p-6 bg-card rounded-2xl border border-border/50">
          <h3 className="text-xl font-bold mb-3">ما هي طرق الدفع المتاحة؟</h3>
          <p className="text-muted-foreground leading-relaxed">
            نوفر خيارات دفع متعددة تشمل البطاقات الائتمانية (فيزا، ماستركارد)، مدى، أبل باي، بالإضافة إلى الدفع عند الاستلام في مناطق محددة.
          </p>
        </div>
        
        <div className="p-6 bg-card rounded-2xl border border-border/50">
          <h3 className="text-xl font-bold mb-3">هل يمكنني استرجاع المنتج؟</h3>
          <p className="text-muted-foreground leading-relaxed">
            نعم، يمكنك استرجاع المنتج خلال 7 أيام من تاريخ الاستلام بشرط أن يكون بحالته الأصلية ولم يتم فتحه أو استخدامه.
          </p>
        </div>
      </div>
    </div>
  )
}
