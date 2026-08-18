import { requireSuperAdmin } from "@/lib/auth/require-admin"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireSuperAdmin()
  } catch (error) {
    redirect("/login") // or a specific platform login
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" dir="rtl">
      {/* Platform Header */}
      <header className="bg-indigo-900 text-white shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">لوحة تحكم المنصة (Super Admin)</h1>
            <nav className="hidden md:flex gap-4">
              <Link href="/platform" className="hover:text-indigo-200 transition">الرئيسية</Link>
              <Link href="/platform/stores" className="hover:text-indigo-200 transition">المتاجر</Link>
              <Link href="/platform/users" className="hover:text-indigo-200 transition">المدراء</Link>
              <Link href="/platform/settings" className="hover:text-indigo-200 transition">الإعدادات</Link>
            </nav>
          </div>
          <div>
            {/* Minimal User Menu */}
            <span className="text-sm bg-indigo-800 px-3 py-1 rounded-full">مدير المنصة</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
