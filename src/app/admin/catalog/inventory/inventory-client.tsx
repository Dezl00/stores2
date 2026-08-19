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
    <div className="bg-card border border-border/50 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md relative">
          <input 
            type="text" 
            placeholder="البحث باسم المنتج أو SKU..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary rounded-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </form>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-muted/50 border-b border-border/50">
            <tr>
              <th className="p-4 font-semibold text-muted-foreground w-24">صورة المنتج</th>
              <th className="p-4 font-semibold text-muted-foreground">اسم المنتج</th>
              <th className="p-4 font-semibold text-muted-foreground w-48">SKU</th>
              <th className="p-4 font-semibold text-muted-foreground w-48">الكمية الحالية</th>
              <th className="p-4 font-semibold text-muted-foreground w-32 text-center">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  لا توجد منتجات مطابقة للبحث
                </td>
              </tr>
            ) : products.map((product: any) => {
              const imgUrl = product.images?.[0]?.url || "/placeholder.png"
              let statusText = "متوفر"
              let statusClass = "text-green-700 bg-green-50/50 border-green-200/50"
              
              if (product.stock === 0) {
                statusText = "نفاد"
                statusClass = "text-red-700 bg-red-50/50 border-red-200/50"
              } else if (product.stock < 10) {
                statusText = "منخفض"
                statusClass = "text-orange-700 bg-orange-50/50 border-orange-200/50"
              }

              return (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 align-middle">
                    <div className="w-12 h-12 relative rounded-md border border-border/50 overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="p-4 align-middle font-medium text-foreground">{product.name}</td>
                  <td className="p-4 align-middle font-mono text-xs text-muted-foreground" dir="ltr">{product.sku || "-"}</td>
                  <td className="p-4 align-middle relative">
                    <StockEditor productId={product.id} initialStock={product.stock} />
                  </td>
                  <td className="p-4 align-middle text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium border ${statusClass}`}>
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
        <div className="p-4 border-t border-border/50 flex justify-center gap-1.5 flex-wrap">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1
            const params = new URLSearchParams(searchParams as any)
            params.set("page", p.toString())
            const isActive = p === currentPage
            return (
              <button
                key={p}
                onClick={() => router.push(`${pathname}?${params.toString()}`)}
                className={`w-8 h-8 flex items-center justify-center rounded-md border text-sm transition-colors ${isActive ? 'bg-primary text-primary-foreground border-primary font-medium shadow-sm' : 'bg-background text-foreground border-border/50 hover:bg-muted'}`}
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
