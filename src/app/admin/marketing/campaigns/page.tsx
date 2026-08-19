import React from "react"
import { Megaphone, Lock } from "lucide-react"

export const dynamic = "force-dynamic"

export default function CampaignsPage() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6 rounded-full bg-primary/10 p-6">
        <Megaphone className="h-12 w-12 text-primary" />
        <div className="absolute -right-2 -top-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
          قريباً
        </div>
      </div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">الحملات التسويقية</h1>
      <p className="max-w-md text-muted-foreground mb-8">
        أدوات متقدمة لإنشاء وإدارة الحملات التسويقية، رسائل البريد الإلكتروني، والإشعارات المخصصة لعملائك لزيادة المبيعات والولاء.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl text-start">
        <div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm opacity-70">
          <h3 className="font-semibold flex items-center mb-2"><Lock className="w-4 h-4 ml-2" /> إشعارات البريد</h3>
          <p className="text-sm text-muted-foreground">استهدف عملائك برسائل بريدية مخصصة وعروض حصرية.</p>
        </div>
        <div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm opacity-70">
          <h3 className="font-semibold flex items-center mb-2"><Lock className="w-4 h-4 ml-2" /> الإشعارات المباشرة</h3>
          <p className="text-sm text-muted-foreground">أرسل إشعارات Web Push للعملاء حتى عند عدم استخدامهم للموقع.</p>
        </div>
        <div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm opacity-70">
          <h3 className="font-semibold flex items-center mb-2"><Lock className="w-4 h-4 ml-2" /> رسائل SMS</h3>
          <p className="text-sm text-muted-foreground">تنبيهات سريعة ومباشرة لعروضك الخاصة وتحديثات الطلبات.</p>
        </div>
        <div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm opacity-70">
          <h3 className="font-semibold flex items-center mb-2"><Lock className="w-4 h-4 ml-2" /> أتمتة التسويق</h3>
          <p className="text-sm text-muted-foreground">إعداد حملات تعمل تلقائياً بناءً على سلوك العميل في المتجر.</p>
        </div>
      </div>
    </div>
  )
}