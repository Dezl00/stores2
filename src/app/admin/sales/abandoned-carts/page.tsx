import React from "react"
import { db } from "@/lib/db"
import { resolveStoreId } from "@/lib/store-context"

export const dynamic = "force-dynamic"

export default async function AbandonedCartsPage() {
  const storeId = await resolveStoreId()
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  const carts = await db.cart.findMany({
    where: {
      storeId,
      updatedAt: {
        lt: oneHourAgo,
      },
      status: {
        notIn: ["CONVERTED", "COMPLETED"],
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return (
    <div className="p-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <span>الرئيسية</span>
        <span>/</span>
        <span className="text-foreground">السلات المتروكة</span>
      </nav>

      <div className="bg-card border border-border/50 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/50 border-b border-border/50 text-muted-foreground">
              <tr>
                <th className="p-4 font-semibold text-start align-middle">العميل</th>
                <th className="p-4 font-semibold text-start align-middle">عدد المنتجات</th>
                <th className="p-4 font-semibold text-start align-middle">إجمالي القيمة المقدرة</th>
                <th className="p-4 font-semibold text-start align-middle">آخر تحديث</th>
                <th className="p-4 font-semibold text-center align-middle">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {carts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    لا توجد سلات متروكة حالياً
                  </td>
                </tr>
              ) : (
                carts.map((cart) => {
                  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0)
                  const estimatedValue = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
                  
                  return (
                    <tr key={cart.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 align-middle text-foreground font-medium">{cart.userId ? "عضو مسجل" : "ضيف"}</td>
                      <td className="p-4 align-middle text-muted-foreground">{totalItems}</td>
                      <td className="p-4 align-middle font-medium text-foreground">{estimatedValue.toFixed(2)} ج.م</td>
                      <td className="p-4 align-middle text-muted-foreground" dir="ltr">{new Date(cart.updatedAt).toLocaleString("ar-EG")}</td>
                      <td className="p-4 align-middle text-center">
                        <button className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-border/50 bg-background text-foreground hover:bg-muted h-8 px-3 transition-colors">
                          عرض التفاصيل
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}