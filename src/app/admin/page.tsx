import React from "react"
import Link from "next/link"
import { Activity, Users, ShoppingBag, DollarSign } from "lucide-react"
import { db } from "@/lib/db"
import { requireStoreId } from "@/lib/tenant"

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  try {
    const storeId = await requireStoreId()

    const [totalSalesResult, newOrders, customers, activeProducts, topProductsData, latestOrders, theme] = await Promise.all([
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { storeId, status: { not: "CANCELLED" } }
      }),
      db.order.count({
        where: { storeId, status: "PENDING" }
      }),
      db.storeUser.count({
        where: { storeId, role: "CUSTOMER" }
      }),
      db.product.count({
        where: { storeId }
      }),
      db.productView.groupBy({
        by: ['productId'],
        where: { product: { storeId } },
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 5
      }),
      db.order.findMany({
        where: { storeId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      }),
      db.themeConfig.findUnique({ where: { storeId } })
    ])

    // Get product details for topProducts — single batch query instead of N+1
    const topProductIds = topProductsData.map(tp => tp.productId)
    const topProductDetails = topProductIds.length > 0
      ? await db.product.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, name: true, images: { where: { isPrimary: true }, take: 1 } }
        })
      : []
    const productMap = new Map(topProductDetails.map(p => [p.id, p]))
    const topProducts = topProductsData.map(tp => ({
      ...tp,
      product: productMap.get(tp.productId) || { name: 'منتج محذوف', images: [] }
    }))

    const totalSales = totalSalesResult._sum.totalAmount || 0
    const adminColor = theme?.adminColor || "#2453E3"

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span className="text-foreground">الرئيسية</span>
        </nav>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border-0 p-4 sm:p-6 shadow-md transition-all hover:scale-[1.02] bg-indigo-50 text-indigo-950">
            <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-200 text-indigo-700 shadow-sm">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-800/80">إجمالي المبيعات</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{totalSales.toFixed(2)} ج.م</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-0 p-4 sm:p-6 shadow-md transition-all hover:scale-[1.02] bg-emerald-50 text-emerald-950">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-200 text-emerald-700 shadow-sm">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800/80">الطلبات الجديدة</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{newOrders}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-0 p-4 sm:p-6 shadow-md transition-all hover:scale-[1.02] bg-amber-50 text-amber-950">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-200 text-amber-700 shadow-sm">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800/80">العملاء</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{customers}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-0 p-4 sm:p-6 shadow-md transition-all hover:scale-[1.02] bg-rose-50 text-rose-950">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-200 text-rose-700 shadow-sm">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-rose-800/80">المنتجات النشطة</p>
              <h3 className="text-2xl font-bold tracking-tight mt-1">{activeProducts}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Most Viewed Products */}
        <div className="rounded-xl border border-border/50 bg-card p-4 sm:p-6 shadow-sm lg:col-span-1 order-last lg:order-first">
          <h3 className="mb-4 text-lg font-semibold tracking-tight">المنتجات الأكثر مشاهدة</h3>
          <div className="flex flex-col gap-4">
            {topProducts.length > 0 ? topProducts.map((tv, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  {tv.product.images && tv.product.images[0] ? (
                    <img src={((tv.product.images[0] as any).url) || (tv.product.images[0] as any)} alt={tv.product.name} className="w-10 h-10 rounded-md object-cover border border-border/50" />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground border border-border/50">صورة</div>
                  )}
                  <span className="text-sm font-medium line-clamp-2">{tv.product.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 font-bold whitespace-nowrap">{tv._count.productId} <span className="hidden sm:inline">مشاهدة</span></span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات بعد</p>
            )}
          </div>
        </div>

        {/* Latest Orders */}
        <div className="rounded-xl border border-border/50 bg-card p-4 sm:p-6 shadow-sm flex flex-col lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold tracking-tight">أحدث الطلبات</h3>
            <Link prefetch={false} href="/admin/orders" className="text-sm text-primary hover:underline font-medium">عرض الكل</Link>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {latestOrders.length > 0 ? latestOrders.map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0 gap-2 hover:bg-muted/10 transition-colors rounded-lg sm:p-2">
                <div className="flex flex-col">
                  <span className="font-medium">طلب #{order.id.slice(-6).toUpperCase()}</span>
                  <span className="text-sm text-muted-foreground">{order.user?.name || order.user?.phone || "عميل زائر"}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:flex-col gap-2 sm:gap-1 text-sm">
                  <span className="font-bold text-foreground">{order.totalAmount} ج.م</span>
                  <Link prefetch={false} href={`/admin/orders`} className="text-xs bg-[#2453E3] text-white px-3 py-1.5 sm:px-2 sm:py-1 rounded-md hover:opacity-90 transition-colors font-medium">
                    تفاصيل الطلب
                  </Link>
                </div>
              </div>
            )) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-background py-8">
                <p className="text-sm text-muted-foreground">لا توجد طلبات مسجلة حتى الآن.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
  } catch (error: any) {
    return (
      <div className="p-8 text-center border rounded-lg bg-red-50 text-red-700">
        <h2 className="text-xl font-bold mb-4">حدث خطأ في تحميل لوحة التحكم</h2>
        <p dir="ltr" className="font-mono text-sm">{error.message}</p>
        <p dir="ltr" className="font-mono text-xs mt-2 text-red-500">{error.stack}</p>
      </div>
    )
  }
}
