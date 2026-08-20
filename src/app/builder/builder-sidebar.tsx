"use client"
import React from "react"
import { GripVertical, Eye, EyeOff, Layout, Palette, Plus, Settings2, Trash2, X, Image as ImageIcon, ShoppingBag, LayoutTemplate, ShoppingCart, ImagePlus, AlignLeft, ShieldCheck, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const WIDGET_TYPES = [
  { id: "HeroSlider", name: "بنر متحرك", icon: ImageIcon, desc: "صور متحركة في أعلى الصفحة" },
  { id: "FeaturedProducts", name: "منتجات مختارة", icon: ShoppingBag, desc: "عرض أبرز المنتجات للمبيعات" },
  { id: "BannerGrid", name: "شبكة بانرات", icon: LayoutTemplate, desc: "بانرات صور بشكل شبكي" },
  { id: "ProductList", name: "قائمة منتجات", icon: ShoppingCart, desc: "عرض قائمة منتجات من تصنيف" },
  { id: "BrandSlider", name: "شريط الماركات", icon: ImagePlus, desc: "عرض شعارات الماركات أو الشركاء" },
  { id: "CategoryGrid", name: "شبكة التصنيفات", icon: LayoutTemplate, desc: "عرض التصنيفات بشكل شبكي مميز" },
  { id: "TextBlock", name: "نص مخصص", icon: AlignLeft, desc: "فقرة نصية لإضافة وصف أو رسالة" },
  { id: "StoreFeatures", name: "مميزات المتجر", icon: ShieldCheck, desc: "عرض مميزات المتجر مثل الشحن السريع" }
]

export function BuilderSidebar({ widgets, setWidgets, activeTab, setActiveTab, onSelectWidget }: any) {
  
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  
  const toggleVisibility = (e: React.MouseEvent, widgetId: string) => {
    e.stopPropagation()
    setWidgets(widgets.map((w: any) => w.id === widgetId ? { ...w, status: !w.status } : w))
  }

  const deleteWidget = (e: React.MouseEvent, widgetId: string) => {
    e.stopPropagation()
    setWidgets(widgets.filter((w: any) => w.id !== widgetId))
  }

  // Group by type or just order (we will just order)
  const sortedWidgets = [...widgets].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="flex flex-col h-full bg-white">
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
        <div className="flex-1 overflow-y-auto flex flex-col p-4 space-y-4">
          
          {/* Static Header Section */}
          <div 
            onClick={() => onSelectWidget("HEADER")}
            className="bg-slate-50 border border-border/50 rounded-lg p-3 flex items-center gap-3 shadow-sm cursor-pointer hover:border-[#2453E3]/50 hover:shadow-md transition-all"
          >
            <Settings2 className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">الترويسة (Header)</span>
          </div>

          <div className="flex-1 space-y-2">
            {sortedWidgets.map((widget: any) => (
              <div 
                key={widget.id}
                onClick={() => onSelectWidget(widget.id)}
                className={cn(
                  "group bg-white border border-border/50 rounded-lg p-2.5 flex items-center gap-3 cursor-pointer transition-all shadow-sm hover:border-[#2453E3]/50 hover:shadow-md",
                  !widget.status && "opacity-50 grayscale"
                )}
              >
                <div className="cursor-grab text-slate-300 hover:text-slate-500">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1 truncate">
                  <p className="text-sm font-bold text-slate-800 truncate">{widget.title || widget.type}</p>
                  <p className="text-xs text-slate-500 truncate">{widget.type}</p>
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
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#2453E3]/30 text-[#2453E3] font-bold py-3 rounded-lg hover:bg-[#2453E3]/5 transition-colors"
          >
            <Plus className="w-5 h-5" />
            إضافة قسم جديد
          </button>

          {/* Static Footer Section */}
          <div 
            onClick={() => onSelectWidget("FOOTER")}
            className="bg-slate-50 border border-border/50 rounded-lg p-3 flex items-center gap-3 shadow-sm mt-auto cursor-pointer hover:border-[#2453E3]/50 hover:shadow-md transition-all"
          >
            <Settings2 className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">التذييل (Footer)</span>
          </div>

          {/* Add Section Modal Layer */}
          {isAddModalOpen && (
            <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom-8 duration-300">
              <div className="flex items-center justify-between p-4 border-b border-border/50 bg-slate-50 shrink-0">
                <h3 className="font-bold text-sm text-slate-800">إضافة قسم جديد</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-slate-500 hover:text-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {WIDGET_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button 
                      key={type.id}
                      onClick={() => {
                        const newWidget = {
                          id: `new-${Date.now()}`,
                          type: type.id,
                          title: type.name,
                          status: true,
                          sortOrder: widgets.length,
                          config: {}
                        }
                        setWidgets([...widgets, newWidget])
                        setIsAddModalOpen(false)
                        onSelectWidget(newWidget.id)
                      }}
                      className="w-full flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-white hover:border-[#2453E3]/50 hover:bg-[#2453E3]/5 transition-all text-right group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 group-hover:bg-[#2453E3]/10 group-hover:text-[#2453E3] transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#2453E3] transition-colors">{type.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">{type.desc}</p>
                      </div>
                      <Plus className="w-4 h-4 text-slate-300 group-hover:text-[#2453E3] mt-3" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center flex-col text-slate-400 text-sm">
          <Palette className="w-12 h-12 mb-4 opacity-20" />
          <p>إعدادات الثيم العامة هنا</p>
          <p className="(الألوان، الخطوط، الأيقونة)">(الألوان، الخطوط، الأيقونة)</p>
        </div>
      )}
    </div>
  )
}
