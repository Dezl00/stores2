"use client"
import React from "react"
import { Monitor, Smartphone, ChevronDown, Check, Save, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function BuilderHeader({ store, deviceMode, setDeviceMode, onSave, isSaving, previewUrl }: any) {
  const publicUrl = previewUrl ? previewUrl.replace('?preview=true', '') : '/'
  
  return (
    <header className="h-16 bg-[#2453E3] text-white flex items-center justify-between px-4 md:px-6 shrink-0 shadow-md relative z-30">
      
      {/* Right: Store Identity & Back Button */}
      <div className="flex items-center gap-4">
        <Link prefetch={false} href="/admin/storefront/theme" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          <ArrowRight className="w-4 h-4 rtl-flip" />
        </Link>
        <div className="flex items-center gap-3">
          {store?.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="h-8 w-auto brightness-0 invert" />
          ) : (
            <span className="font-bold text-lg">{store?.name || "المتجر"}</span>
          )}
        </div>
      </div>

      {/* Center: Device Toggle & Page Selector */}
      <div className="hidden md:flex flex-1 justify-center items-center gap-8">
        {/* Page Selector (Mocked like Zid) */}
        <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-md text-sm transition-colors border border-white/10">
          <span>الصفحة الرئيسية</span>
          <ChevronDown className="w-4 h-4 text-white/70" />
        </button>

        {/* Device Toggles */}
        <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/10">
          <button 
            onClick={() => setDeviceMode("desktop")}
            className={`p-1.5 rounded-md transition-all ${deviceMode === "desktop" ? "bg-white text-[#2453E3] shadow-sm" : "text-white/70 hover:text-white"}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setDeviceMode("mobile")}
            className={`p-1.5 rounded-md transition-all ${deviceMode === "mobile" ? "bg-white text-[#2453E3] shadow-sm" : "text-white/70 hover:text-white"}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Left: Actions */}
      <div className="flex items-center gap-3">
        <Link prefetch={false} href={publicUrl} target="_blank" className="hidden sm:flex items-center gap-2 text-sm text-white/90 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md border border-white/10">
          <span>عرض المتجر</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <Button 
          variant="outline" 
          className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white h-9 hidden sm:flex"
          onClick={onSave}
          disabled={isSaving}
        >
          حفظ كمسودة
        </Button>
        <Button 
          className="bg-white text-[#2453E3] hover:bg-white/90 h-9 font-bold"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "جاري الحفظ..." : "تحديث ونشر"}
        </Button>
      </div>
      
    </header>
  )
}
