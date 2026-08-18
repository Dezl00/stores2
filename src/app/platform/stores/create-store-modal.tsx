"use client"

import { useState } from "react"
import { createStore } from "./actions"

export function CreateStoreModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    const res = await createStore(formData)
    
    setLoading(false)
    if (res.success) {
      setIsOpen(false)
    } else {
      setError(res.error || "حدث خطأ غير معروف")
    }
  }

  if (!isOpen) return <button onClick={() => setIsOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">إنشاء متجر جديد</button>

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden" dir="rtl">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">إنشاء متجر جديد</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium mb-1">اسم المتجر</label>
            <input name="name" required className="w-full border rounded-lg px-3 py-2" placeholder="متجري الجميل" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الرابط الفرعي (Slug)</label>
            <input name="slug" required className="w-full border rounded-lg px-3 py-2 text-left" dir="ltr" placeholder="my-store" />
          </div>
          
          <hr className="my-4" />
          <h4 className="font-semibold text-sm text-gray-700">بيانات المالك (مدير المتجر)</h4>
          
          <div>
            <label className="block text-sm font-medium mb-1">اسم المالك</label>
            <input name="ownerName" required className="w-full border rounded-lg px-3 py-2" placeholder="أحمد محمد" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الهاتف / البريد</label>
            <input name="ownerPhone" required className="w-full border rounded-lg px-3 py-2 text-left" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">كلمة المرور</label>
            <input name="ownerPassword" type="password" required className="w-full border rounded-lg px-3 py-2 text-left" dir="ltr" />
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">إلغاء</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
              {loading ? 'جاري الإنشاء...' : 'إنشاء المتجر'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
