"use client"
import React, { useState, useEffect } from "react"
import { BuilderHeader } from "./builder-header"
import { BuilderSidebar } from "./builder-sidebar"
import { SettingsPanel } from "./settings-panel"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { saveThemeSettings } from "@/features/widget-builder/actions"

// Zid-like Architecture Context & State
export function BuilderClient({ initialWidgets, categories, themeConfig, store, previewUrl }: any) {
  const [widgets, setWidgets] = useState(initialWidgets)
  const [headerSettings, setHeaderSettings] = useState(themeConfig?.headerSettings || {})
  const [footerSettings, setFooterSettings] = useState(themeConfig?.footerSettings || {})
  const [activeTab, setActiveTab] = useState<"sections" | "theme">("sections")
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null)
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop")
  const [isSaving, setIsSaving] = useState(false)
  
  // Use refs to always have the latest state for auto-saving without waiting for re-renders
  const stateRef = React.useRef({ widgets, headerSettings, footerSettings })
  useEffect(() => {
    stateRef.current = { widgets, headerSettings, footerSettings }
  }, [widgets, headerSettings, footerSettings])

  // Find the currently selected widget
  const selectedWidget = selectedWidgetId === "HEADER" 
    ? { id: "HEADER", type: "Header", title: "الترويسة", config: headerSettings }
    : selectedWidgetId === "FOOTER"
    ? { id: "FOOTER", type: "Footer", title: "التذييل", config: footerSettings }
    : widgets.find((w: any) => w.id === selectedWidgetId)

  const handleSave = async (silent = false, customState?: any) => {
    setIsSaving(true)
    try {
      const stateToSave = customState || {
        widgets: stateRef.current.widgets,
        headerSettings: stateRef.current.headerSettings,
        footerSettings: stateRef.current.footerSettings
      }
      const res = await saveThemeSettings(stateToSave)
      
      if (res.success) {
        if (!silent) toast.success("تم حفظ الواجهة بنجاح.")
        
        // Reload iframe to reflect the actual DB changes
        const iframe = document.getElementById("store-preview-iframe") as HTMLIFrameElement
        if (iframe && iframe.contentWindow) {
          const url = new URL(iframe.src)
          url.searchParams.set("t", Date.now().toString())
          iframe.src = url.toString()
        }
      } else {
        if (!silent) toast.error(res.error || "حدث خطأ أثناء الحفظ.")
      }
    } catch (e) {
      if (!silent) toast.error("حدث خطأ أثناء الحفظ.")
    } finally {
      setIsSaving(false)
    }
  }

  // Send updates to the iframe for live preview
  useEffect(() => {
    const iframe = document.getElementById("store-preview-iframe") as HTMLIFrameElement
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'UPDATE_WIDGETS', widgets }, '*')
    }
  }, [widgets])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F8F8] text-[#0E0217]">
      {/* 1. Top Header */}
      <BuilderHeader 
        store={store} 
        deviceMode={deviceMode} 
        setDeviceMode={setDeviceMode} 
        onSave={handleSave} 
        isSaving={isSaving} 
        previewUrl={previewUrl}
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
              headerSettings={headerSettings}
              footerSettings={footerSettings}
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              onSelectWidget={setSelectedWidgetId}
              onSave={handleSave}
            />
          ) : (
            <SettingsPanel 
              widget={selectedWidget} 
              categories={categories}
              onBack={() => setSelectedWidgetId(null)} 
              onSave={handleSave}
              onUpdateWidget={(updatedWidget: any) => {
                if (updatedWidget.id === "HEADER") {
                  setHeaderSettings(updatedWidget.config || {})
                } else if (updatedWidget.id === "FOOTER") {
                  setFooterSettings(updatedWidget.config || {})
                } else {
                  setWidgets(widgets.map((w: any) => w.id === updatedWidget.id ? updatedWidget : w))
                }
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
              id="store-preview-iframe"
              src={previewUrl || "/?preview=true"}
              className="w-full h-full border-none bg-white"
              title="Store Preview"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
