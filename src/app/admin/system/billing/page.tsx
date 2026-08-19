import React from "react"
import { Check, X } from "lucide-react"

export const dynamic = "force-dynamic"

export default function BillingPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">الباقات والفواتير</h1>
        <p className="text-muted-foreground">قم بإدارة اشتراكك، فواتيرك، وترقية باقتك للحصول على ميزات متقدمة.</p>
      </div>

      <div className="mb-12 rounded-lg border border-border/50 bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">الاشتراك الحالي</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-lg text-primary">الباقة الأساسية</h3>
              <span className="rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700 border border-green-200">
                نشط
              </span>
            </div>
            <p className="text-sm text-muted-foreground">باقة تجريبية مجانية لتبدأ في بناء متجرك.</p>
          </div>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            تواصل معنا للترقية
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="p-6 bg-muted/30 border-b border-border/50">
          <h2 className="text-xl font-semibold">مقارنة الباقات</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 border-b border-border/50">
              <tr>
                <th className="p-4 font-medium text-muted-foreground w-1/3">الميزة</th>
                <th className="p-4 font-semibold text-center border-r border-border/50">الأساسية</th>
                <th className="p-4 font-semibold text-center border-r border-border/50 text-primary">الاحترافية</th>
                <th className="p-4 font-semibold text-center border-r border-border/50">المؤسسات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                { name: "المنتجات", basic: "50", pro: "غير محدود", enterprise: "غير محدود" },
                { name: "الطلبات", basic: "100 / شهر", pro: "غير محدود", enterprise: "غير محدود" },
                { name: "حسابات الموظفين", basic: "1", pro: "5", enterprise: "غير محدود" },
                { name: "الربط مع شركات الشحن", basic: false, pro: true, enterprise: true },
                { name: "بوابات الدفع الإلكتروني", basic: false, pro: true, enterprise: true },
                { name: "تخصيص الدومين", basic: false, pro: true, enterprise: true },
                { name: "تقارير متقدمة", basic: false, pro: false, enterprise: true },
              ].map((feature, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{feature.name}</td>
                  <td className="p-4 text-center border-r border-border/50">
                    {typeof feature.basic === "boolean" ? (
                      feature.basic ? <Check className="w-5 h-5 mx-auto text-green-600" /> : <X className="w-5 h-5 mx-auto text-muted-foreground/50" />
                    ) : feature.basic}
                  </td>
                  <td className="p-4 text-center border-r border-border/50 bg-primary/5">
                    {typeof feature.pro === "boolean" ? (
                      feature.pro ? <Check className="w-5 h-5 mx-auto text-green-600" /> : <X className="w-5 h-5 mx-auto text-muted-foreground/50" />
                    ) : feature.pro}
                  </td>
                  <td className="p-4 text-center border-r border-border/50">
                    {typeof feature.enterprise === "boolean" ? (
                      feature.enterprise ? <Check className="w-5 h-5 mx-auto text-green-600" /> : <X className="w-5 h-5 mx-auto text-muted-foreground/50" />
                    ) : feature.enterprise}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}