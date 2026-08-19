"use client"
import React from "react"
import { GripVertical, Eye, EyeOff, Layout, Palette, Plus, Settings2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function BuilderSidebar({ widgets, setWidgets, activeTab, setActiveTab, onSelectWidget }: any) {
  
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
            onClick={() => {
              const newWidget = {
                id: `new-${Date.now()}`,
                type: "ProductList",
                title: "قسم منتجات جديد",
                status: true,
                sortOrder: widgets.length,
                config: {}
              }
              setWidgets([...widgets, newWidget])
              onSelectWidget(newWidget.id)
            }}
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
