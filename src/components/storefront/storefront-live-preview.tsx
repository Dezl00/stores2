"use client"
import React, { useState, useEffect } from "react"
import { WidgetRenderer } from "./widget-renderer"

export function StorefrontLivePreview({ initialWidgets }: { initialWidgets: any[] }) {
  const [widgets, setWidgets] = useState(initialWidgets)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // In a real app, verify event.origin here
      if (event.data?.type === 'UPDATE_WIDGETS' && event.data.widgets) {
        setWidgets(event.data.widgets)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const activeWidgets = widgets.filter((w: any) => w.status)

  if (activeWidgets.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-muted-foreground bg-secondary/5">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">🍯</span>
        </div>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">أهلاً بك في متجر العسال</h2>
        <p className="mt-3 text-lg">نحن نقوم بتجهيز واجهة المتجر حالياً. يرجى العودة لاحقاً!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {activeWidgets.map((widget: any) => (
        <WidgetRenderer key={widget.id} widget={widget} />
      ))}
    </div>
  )
}