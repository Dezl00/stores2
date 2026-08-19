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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">السلات المتروكة</h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">العميل</th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">عدد المنتجات</th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">إجمالي القيمة المقدرة</th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">آخر تحديث</th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {carts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    لا توجد سلات متروكة حالياً
                  </td>
                </tr>
              ) : (
                carts.map((cart) => {
                  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0)
                  const estimatedValue = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
                  
                  return (
                    <tr key={cart.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle">{cart.userId ? "عضو مسجل" : "ضيف (Guest)"}</td>
                      <td className="p-4 align-middle">{totalItems}</td>
                      <td className="p-4 align-middle">{estimatedValue.toFixed(2)}</td>
                      <td className="p-4 align-middle" dir="ltr">{new Date(cart.updatedAt).toLocaleString("ar-EG")}</td>
                      <td className="p-4 align-middle">
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
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