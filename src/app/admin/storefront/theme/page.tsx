import React from "react"
import Link from "next/link"
import { ExternalLink, Palette } from "lucide-react"

export default function ThemeBuilderLauncherPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-2xl mx-auto px-4">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Palette className="w-10 h-10 text-primary" />
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold mb-4">محرر الواجهات الجديد (Theme Editor)</h1>
      <p className="text-muted-foreground mb-8 text-lg">
        لقد قمنا بنقل محرر واجهة المتجر إلى شاشة كاملة مستقلة لمنحك مساحة عمل أكبر وأدوات تحكم أسهل، تماماً كأفضل المنصات العالمية.
      </p>

      <Link 
        href="/builder" 
        className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg shadow-primary/20"
      >
        <span>فتح منشئ الواجهات</span>
        <ExternalLink className="w-5 h-5 rtl-flip" />
      </Link>
    </div>
  )
}
