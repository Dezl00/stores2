import Link from "next/link"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "متجرك - منصة إنشاء المتاجر الإلكترونية",
  description: "أنشئ متجرك الإلكتروني بسهولة وابدأ البيع أونلاين",
}

export default async function WelcomePage() {
  let storeCount = 0
  try {
    storeCount = await db.store.count({ where: { status: "ACTIVE" } })
  } catch (e) {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50" dir="rtl">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-900">
          {process.env.NEXT_PUBLIC_PLATFORM_NAME || "متجرك"}
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/platform/stores"
            className="px-5 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            لوحة التحكم
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {storeCount > 0 ? storeCount + " متجر نشط على المنصة" : "منصة جاهزة للإطلاق"}
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            أنشئ متجرك الإلكتروني
            <span className="text-indigo-600"> في دقائق</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            منصة متكاملة لإنشاء وإدارة المتاجر الإلكترونية. ابدأ البيع أونلاين بدون أي خبرة تقنية.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/platform/stores"
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300"
            >
              ابدأ الآن
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">🏪</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">متجر كامل</h3>
            <p className="text-gray-600">إدارة المنتجات والطلبات والعملاء من لوحة تحكم واحدة سهلة الاستخدام.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">تصميم متجاوب</h3>
            <p className="text-gray-600">متجرك يظهر بشكل مثالي على جميع الأجهزة.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">تحليلات ذكية</h3>
            <p className="text-gray-600">تابع مبيعاتك وأداء متجرك بتقارير تفصيلية في الوقت الفعلي.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 text-sm border-t border-gray-100">
        <p>جميع الحقوق محفوظة {new Date().getFullYear()} {process.env.NEXT_PUBLIC_PLATFORM_NAME || "متجرك"}</p>
      </footer>
    </div>
  )
}