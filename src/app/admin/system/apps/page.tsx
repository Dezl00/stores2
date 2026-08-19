import React from "react"
import { Lock, Package, CreditCard, PieChart, Calculator } from "lucide-react"

export const dynamic = "force-dynamic"

export default function AppsPage() {
  const categories = [
    { name: "شحن وتوصيل", icon: Package, apps: ["أرامكس", "سمسا", "ساعي"] },
    { name: "بوابات الدفع", icon: CreditCard, apps: ["تاب", "بيفورت", "سترايب"] },
    { name: "تسويق وتحليل", icon: PieChart, apps: ["سناب شات بكسل", "جوجل أناليتكس", "ميل تشيمب"] },
    { name: "محاسبة ونقاط بيع", icon: Calculator, apps: ["قيود", "دفتر", "أودو"] },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">التطبيقات والربط</h1>
        <p className="text-muted-foreground">
          قريباً ستمكنك هذه المنصة من ربط متجرك بكل سهولة مع العشرات من الخدمات الخارجية والتطبيقات المتخصصة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category, index) => {
          const Icon = category.icon
          return (
            <div key={index} className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden opacity-80 cursor-not-allowed group">
              <div className="p-6 border-b bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-primary/60" />
                  <div className="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-secondary-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" /> قريباً
                  </div>
                </div>
                <h3 className="font-semibold text-lg">{category.name}</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {category.apps.map((app, appIdx) => (
                    <li key={appIdx} className="flex items-center text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary/40 ml-2"></span>
                      {app}
                    </li>
                  ))}
                  <li className="flex items-center text-sm text-muted-foreground pt-2 font-medium">
                    والمزيد...
                  </li>
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}