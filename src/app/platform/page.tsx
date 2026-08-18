import { db } from "@/lib/db"
import Link from "next/link"

export default async function PlatformDashboard() {
  const [storeCount, platformUsersCount] = await Promise.all([
    db.store.count(),
    db.platformUser.count(),
  ])

  // Get recently created stores
  const recentStores = await db.store.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, domain: true, slug: true, isActive: true, createdAt: true }
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">نظرة عامة على المنصة</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <span className="text-gray-500 text-sm mb-2">إجمالي المتاجر</span>
          <span className="text-4xl font-bold text-indigo-900">{storeCount}</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <span className="text-gray-500 text-sm mb-2">مدراء المنصة</span>
          <span className="text-4xl font-bold text-indigo-900">{platformUsersCount}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-lg">أحدث المتاجر</h3>
          <Link href="/platform/stores" className="text-indigo-600 hover:text-indigo-800 text-sm">عرض الكل &larr;</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="px-6 py-3 font-medium">اسم المتجر</th>
                <th className="px-6 py-3 font-medium">الرابط الفرعي (Slug)</th>
                <th className="px-6 py-3 font-medium">النطاق المخصص</th>
                <th className="px-6 py-3 font-medium">الحالة</th>
                <th className="px-6 py-3 font-medium">تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentStores.map(store => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-indigo-900">{store.name}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-sm">{store.slug}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-sm">{store.domain || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${store.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {store.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(store.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                </tr>
              ))}
              {recentStores.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">لا يوجد متاجر حتى الآن</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
