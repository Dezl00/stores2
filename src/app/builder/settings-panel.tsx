"use client"
import React, { useState } from "react"
import { ChevronRight, Settings, Image as ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
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
        
        {/* Header Settings */}
        {widget.type === "Header" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
              <Settings className="w-4 h-4" />
              <span className="font-bold text-sm">إعدادات الترويسة</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 block">إظهار شريط البحث</label>
                <input type="checkbox" className="w-4 h-4 accent-[#2453E3]" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 block">تثبيت القائمة العلوية</label>
                <input type="checkbox" className="w-4 h-4 accent-[#2453E3]" defaultChecked />
              </div>
              <div className="space-y-2 pt-2 border-t border-border/50">
                <label className="text-xs font-bold text-slate-600 block">نص الشريط الإعلاني العلوي</label>
                <Input className="bg-slate-50 text-xs" placeholder="مثال: شحن مجاني للطلبات فوق 100 ريال" />
              </div>
            </div>
          </div>
        )}

        {/* Footer Settings */}
        {widget.type === "Footer" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
              <Settings className="w-4 h-4" />
              <span className="font-bold text-sm">إعدادات التذييل</span>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">نبذة عن المتجر</label>
                <textarea className="w-full h-20 p-3 text-xs bg-slate-50 border border-input rounded-md outline-none focus:border-[#2453E3]" placeholder="اكتب نبذة مختصرة تظهر في أسفل المتجر..."></textarea>
              </div>
              <div className="space-y-2 pt-2 border-t border-border/50">
                <label className="text-xs font-bold text-slate-600 block">رابط الانستقرام</label>
                <Input className="bg-slate-50 text-xs text-left" dir="ltr" placeholder="https://instagram.com/..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">رقم الواتساب</label>
                <Input className="bg-slate-50 text-xs text-left" dir="ltr" placeholder="+9665..." />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <label className="text-xs font-bold text-slate-600 block">إظهار روابط الصفحات السريعة</label>
                <input type="checkbox" className="w-4 h-4 accent-[#2453E3]" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 block">إظهار طرق الدفع المدعومة</label>
                <input type="checkbox" className="w-4 h-4 accent-[#2453E3]" defaultChecked />
              </div>
            </div>
          </div>
        )}

        {/* Standard Widget Content Settings */}
        {widget.type !== "Header" && widget.type !== "Footer" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
              <Settings className="w-4 h-4" />
              <span className="font-bold text-sm">المحتوى الأساسي</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">عنوان القسم</label>
              <Input 
                value={localTitle} 
                onChange={handleTitleChange} 
                className="bg-slate-50 text-xs"
                placeholder="مثال: وصل حديثاً"
              />
            </div>
          </div>
        )}

        {/* Dynamic Data (If Product List) */}
        {widget?.type?.includes("Product") && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
              <Settings className="w-4 h-4" />
              <span className="font-bold text-sm">مصدر البيانات</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">التصنيف المرتبط</label>
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
        {["HeroSlider", "BannerGrid", "BrandSlider", "ValuesSlider"].includes(widget?.type || "") && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
              <ImageIcon className="w-4 h-4" />
              <span className="font-bold text-sm">العناصر (الصور)</span>
            </div>
            
            <div className="space-y-2">
              {widget.items?.map((item: any, idx: number) => (
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
