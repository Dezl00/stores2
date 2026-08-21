"use client"
import React, { useState } from "react"
import { ChevronRight, Settings, Image as ImageIcon, Plus, Trash2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductPickerModal } from "@/components/admin/product-picker-modal"
import { ImageUploader } from "@/components/ui/image-uploader"

export function SettingsPanel({ widget, categories, widgets, headerSettings, footerSettings, onBack, onUpdateWidget, onSave }: any) {
  
  const [localTitle, setLocalTitle] = useState(widget.title || "")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [productPickerOpen, setProductPickerOpen] = useState(false)

  // Build the full save state with an updated widget applied inline
  // This avoids the stateRef race condition entirely
  const buildSaveState = (updatedWidget?: any) => {
    const w = updatedWidget || widget
    let updatedWidgets = widgets
    let updatedHeader = headerSettings
    let updatedFooter = footerSettings

    if (w.id === "HEADER") {
      updatedHeader = w.config || {}
    } else if (w.id === "FOOTER") {
      updatedFooter = w.config || {}
    } else {
      updatedWidgets = widgets.map((ww: any) => ww.id === w.id ? w : ww)
    }
    return { widgets: updatedWidgets, headerSettings: updatedHeader, footerSettings: updatedFooter }
  }

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

  
  return (
      <div className="flex flex-col h-full bg-white relative animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-border/50 shrink-0 bg-slate-50">
        <button 
          onClick={() => {
            onBack()
            onSave(true, buildSaveState())
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

          {widget.type !== "Header" && widget.type !== "Footer" && (
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-border/50 rounded-xl mb-2">
              <div>
                <span className="font-bold text-sm text-slate-800 block">حالة القسم</span>
                <span className="text-[11px] text-slate-500 block">تفعيل أو إخفاء القسم من المتجر</span>
              </div>
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#2453E3]" 
                checked={widget.status !== false}
                onChange={(e) => {
                  const newWidget = { ...widget, status: e.target.checked }
                  onUpdateWidget(newWidget)
                  onSave(buildSaveState(newWidget))
                }}
              />
            </div>
          )}
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

          
          {widget.type === "PromoBentoGrid" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
                <Settings className="w-4 h-4" />
                <span className="font-bold text-sm">إعدادات شبكة الصور (Bento)</span>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 block">تفعيل تأثير Bento Grid</label>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-[#2453E3]" 
                  checked={widget.settings?.bentoEffectEnabled !== false}
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, bentoEffectEnabled: e.target.checked } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">نص الزر (اختياري)</label>
                <Input 
                  value={widget.settings?.buttonText || ""} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, buttonText: e.target.value } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                  className="bg-slate-50 text-xs"
                  placeholder="مثال: تسوق الآن"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">توجيه الزر</label>
                <select
                  value={widget.settings?.redirectType || "custom"}
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, redirectType: e.target.value, redirectId: "", buttonUrl: "" } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                  className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 text-xs"
                >
                  <option value="custom">رابط مخصص</option>
                  <option value="product">منتج</option>
                  <option value="category">تصنيف</option>
                  <option value="page">صفحة</option>
                </select>
              </div>

              {(!widget.settings?.redirectType || widget.settings.redirectType === "custom") && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">الرابط المخصص</label>
                  <Input 
                    value={widget.settings?.buttonUrl || ""} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, buttonUrl: e.target.value } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(buildSaveState())}
                    className="bg-slate-50 text-xs text-left"
                    dir="ltr"
                    placeholder="https://..."
                  />
                </div>
              )}

              {widget.settings?.redirectType === "category" && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">اختر التصنيف</label>
                  <select
                    value={widget.settings?.redirectId || ""}
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, redirectId: e.target.value } }
                      onUpdateWidget(newWidget)
                      onSave(buildSaveState(newWidget))
                    }}
                    className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 text-xs"
                  >
                    <option value="">-- اختر --</option>
                    {categories?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {widget.settings?.redirectType === "page" && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">اختر الصفحة</label>
                  <select
                    value={widget.settings?.redirectId || ""}
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, redirectId: e.target.value } }
                      onUpdateWidget(newWidget)
                      onSave(buildSaveState(newWidget))
                    }}
                    className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 text-xs"
                  >
                    <option value="">-- اختر --</option>
                    <option value="about">من نحن</option>
                    <option value="contact">اتصل بنا</option>
                    <option value="terms">الشروط والأحكام</option>
                    <option value="privacy">سياسة الخصوصية</option>
                  </select>
                </div>
              )}

              {widget.settings?.redirectType === "product" && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">المنتج المختار</label>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between bg-slate-50 text-xs h-10"
                    onClick={() => setProductPickerOpen(true)}
                  >
                    <span className="truncate">{widget.settings?.redirectId ? "تغيير المنتج" : "اختر منتجاً..."}</span>
                  </Button>
                  {productPickerOpen && (
                    <ProductPickerModal 
                      open={productPickerOpen}
                      onOpenChange={setProductPickerOpen}
                      initialSelectedIds={widget.settings?.redirectId ? [widget.settings.redirectId] : []}
                      single={true}
                      onSave={(selected: string[]) => {
                        const newWidget = { ...widget, settings: { ...widget.settings, redirectId: selected[0] || "" } }
                        onUpdateWidget(newWidget)
                        onSave(true, buildSaveState(newWidget))
                      }}
                    />
                  )}
                </div>
              )}

<div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">لون التعتيم</label>
                  <Input 
                    type="color"
                    value={widget.settings?.overlayColor || "#000000"} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, overlayColor: e.target.value } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(buildSaveState())}
                    className="h-10 cursor-pointer p-1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">درجة الشفافية (0-100)</label>
                  <Input 
                    type="range" min="0" max="100"
                    value={widget.settings?.overlayOpacity ?? 40} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, overlayOpacity: parseInt(e.target.value) } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(buildSaveState())}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">المحاذاة الأفقية للنصوص</label>
                <select
                  value={widget.settings?.textAlign || "center"} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, textAlign: e.target.value } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                   <option value="right">يمين</option>
                   <option value="center">منتصف</option>
                   <option value="left">يسار</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">المحاذاة الرأسية للنصوص</label>
                <select
                  value={widget.settings?.textPosition || "bottom"} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, textPosition: e.target.value } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                   <option value="top">أعلى</option>
                   <option value="center">منتصف</option>
                   <option value="bottom">أسفل</option>
                </select>
              </div>

            </div>
          )}


          {widget.type === "HeroSlider" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
                <Settings className="w-4 h-4" />
                <span className="font-bold text-sm">إعدادات السلايدر</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">المحاذاة الأفقية للنصوص</label>
                <select
                  value={widget.settings?.textAlign || "center"} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, textAlign: e.target.value } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                   <option value="right">يمين</option>
                   <option value="center">منتصف</option>
                   <option value="left">يسار</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">المحاذاة الرأسية للنصوص</label>
                <select
                  value={widget.settings?.textPosition || "bottom"} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, textPosition: e.target.value } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                   <option value="top">أعلى</option>
                   <option value="center">منتصف</option>
                   <option value="bottom">أسفل</option>
                </select>
              </div>

            </div>
          )}

{widget.type === "PromoBanner" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
                <Settings className="w-4 h-4" />
                <span className="font-bold text-sm">إعدادات الشريط الإعلاني</span>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">صورة الخلفية</label>
                <ImageUploader 
                  value={widget.settings?.backgroundImage || ""} 
                  onChange={(val) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, backgroundImage: val } }
                    onUpdateWidget(newWidget)
                    onSave(buildSaveState(newWidget))
                  }}
                  className="h-24"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">تاريخ الانتهاء</label>
                <Input 
                  type="datetime-local"
                  value={widget.settings?.timerEndDate || ""} 
                  onChange={(e) => {
                    const newWidget = { ...widget, settings: { ...widget.settings, timerEndDate: e.target.value } }
                    onUpdateWidget(newWidget)
                  }}
                  onBlur={() => onSave(buildSaveState())}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
<label className="text-xs font-bold text-slate-600 block">لون الخلفية</label>
                  <Input 
                    type="color"
                    value={widget.settings?.backgroundColor || "#2453E3"} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, backgroundColor: e.target.value } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(buildSaveState())}
                    className="h-10 cursor-pointer p-1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">تعتيم الصورة (Opacity)</label>
                  <Input 
                    type="range" min="0" max="100"
                    value={widget.settings?.overlayOpacity ?? 50} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, overlayOpacity: parseInt(e.target.value) } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(buildSaveState())}
                  />
                </div>
              </div>
            </div>
          )}
          
          {widget.type === "MarqueeAlerts" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#2453E3] border-b border-border/50 pb-2">
                <Settings className="w-4 h-4" />
                <span className="font-bold text-sm">إعدادات الشريط المتحرك</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">لون الخلفية</label>
                  <Input 
                    type="color"
                    value={widget.settings?.backgroundColor || "#000000"} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, backgroundColor: e.target.value } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(buildSaveState())}
                    className="h-10 cursor-pointer p-1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">لون النص</label>
                  <Input 
                    type="color"
                    value={widget.settings?.textColor || "#ffffff"} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, textColor: e.target.value } }
                      onUpdateWidget(newWidget)
                    }}
                    onBlur={() => onSave(buildSaveState())}
                    className="h-10 cursor-pointer p-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">اتجاه الحركة</label>
                  <select
                    value={widget.settings?.scrollDirection || "right"} 
                    onChange={(e) => {
                      const newWidget = { ...widget, settings: { ...widget.settings, scrollDirection: e.target.value } }
                      onUpdateWidget(newWidget)
                      onSave(buildSaveState(newWidget))
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                     <option value="right">من اليسار لليمين</option>
                     <option value="left">من اليمين لليسار</option>
                  </select>
              </div>
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
        {["HeroSlider", "BrandSlider", "ValuesSlider", "StoreFeatures", "MarqueeAlerts", "PromoBentoGrid"].includes(widget?.type || "") && (
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
    
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" dir="rtl">
            
      <div className="flex flex-col h-full bg-white relative animate-in slide-in-from-right-4 duration-300">
        <div className="h-14 flex items-center justify-between px-6 border-b border-border/50 shrink-0 bg-slate-50">
            <div>
              <h3 className="font-bold text-sm text-slate-800">تعديل العنصر</h3>
              <p className="text-[11px] text-slate-500">تخصيص خصائص العنصر</p>
            </div>
            <button 
              onClick={() => setEditingItem(null)}
              className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[70vh]">
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
            
            
              {widget.type !== "MarqueeAlerts" && (
<div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">نص الزر (اختياري)</label>
                <Input 
                  value={editingItem.buttonText || ""} 
                  onChange={(e) => handleUpdateItem({ ...editingItem, buttonText: e.target.value })}
                  className="bg-slate-50 text-xs"
                  placeholder="مثال: تسوق الآن"
                />
              </div>
)}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">توجيه الزر / الصورة</label>
                <select
                  value={editingItem.redirectType || "custom"}
                  onChange={(e) => {
                    handleUpdateItem({ ...editingItem, redirectType: e.target.value, redirectId: "", buttonUrl: "" })
                  }}
                  className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 text-xs"
                >
                  <option value="custom">رابط مخصص</option>
                  <option value="product">منتج</option>
                  <option value="category">تصنيف</option>
                  <option value="page">صفحة</option>
                </select>
              </div>

              {(!editingItem.redirectType || editingItem.redirectType === "custom") && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">الرابط المخصص</label>
                  <Input 
                    value={editingItem.buttonUrl || ""} 
                    onChange={(e) => handleUpdateItem({ ...editingItem, buttonUrl: e.target.value })}
                    className="bg-slate-50 text-xs text-left"
                    dir="ltr"
                    placeholder="https://..."
                  />
                </div>
              )}

              {editingItem.redirectType === "category" && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">اختر التصنيف</label>
                  <select
                    value={editingItem.redirectId || ""}
                    onChange={(e) => handleUpdateItem({ ...editingItem, redirectId: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 text-xs"
                  >
                    <option value="">-- اختر --</option>
                    {categories?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {editingItem.redirectType === "page" && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">اختر الصفحة</label>
                  <select
                    value={editingItem.redirectId || ""}
                    onChange={(e) => handleUpdateItem({ ...editingItem, redirectId: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 text-xs"
                  >
                    <option value="">-- اختر --</option>
                    <option value="about">من نحن</option>
                    <option value="contact">اتصل بنا</option>
                    <option value="terms">الشروط والأحكام</option>
                    <option value="privacy">سياسة الخصوصية</option>
                  </select>
                </div>
              )}

              {editingItem.redirectType === "product" && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                  <label className="text-xs font-bold text-slate-600 block">المنتج المختار</label>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between bg-slate-50 text-xs h-10"
                    onClick={() => setProductPickerOpen(true)}
                  >
                    <span className="truncate">{editingItem.redirectId ? "تغيير المنتج" : "اختر منتجاً..."}</span>
                  </Button>
                  {productPickerOpen && (
                    <ProductPickerModal 
                      open={productPickerOpen}
                      onOpenChange={setProductPickerOpen}
                      initialSelectedIds={editingItem.redirectId ? [editingItem.redirectId] : []}
                      single={true}
                      onSave={(selected: string[]) => {
                        handleUpdateItem({ ...editingItem, redirectId: selected[0] || "" })
                      }}
                    />
                  )}
                </div>
              )}

            
            <Button onClick={() => {
              setEditingItem(null)
              onSave(true, buildSaveState())
            }} className="w-full bg-[#2453E3] hover:bg-[#1a3cb3]">
              تم وحفظ التعديلات
            </Button>
          </div>
        </div>
      </div>
          </div>
        </div>
      )}

      </div>
  )
}
