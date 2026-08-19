"use client"
import React, { useState } from "react"
import { ChevronRight, Settings, Image as ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function SettingsPanel({ widget, categories, onBack, onUpdateWidget }: any) {
  
  const [localTitle, setLocalTitle] = useState(widget.title || "")

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value)
    onUpdateWidget({ ...widget, title: e.target.value })
  }

  return (
    <div className="flex flex-col h-full bg-white relative animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-border/50 shrink-0 bg-slate-50">
        <button 
          onClick={onBack}
          className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-slate-500 hover:text-slate-800"
        >
          <ChevronRight className="w-5 h-5 rtl-flip" />
        </button>
        <div>
          <h3 className="font-bold text-sm text-slate-800">{widget.title || widget.type}</h3>
          <p className="text-[11px] text-slate-500">إعدادات القسم</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Content Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
            <Settings className="w-4 h-4" />
            <span className="font-bold text-sm">المحتوى الأساسي</span>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-600">عنوان القسم</Label>
            <Input 
              value={localTitle} 
              onChange={handleTitleChange} 
              className="bg-slate-50"
              placeholder="مثال: وصل حديثاً"
            />
          </div>
        </div>

        {/* Dynamic Data (If Product List) */}
        {widget.type.includes("Product") && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
              <Settings className="w-4 h-4" />
              <span className="font-bold text-sm">مصدر البيانات</span>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">التصنيف المرتبط</Label>
              <select className="w-full h-10 px-3 py-2 text-sm bg-slate-50 border border-input rounded-md outline-none focus:border-[#2453E3]">
                <option value="">كل المنتجات</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Blocks (If Slider or BannerGrid) */}
        {widget.items && widget.items.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
              <ImageIcon className="w-4 h-4" />
              <span className="font-bold text-sm">العناصر (الصور)</span>
            </div>
            
            <div className="space-y-2">
              {widget.items.map((item: any, idx: number) => (
                <div key={item.id} className="bg-slate-50 border border-border/50 p-3 rounded-lg flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded overflow-hidden shrink-0">
                    {item.desktopImage ? (
                      <img src={item.desktopImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 m-auto mt-3 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-xs font-bold truncate">عنصر {idx + 1}</p>
                    <p className="text-[10px] text-slate-500 truncate">{item.redirectType || 'بدون رابط'}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">تعديل</Button>
                </div>
              ))}
              <Button variant="outline" className="w-full border-dashed border-[#2453E3]/30 text-[#2453E3] bg-[#2453E3]/5">
                إضافة عنصر جديد
              </Button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}
