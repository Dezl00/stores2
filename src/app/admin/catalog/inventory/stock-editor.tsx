"use client"

import React, { useState, useTransition } from "react"
import { updateStockAction } from "./actions"

export function StockEditor({ productId, initialStock }: { productId: string, initialStock: number }) {
  const [stock, setStock] = useState(initialStock.toString())
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    const val = parseInt(stock)
    if (isNaN(val) || val < 0) {
      setError("قيمة غير صالحة")
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await updateStockAction(productId, val)
      if (res?.success) {
        setIsEditing(false)
      } else {
        setError(res?.error || "حدث خطأ")
      }
    })
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input 
          type="number"
          min="0"
          value={stock}
          onChange={e => setStock(e.target.value)}
          className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-left"
          dir="ltr"
          disabled={isPending}
        />
        <button 
          onClick={handleSave} 
          disabled={isPending}
          className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
          title="حفظ"
        >
          {isPending ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          )}
        </button>
        <button 
          onClick={() => {
            setStock(initialStock.toString())
            setIsEditing(false)
            setError(null)
          }} 
          disabled={isPending}
          className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded disabled:opacity-50"
          title="إلغاء"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        {error && <span className="text-xs text-red-500 absolute -bottom-5 right-0 whitespace-nowrap">{error}</span>}
      </div>
    )
  }

  return (
    <div 
      className="flex items-center justify-start gap-2 group cursor-pointer"
      onClick={() => setIsEditing(true)}
      title="انقر لتعديل الكمية"
    >
      <span className="font-medium text-slate-900">{initialStock}</span>
      <button className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-opacity">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      </button>
    </div>
  )
}
