"use client"

import React, { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { StockEditor } from "./stock-editor"

export function InventoryClient({ products, currentPage, totalPages, initialSearch }: any) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(initialSearch)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams as any)
    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md relative">
          <input 
            type="text" 
            placeholder="البحث باسم المنتج أو SKU..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 rounded-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </form>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm text-slate-600 min-w-[800px]">
          <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium w-24">صورة المنتج</th>
              <th className="px-6 py-4 font-medium">اسم المنتج</th>
              <th className="px-6 py-4 font-medium w-48">SKU</th>
              <th className="px-6 py-4 font-medium w-48">الكمية الحالية</th>
              <th className="px-6 py-4 font-medium w-32">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  لا توجد منتجات مطابقة للبحث
                </td>
              </tr>
            ) : products.map((product: any) => {
              const imgUrl = product.images?.[0]?.url || "/placeholder.png"
              let statusText = "متوفر"
              let statusClass = "text-green-600 bg-green-50 border-green-200"
              
              if (product.stock === 0) {
                statusText = "نفاد"
                statusClass = "text-red-600 bg-red-50 border-red-200"
              } else if (product.stock < 10) {
                statusText = "منخفض"
                statusClass = "text-orange-600 bg-orange-50 border-orange-200"
              }

              return (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="w-12 h-12 relative rounded border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                  <td className="px-6 py-4 font-mono text-xs">{product.sku || "-"}</td>
                  <td className="px-6 py-4 relative">
                    <StockEditor productId={product.id} initialStock={product.stock} />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusClass}`}>
                      {statusText}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex justify-center gap-1.5 flex-wrap">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1
            const params = new URLSearchParams(searchParams as any)
            params.set("page", p.toString())
            const isActive = p === currentPage
            return (
              <button
                key={p}
                onClick={() => router.push(`${pathname}?${params.toString()}`)}
                className={`w-9 h-9 flex items-center justify-center rounded-md border text-sm transition-colors ${isActive ? 'bg-blue-600 text-white border-blue-600 font-medium' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
              >
                {p}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
