import React from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "سياسة الشحن والتوصيل | العسال",
  description: "معلومات الشحن والتوصيل",
}

import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function ShippingPage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-12 max-w-4xl">
      {/* Page Header */}
      <div className="mb-12 relative overflow-hidden rounded-3xl bg-primary p-10 sm:p-16 text-center shadow-lg shadow-primary/20">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary-foreground mb-4">سياسة الشحن والتوصيل</h1>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-primary-foreground/80 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Link prefetch={false} href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <span className="text-white font-medium">سياسة الشحن والتوصيل</span>
          </nav>
        </div>
      </div>
      
      <div className="bg-card rounded-2xl border border-border/50 p-8 space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">مناطق التوصيل</h2>
          <p className="text-muted-foreground leading-relaxed">
            نقوم بالتوصيل إلى جميع مدن ومناطق المملكة العربية السعودية عبر شركائنا المعتمدين لضمان وصول طلباتكم بسرعة وأمان.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">مدة التوصيل</h2>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
            <li>الرياض: التوصيل خلال 24 - 48 ساعة من تأكيد الطلب.</li>
            <li>باقي مدن المملكة: التوصيل خلال 2 إلى 5 أيام عمل.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">تكلفة الشحن</h2>
          <p className="text-muted-foreground leading-relaxed">
            تكلفة الشحن الثابتة هي 29 ريال سعودي لجميع الطلبات. ونقدم شحناً مجانياً للطلبات التي تتجاوز قيمتها 300 ريال سعودي.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4 text-foreground">تتبع الطلب</h2>
          <p className="text-muted-foreground leading-relaxed">
            بمجرد شحن طلبك، ستتلقى رسالة نصية وبريداً إلكترونياً يحتوي على رقم التتبع لتتمكن من متابعة حالة الشحنة مع شركة التوصيل.
          </p>
        </section>
      </div>
    </div>
  )
}
