"use client"

import { useState } from "react"
import { toggleStoreStatus, deleteStore } from "./actions"

export function StoreActionsMenu({ storeId, isActive, storeName }: { storeId: string, isActive: boolean, storeName: string }) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (!confirm(`هل أنت متأكد من ${isActive ? 'تعطيل' : 'تفعيل'} المتجر ${storeName}؟`)) return
    setLoading(true)
    await toggleStoreStatus(storeId, !isActive)
    setLoading(false)
  }

  async function handleDelete() {
    const word = prompt(`لحذف المتجر ${storeName} بشكل نهائي، اكتب "حذف"`)
    if (word !== "حذف") return
    
    setLoading(true)
    const res = await deleteStore(storeId)
    setLoading(false)
    if (!res.success) {
      alert(res.error)
    }
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button 
        onClick={handleToggle} 
        disabled={loading}
        className={`px-3 py-1 text-xs rounded border transition ${isActive ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
      >
        {isActive ? 'تعطيل' : 'تفعيل'}
      </button>
      <button 
        onClick={handleDelete}
        disabled={loading}
        className="px-3 py-1 text-xs rounded border border-red-200 text-red-600 hover:bg-red-50 transition"
      >
        حذف
      </button>
    </div>
  )
}
