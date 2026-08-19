"use client"
import React, { useState, useEffect } from "react"
import { BuilderHeader } from "./builder-header"
import { BuilderSidebar } from "./builder-sidebar"
import { SettingsPanel } from "./settings-panel"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

// Zid-like Architecture Context & State
export function BuilderClient({ initialWidgets, categories, themeConfig, store }: any) {
  const [widgets, setWidgets] = useState(initialWidgets)
  const [activeTab, setActiveTab] = useState<"sections" | "theme">("sections")
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null)
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop")
  const [isSaving, setIsSaving] = useState(false)
  
  // Find the currently selected widget
  const selectedWidget = widgets.find((w: any) => w.id === selectedWidgetId)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In a real app we'd save to API here
      // await saveThemeSettings(widgets)
      toast.success("تم حفظ التعديلات بنجاح.")
    } catch (e) {
      toast.error("حدث خطأ أثناء الحفظ.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F8F8] text-[#0E0217]">
      {/* 1. Top Header */}
      <BuilderHeader 
        store={store} 
        deviceMode={deviceMode} 
        setDeviceMode={setDeviceMode} 
        onSave={handleSave} 
        isSaving={isSaving} 
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* 2. Right Sidebar (Sections & Theme Settings) */}
        {/* In RTL, the right sidebar is the primary navigation like Zid */}
        <div className="w-80 flex-shrink-0 bg-white border-l border-border/50 flex flex-col z-20 shadow-sm transition-transform duration-300">
          
          {/* Main List View vs Settings Detail View */}
          {!selectedWidgetId ? (
            <BuilderSidebar 
              widgets={widgets} 
              setWidgets={setWidgets} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              onSelectWidget={setSelectedWidgetId}
            />
          ) : (
            <SettingsPanel 
              widget={selectedWidget} 
              categories={categories}
              onBack={() => setSelectedWidgetId(null)} 
              onUpdateWidget={(updatedWidget: any) => {
                setWidgets(widgets.map((w: any) => w.id === updatedWidget.id ? updatedWidget : w))
              }}
            />
          )}
        </div>

        {/* 3. Live Canvas (Iframe Preview) */}
        <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden relative items-center justify-center p-4 md:p-8">
          <div 
            className={`bg-white shadow-xl rounded-b-lg border border-border/50 transition-all duration-300 overflow-hidden ${
              deviceMode === "desktop" ? "w-full max-w-6xl h-full" : "w-[390px] h-[844px] rounded-t-3xl border-[8px] border-slate-800"
            }`}
          >
            {/* The Iframe to the store frontend preview */}
            <iframe 
              src="/?preview=true" 
              className="w-full h-full border-none"
              title="Store Preview"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
