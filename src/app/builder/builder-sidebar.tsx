"use client"
import React from "react"
import { FONT_OPTIONS, FONT_MAP } from "@/app/fonts"

import { GripVertical, Eye, EyeOff, Layout, Palette, Plus, Settings2, Trash2, X, Image as ImageIcon, ShoppingBag, LayoutTemplate, ShoppingCart, ImagePlus, AlignLeft, ShieldCheck, BookOpen, Megaphone } from "lucide-react"
import { cn } from "@/lib/utils"

const WIDGET_TYPES = [
  { id: "HeroSlider", name: "شريط صور", icon: ImageIcon, desc: "صور متحركة في أعلى الصفحة" },
  { id: "PromoBanner", name: "شريط إعلاني (مؤقت)", icon: LayoutTemplate, desc: "شريط إعلاني مع عداد تنازلي وخلفية" },
  { id: "PromoBentoGrid", name: "صور إعلانية", icon: ImagePlus, desc: "شبكة صور إعلانية بأحجام متنوعة" },
  { id: "MarqueeAlerts", name: "شريط تنبيهات متحرك", icon: Megaphone, desc: "شريط نصوص متحرك بدون توقف" },
  { id: "ProductList", name: "قائمة منتجات", icon: ShoppingCart, desc: "عرض قائمة منتجات من تصنيف" },
  { id: "BrandSlider", name: "شريط الماركات", icon: ImagePlus, desc: "عرض شعارات الماركات أو الشركاء" },
  { id: "CategoryGrid", name: "شبكة التصنيفات", icon: LayoutTemplate, desc: "عرض التصنيفات بشكل شبكي مميز" },
  { id: "TextBlock", name: "نص مخصص", icon: AlignLeft, desc: "فقرة نصية لإضافة وصف أو رسالة" },
  { id: "StoreFeatures", name: "مميزات المتجر", icon: ShieldCheck, desc: "عرض مميزات المتجر مثل الشحن السريع" }
]

export function BuilderSidebar({ widgets, setWidgets, headerSettings, footerSettings, activeTab, setActiveTab, onSelectWidget, onSave , setHeaderSettings, storeName}: any) {
  
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null)
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null)
  
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx)
    e.dataTransfer.effectAllowed = "move"
    // Optional: make it slightly transparent
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = '0.5'
    }, 0)
  }

  const handleDragEnter = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === idx) return
    const newWidgets = [...sortedWidgets]
    const draggedItem = newWidgets[draggedIdx]
    newWidgets.splice(draggedIdx, 1)
    newWidgets.splice(idx, 0, draggedItem)
    
    // Update sortOrder based on new positions
    newWidgets.forEach((w, i) => w.sortOrder = i)
    setWidgets(newWidgets)
    setDraggedIdx(idx)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) e.target.style.opacity = '1'
    setDraggedIdx(null)
    // Wait a tick for state to settle, then save
    setTimeout(() => {
      onSave(true, { widgets: sortedWidgets, headerSettings, footerSettings })
    }, 0)
  }

  const toggleVisibility = (e: React.MouseEvent, widgetId: string) => {
    e.stopPropagation()
    const newWidgets = widgets.map((w: any) => w.id === widgetId ? { ...w, status: !w.status } : w)
    setWidgets(newWidgets)
    onSave(true, { widgets: newWidgets, headerSettings, footerSettings })
  }

  const deleteWidget = (e: React.MouseEvent, widgetId: string) => {
    e.stopPropagation()
    const newWidgets = widgets.filter((w: any) => w.id !== widgetId)
    setWidgets(newWidgets)
    onSave(true, { widgets: newWidgets, headerSettings, footerSettings })
  }

  // Group by type or just order (we will just order)
  const sortedWidgets = [...widgets].sort((a, b) => a.sortOrder - b.sortOrder)

  const [expanded, setExpanded] = React.useState<string | false>("content")
  const [themeExpanded, setThemeExpanded] = React.useState<string | false>("typography")
  const [selectedWidgetType, setSelectedWidgetType] = React.useState<any>(null)

  return (
    <div className="flex flex-col h-full bg-white min-h-0">
      {/* Tabs */}
      <div className="flex items-center border-b border-border/50 bg-slate-50 shrink-0">
        <button 
          onClick={() => setActiveTab("sections")}
          className={cn(
            "flex-1 py-3.5 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2",
            activeTab === "sections" ? "border-[#2453E3] text-[#2453E3]" : "border-transparent text-slate-500 hover:bg-slate-100"
          )}
        >
          <Layout className="w-4 h-4" />
          تخصيص القالب
        </button>
        <button 
          onClick={() => setActiveTab("theme")}
          className={cn(
            "flex-1 py-3.5 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2",
            activeTab === "theme" ? "border-[#2453E3] text-[#2453E3]" : "border-transparent text-slate-500 hover:bg-slate-100"
          )}
        >
          <Palette className="w-4 h-4" />
          إعدادات القالب
        </button>
      </div>

      {activeTab === "sections" ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          
          {/* Accordion: Header */}
          <div className="bg-white border border-border/50 rounded-lg overflow-hidden shadow-sm">
            <button 
              onClick={() => setExpanded(expanded === "header" ? false : "header")}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">أعلى الصفحة</span>
                <span className="text-xs text-slate-500">(قسم واحد)</span>
              </div>
              <Settings2 className={cn("w-4 h-4 text-slate-400 transition-transform", expanded === "header" && "rotate-90")} />
            </button>
            {expanded === "header" && (
                <div className="p-3 border-t border-border/50">
                  <div 
                    onClick={() => onSelectWidget("HEADER")}
                    className="bg-white border border-border/50 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-[#2453E3]/50 hover:shadow-md transition-all group"
                  >
                    <Settings2 className="w-4 h-4 text-slate-400 group-hover:text-[#2453E3]" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-[#2453E3]">إعدادات الهيدر</span>
                  </div>
                  
                  <div 
                    onClick={() => {
                      const existingMarquee = widgets.find((w: any) => w.type === "MarqueeAlerts" && w.settings?.placement !== "content");
                      if (existingMarquee) {
                        onSelectWidget(existingMarquee.id);
                      } else {
                        const newWidget = {
                          id: `new-${Date.now()}`,
                          type: "MarqueeAlerts",
                          title: "شريط التنبيهات",
                          status: true,
                          showDesktop: true,
                          showTablet: true,
                          showMobile: true,
                          sortOrder: -1,
                          settings: { placement: "header", scrollDirection: "right", backgroundColor: "#000000", textColor: "#ffffff" },
                          items: [{ id: `new-item-${Date.now()}`, title: "نص تجريبي للتنبيهات...", sortOrder: 0 }]
                        };
                        const updatedWidgets = [newWidget, ...widgets];
                        updatedWidgets.forEach((w, i) => w.sortOrder = i);
                        setWidgets(updatedWidgets);
                        onSelectWidget(newWidget.id);
                        onSave(true, { widgets: updatedWidgets, headerSettings, footerSettings });
                      }
                    }}
                    className="bg-white border border-border/50 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-[#2453E3]/50 hover:shadow-md transition-all group mt-2"
                  >
                    <AlignLeft className="w-4 h-4 text-slate-400 group-hover:text-[#2453E3]" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-[#2453E3]">شريط التنبيهات</span>
                  </div>
                </div>
              )}
          </div>

          {/* Accordion: Content */}
          <div className="bg-white border border-border/50 rounded-lg overflow-hidden shadow-sm">
            <button 
              onClick={() => setExpanded(expanded === "content" ? false : "content")}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">محتوى الصفحة</span>
                <span className="text-xs text-slate-500">({sortedWidgets.length} أقسام)</span>
              </div>
              <Settings2 className={cn("w-4 h-4 text-slate-400 transition-transform", expanded === "content" && "rotate-90")} />
            </button>
            {expanded === "content" && (
              <div className="p-3 border-t border-border/50 space-y-2">
                {sortedWidgets.map((widget: any, idx: number) => (
                  <div 
                      key={widget.id}
                      draggable={activeDragId === widget.id}
                      onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnter={(e) => handleDragEnter(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => onSelectWidget(widget.id)}
                    className={cn(
                      "group bg-white border border-border/50 rounded-lg p-1.5 flex items-center gap-2 cursor-pointer transition-all hover:border-[#2453E3]/50 hover:shadow-md",
                      !widget.status && "opacity-50 grayscale"
                    )}
                  >
                    <div 
                        className="cursor-grab text-slate-300 hover:text-slate-500 p-1"
                        onMouseDown={() => setActiveDragId(widget.id)}
                        onMouseUp={() => setActiveDragId(null)}
                        onMouseLeave={() => setActiveDragId(null)}
                        onTouchStart={() => setActiveDragId(widget.id)}
                        onTouchEnd={() => setActiveDragId(null)}
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                    <div className="flex-1 truncate">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#2453E3] transition-colors">{widget.title || widget.type}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => toggleVisibility(e, widget.id)} className="p-1.5 text-slate-400 hover:text-[#2453E3] rounded-md hover:bg-slate-100">
                        {widget.status ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={(e) => deleteWidget(e, widget.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#2453E3]/30 text-[#2453E3] font-bold py-3 mt-2 rounded-lg hover:bg-[#2453E3]/5 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      إضافة قسم جديد
                    </button>
              </div>
            )}
          </div>

          {/* Accordion: Footer */}
          <div className="bg-white border border-border/50 rounded-lg overflow-hidden shadow-sm">
            <button 
              onClick={() => setExpanded(expanded === "footer" ? false : "footer")}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">أسفل الصفحة</span>
                <span className="text-xs text-slate-500">(قسم واحد)</span>
              </div>
              <Settings2 className={cn("w-4 h-4 text-slate-400 transition-transform", expanded === "footer" && "rotate-90")} />
            </button>
            {expanded === "footer" && (
              <div className="p-3 border-t border-border/50">
                <div 
                  onClick={() => onSelectWidget("FOOTER")}
                  className="bg-white border border-border/50 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-[#2453E3]/50 hover:shadow-md transition-all group"
                >
                  <Settings2 className="w-4 h-4 text-slate-400 group-hover:text-[#2453E3]" />
                  <span className="text-sm font-bold text-slate-700 group-hover:text-[#2453E3]">التذييل</span>
                </div>
              </div>
            )}
          </div>

          {/* Add Section Modal Layer */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-border/50 bg-slate-50 shrink-0">
                  <h3 className="font-bold text-base text-slate-800">اختر القسم الذي تريد إضافته</h3>
                  <button onClick={() => { setIsAddModalOpen(false); setSelectedWidgetType(null) }} className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-slate-500 hover:text-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50">
                  {WIDGET_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedWidgetType?.id === type.id;
                    return (
                      <button 
                        key={type.id}
                        onClick={() => setSelectedWidgetType(type)}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-right group",
                          isSelected 
                            ? "border-[#2453E3] bg-[#2453E3]/5 shadow-md" 
                            : "border-border/50 bg-white hover:border-[#2453E3]/50 hover:shadow-sm"
                        )}
                      >
                        <div className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors",
                          isSelected ? "bg-[#2453E3] text-white" : "bg-slate-100 text-slate-500 group-hover:bg-[#2453E3]/10 group-hover:text-[#2453E3]"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className={cn("text-sm font-bold transition-colors", isSelected ? "text-[#2453E3]" : "text-slate-800 group-hover:text-[#2453E3]")}>{type.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{type.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="p-4 border-t border-border/50 bg-white flex justify-end gap-3 shrink-0">
                  <button 
                    onClick={() => { setIsAddModalOpen(false); setSelectedWidgetType(null) }}
                    className="px-6 py-2.5 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button 
                    disabled={!selectedWidgetType}
                    onClick={async () => {
                      if (!selectedWidgetType) return;
                      const newWidget = {
                        id: `new-${Date.now()}`,
                        type: selectedWidgetType.id,
                        title: selectedWidgetType.name,
                        status: true,
                        sortOrder: widgets.length,
                        config: {},
                        settings: selectedWidgetType.id === "MarqueeAlerts" ? { placement: "content" } : {}
                      }
                      
                      const updatedWidgets = [...widgets, newWidget]
                      setWidgets(updatedWidgets)
                      setIsAddModalOpen(false)
                      setSelectedWidgetType(null)
                      onSelectWidget(newWidget.id)
                      
                      // Auto-save the newly added section so it appears in the preview immediately
                      onSave(true, { widgets: updatedWidgets, headerSettings, footerSettings })
                    }}
                    className="px-8 py-2.5 rounded-lg font-bold text-white bg-[#2453E3] hover:bg-[#1a3cb3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    إضافة القسم
                  </button>
                </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-border/50 flex justify-end">
              <button
                onClick={() => onSave(true, { headerSettings, footerSettings, widgets })}
                className="bg-[#2453E3] text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-sm w-full"
              >
                حفظ ونشر التغييرات
              </button>
            </div>
          </div>
        )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          
          {/* Accordion: Typography */}
          <div className="bg-white border border-border/50 rounded-lg overflow-hidden shadow-sm">
            <button 
              onClick={() => setThemeExpanded(themeExpanded === "typography" ? false : "typography")}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">الخطوط (التايبوجرافي)</span>
              </div>
              <Settings2 className={cn("w-4 h-4 text-slate-400 transition-transform", themeExpanded === "typography" && "rotate-90")} />
            </button>
            {themeExpanded === "typography" && (
              <div className="p-4 border-t border-border/50 space-y-3">
                <label className="text-sm font-bold text-slate-600 block">خط المتجر</label>
                <div className="relative">
                  <select 
                    className="w-full p-3 border border-border/50 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#2453E3]/20 focus:border-[#2453E3] transition-all outline-none appearance-none"
                    value={headerSettings?.fontFamily || "ibm"}
                    onChange={(e) => {
                      const newSettings = { ...headerSettings, fontFamily: e.target.value };
                      setHeaderSettings?.(newSettings);
                    }}
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font.id} value={font.id} className={FONT_MAP[font.id]?.className}>{font.name} - {storeName || "اسم المتجر"}</option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
                <p className="text-xs text-slate-500">اختر الخط الأساسي الذي سيتم تطبيقه على جميع نصوص المتجر.</p>
              </div>
            )}
          </div>

          {/* Accordion: Product Card */}
          <div className="bg-white border border-border/50 rounded-lg overflow-hidden shadow-sm">
            <button 
              onClick={() => setThemeExpanded(themeExpanded === "product-card" ? false : "product-card")}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">كارت المنتجات</span>
              </div>
              <Settings2 className={cn("w-4 h-4 text-slate-400 transition-transform", themeExpanded === "product-card" && "rotate-90")} />
            </button>
            {themeExpanded === "product-card" && (
              <div className="p-4 border-t border-border/50 space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">الهواتف (في الصف)</label>
                    <select 
                      className="w-full p-2 border border-border/50 rounded-lg bg-slate-50 text-sm"
                      value={headerSettings?.productCard?.mobileCols || "2"}
                      onChange={(e) => {
                        const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, mobileCols: e.target.value } };
                        setHeaderSettings?.(newSettings);
                      }}
                    >
                      <option value="1">1</option>
                      <option value="1.5">1.5</option>
                      <option value="2">2</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">الشاشات (في الصف)</label>
                    <select 
                      className="w-full p-2 border border-border/50 rounded-lg bg-slate-50 text-sm"
                      value={headerSettings?.productCard?.desktopCols || "4"}
                      onChange={(e) => {
                        const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, desktopCols: e.target.value } };
                        setHeaderSettings?.(newSettings);
                      }}
                    >
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">أبعاد صورة المنتج</label>
                  <select 
                    className="w-full p-2 border border-border/50 rounded-lg bg-slate-50 text-sm"
                    value={headerSettings?.productCard?.aspectRatio || "square"}
                    onChange={(e) => {
                      const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, aspectRatio: e.target.value } };
                      setHeaderSettings?.(newSettings);
                    }}
                  >
                    <option value="square">1:1 (مربع)</option>
                    <option value="portrait">3:4 (طولي)</option>
                    <option value="landscape">4:3 (عرضي)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600">إظهار التصنيف</label>
                  <input 
                    type="checkbox"
                    checked={headerSettings?.productCard?.showCategory !== false}
                    onChange={(e) => {
                      const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, showCategory: e.target.checked } };
                      setHeaderSettings?.(newSettings);
                    }}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600">إظهار الوصف المربع</label>
                  <input 
                    type="checkbox"
                    checked={headerSettings?.productCard?.showDescription === true}
                    onChange={(e) => {
                      const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, showDescription: e.target.checked } };
                      setHeaderSettings?.(newSettings);
                    }}
                    className="w-4 h-4"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">لون السعر</label>
                  <input 
                    type="color"
                    value={headerSettings?.productCard?.priceColor || "#2453E3"}
                    onChange={(e) => {
                      const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, priceColor: e.target.value } };
                      setHeaderSettings?.(newSettings);
                    }}
                    className="w-full h-8 p-0 border-0 rounded"
                  />
                </div>

                <div className="border-t border-border/50 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600">إظهار زر "إضافة للسلة"</label>
                    <input 
                      type="checkbox"
                      checked={headerSettings?.productCard?.showAddToCart !== false}
                      onChange={(e) => {
                        const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, showAddToCart: e.target.checked } };
                        setHeaderSettings?.(newSettings);
                      }}
                      className="w-4 h-4"
                    />
                  </div>
                  
                  {headerSettings?.productCard?.showAddToCart !== false && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">نص زر الإضافة</label>
                        <input 
                          type="text"
                          value={headerSettings?.productCard?.addToCartText || "أضف للسلة"}
                          onChange={(e) => {
                            const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, addToCartText: e.target.value } };
                            setHeaderSettings?.(newSettings);
                          }}
                          className="w-full p-2 border border-border/50 rounded-lg bg-white text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">تصميم الزر</label>
                        <select 
                          className="w-full p-2 border border-border/50 rounded-lg bg-slate-50 text-sm"
                          value={headerSettings?.productCard?.addToCartStyle || "solid"}
                          onChange={(e) => {
                            const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, addToCartStyle: e.target.value } };
                            setHeaderSettings?.(newSettings);
                          }}
                        >
                          <option value="solid">ممتلئ</option>
                          <option value="outline">تحديد خارجي</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">لون الزر</label>
                        <input 
                          type="color"
                          value={headerSettings?.productCard?.addToCartColor || "#2453E3"}
                          onChange={(e) => {
                            const newSettings = { ...headerSettings, productCard: { ...headerSettings.productCard, addToCartColor: e.target.value } };
                            setHeaderSettings?.(newSettings);
                          }}
                          className="w-full h-8 p-0 border-0 rounded"
                        />
                      </div>
                    </>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
        )}
    </div>
  )
}
