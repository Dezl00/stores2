import React from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "اتصل بنا | العسال",
  description: "تواصل معنا لأي استفسارات",
}

import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 py-12 max-w-4xl">
      {/* Page Header */}
      <div className="mb-12 relative overflow-hidden rounded-3xl bg-primary p-10 sm:p-16 text-center shadow-lg shadow-primary/20">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary-foreground mb-4">اتصل بنا</h1>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-primary-foreground/80 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Link prefetch={false} href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <span className="text-white font-medium">اتصل بنا</span>
          </nav>
        </div>
      </div>
      
      <div className="bg-card rounded-2xl border border-border/50 p-8">
        <p className="text-muted-foreground mb-8 text-lg">
          نحن هنا دائماً لخدمتك والإجابة على جميع استفساراتك. تواصل معنا عبر أي من القنوات التالية:
        </p>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2">رقم الهاتف / واتساب</h3>
            <p className="text-muted-foreground" dir="ltr">+966 50 000 0000</p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2">البريد الإلكتروني</h3>
            <p className="text-muted-foreground">support@assal.com</p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2">ساعات العمل</h3>
            <p className="text-muted-foreground">من الأحد إلى الخميس: 9:00 صباحاً - 5:00 مساءً</p>
          </div>
        </div>
      </div>
    </div>
  )
}
