"use client"
import React, { useState } from "react"
import { ChevronRight, Settings, Image as ImageIcon, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ImageUploader } from "@/components/ui/image-uploader"

export function SettingsPanel({ widget, categories, onBack, onUpdateWidget, onSave }: any) {
  
  const [localTitle, setLocalTitle] = useState(widget.title || "")
  const [editingItem, setEditingItem] = useState<any>(null)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value)
    onUpdateWidget({ ...widget, title: e.target.value })
  }

  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      title: "عنصر جديد",
      subtitle: "",
      desktopImage: "",
    }
    const updatedItems = [...(widget.items || []), newItem]
    onUpdateWidget({ ...widget, items: updatedItems })
    setEditingItem(newItem)
  }

  const handleUpdateItem = (updatedItem: any) => {
    const updatedItems = (widget.items || []).map((item: any) => 
      item.id === updatedItem.id ? updatedItem : item
    )
    onUpdateWidget({ ...widget, items: updatedItems })
    setEditingItem(updatedItem)
  }

  const handleDeleteItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()
    const updatedItems = (widget.items || []).filter((item: any) => item.id !== itemId)
    onUpdateWidget({ ...widget, items: updatedItems })
  }

  if (editingItem) {
    return (
      <div className="flex flex-col h-full bg-white relative animate-in slide-in-from-right-4 duration-300">
        <div className="h-14 flex items-center gap-3 px-4 border-b border-border/50 shrink-0 bg-slate-50">
          <button 
            onClick={() => setEditingItem(null)}
            className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-slate-500 hover:text-slate-800"
          >
            <ChevronRight className="w-5 h-5 rtl-flip" />
          </button>
          <div>
            <h3 className="font-bold text-sm text-slate-800">تعديل العنصر</h3>
            <p className="text-[11px] text-slate-500">الرجوع للإعدادات</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">صورة العنصر (أو الأيقونة)</label>
              <div className="bg-slate-50 border border-border/50 rounded-xl p-4">
                <ImageUploader 
                  label=""
                  value={editingItem.desktopImage || editingItem.imageUrl || ""} 
                  onChange={(url) => {
                    handleUpdateItem({ ...editingItem, desktopImage: url, imageUrl: url })
                  }} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">العنوان</label>
              <Input 
                value={editingItem.title || editingItem.name || ""} 
                onChange={(e) => handleUpdateItem({ ...editingItem, title: e.target.value, name: e.target.value })}
                className="bg-slate-50 text-xs"
                placeholder="أدخل العنوان..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">الوصف أو النص الفرعي</label>
              <Input 
                value={editingItem.subtitle || editingItem.description || ""} 
                onChange={(e) => handleUpdateItem({ ...editingItem, subtitle: e.target.value, description: e.target.value })}
                className="bg-slate-50 text-xs"
                placeholder="أدخل الوصف..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">رابط الزر (اختياري)</label>
              <Input 
                value={editingItem.buttonUrl || ""} 
                onChange={(e) => handleUpdateItem({ ...editingItem, buttonUrl: e.target.value })}
                className="bg-slate-50 text-xs text-left"
                dir="ltr"
                placeholder="https://..."
              />
            </div>
            
            <Button onClick={() => {
              setEditingItem(null)
              onSave(true)
            }} className="w-full bg-[#2453E3] hover:bg-[#1a3cb3]">
              تم وحفظ التعديلات
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white relative animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-border/50 shrink-0 bg-slate-50">
        <button 
          onClick={() => {
            onBack()
            onSave(true)
          }}
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
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">شعار المتجر (اللوجو)</label>
                <div className="bg-slate-50 border border-border/50 rounded-xl p-4">
                  <ImageUploader 
                    label=""
                    value={widget.config?.logoUrl || ""} 
                    onChange={(url) => onUpdateWidget({ ...widget, config: { ...widget.config, logoUrl: url } })} 
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <label className="text-xs font-bold text-slate-600 block">إظهار شريط البحث</label>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-[#2453E3]" 
                  checked={widget.config?.showSearch !== false}
                  onChange={(e) => onUpdateWidget({ ...widget, config: { ...widget.config, showSearch: e.target.checked } })}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 block">تثبيت القائمة العلوية</label>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-[#2453E3]" 
                  checked={widget.config?.sticky !== false}
                  onChange={(e) => onUpdateWidget({ ...widget, config: { ...widget.config, sticky: e.target.checked } })}
                />
              </div>
              <div className="space-y-2 pt-2 border-t border-border/50">
                <label className="text-xs font-bold text-slate-600 block">نص الشريط الإعلاني العلوي</label>
                <Input 
                  className="bg-slate-50 text-xs" 
                  placeholder="مثال: شحن مجاني للطلبات فوق 100 ريال" 
                  value={widget.config?.topBarText || ""}
                  onChange={(e) => onUpdateWidget({ ...widget, config: { ...widget.config, topBarText: e.target.value } })}
                />
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
                <label className="text-xs font-bold text-slate-600 block">شعار التذييل</label>
                <div className="bg-slate-50 border border-border/50 rounded-xl p-4">
                  <ImageUploader 
                    label=""
                    value={widget.config?.logoUrl || ""} 
                    onChange={(url) => onUpdateWidget({ ...widget, config: { ...widget.config, logoUrl: url } })} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">نبذة عن المتجر</label>
                <textarea 
                  className="w-full h-20 p-3 text-xs bg-slate-50 border border-input rounded-md outline-none focus:border-[#2453E3]" 
                  placeholder="اكتب نبذة مختصرة تظهر في أسفل المتجر..."
                  value={widget.config?.aboutText || ""}
                  onChange={(e) => onUpdateWidget({ ...widget, config: { ...widget.config, aboutText: e.target.value } })}
                />
              </div>
              <div className="space-y-2 pt-2 border-t border-border/50">
                <label className="text-xs font-bold text-slate-600 block">رابط الانستقرام</label>
                <Input 
                  className="bg-slate-50 text-xs text-left" dir="ltr" placeholder="https://instagram.com/..." 
                  value={widget.config?.instagramUrl || ""}
                  onChange={(e) => onUpdateWidget({ ...widget, config: { ...widget.config, instagramUrl: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">رقم الواتساب</label>
                <Input 
                  className="bg-slate-50 text-xs text-left" dir="ltr" placeholder="+9665..." 
                  value={widget.config?.whatsappNumber || ""}
                  onChange={(e) => onUpdateWidget({ ...widget, config: { ...widget.config, whatsappNumber: e.target.value } })}
                />
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
            
            {widget.type === "TextBlock" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">النص الفرعي</label>
                <textarea 
                  value={widget.subtitle || ""} 
                  onChange={(e) => onUpdateWidget({ ...widget, subtitle: e.target.value })}
                  className="w-full h-24 p-3 text-xs bg-slate-50 border border-input rounded-md outline-none focus:border-[#2453E3]"
                  placeholder="اكتب النص هنا..."
                />
              </div>
            )}
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
              <select 
                className="w-full h-10 px-3 py-2 text-sm bg-slate-50 border border-input rounded-md outline-none focus:border-[#2453E3]"
                value={widget.settings?.categoryId || ""}
                onChange={(e) => onUpdateWidget({ ...widget, settings: { ...widget.settings, categoryId: e.target.value } })}
              >
                <option value="">كل المنتجات</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Blocks (If Slider, BannerGrid, Features) */}
        {["HeroSlider", "BannerGrid", "BrandSlider", "ValuesSlider", "StoreFeatures"].includes(widget?.type || "") && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
              <ImageIcon className="w-4 h-4" />
              <span className="font-bold text-sm">العناصر (الصور/البطاقات)</span>
            </div>
            
            <div className="space-y-2">
              {widget.items?.map((item: any, idx: number) => (
                <div key={item.id} className="bg-slate-50 border border-border/50 p-3 rounded-lg flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded overflow-hidden shrink-0">
                    {item.desktopImage || item.imageUrl ? (
                      <img src={item.desktopImage || item.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 m-auto mt-3 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-xs font-bold truncate">{item.title || item.name || `عنصر ${idx + 1}`}</p>
                    <p className="text-[10px] text-slate-500 truncate">{item.subtitle || item.description || 'بدون وصف'}</p>
                  </div>
                  <Button onClick={() => setEditingItem(item)} variant="ghost" size="sm" className="h-8 text-xs text-[#2453E3]">تعديل</Button>
                  <button onClick={(e) => handleDeleteItem(e, item.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <Button 
                onClick={handleAddItem}
                variant="outline" 
                className="w-full border-dashed border-[#2453E3]/30 text-[#2453E3] bg-[#2453E3]/5"
              >
                إضافة عنصر جديد
              </Button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}
