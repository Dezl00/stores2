import { db } from "@/lib/db"
import Link from "next/link"
import { CreateStoreModal } from "./create-store-modal"
import { StoreActionsMenu } from "./store-actions-menu"

export default async function PlatformStoresPage() {
  const stores = await db.store.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { products: true, orders: true, users: true } }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة المتاجر</h2>
        <CreateStoreModal />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">اسم المتجر</th>
                <th className="px-6 py-4 font-medium">الرابط الفرعي / النطاق</th>
                <th className="px-6 py-4 font-medium text-center">المنتجات</th>
                <th className="px-6 py-4 font-medium text-center">الطلبات</th>
                <th className="px-6 py-4 font-medium text-center">المستخدمين</th>
                <th className="px-6 py-4 font-medium text-center">الحالة</th>
                <th className="px-6 py-4 font-medium text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stores.map(store => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-indigo-900">{store.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-600 font-mono text-sm">{store.slug}</span>
                      {store.domain && <span className="text-xs text-gray-400">{store.domain}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">{store._count.products}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{store._count.orders}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{store._count.users}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 text-xs rounded-full ${store.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {store.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StoreActionsMenu storeId={store.id} isActive={store.isActive} storeName={store.name} />
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    لا يوجد متاجر حتى الآن. اضغط على "إنشاء متجر جديد" للبدء.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
