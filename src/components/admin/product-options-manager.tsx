"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Trash2, Plus, GripVertical, Settings, Save, AlertCircle, RefreshCw, X } from "lucide-react"
import { addProductOption, updateProductOption, deleteProductOption, addProductOptionValue, deleteProductOptionValue, generateVariants, getProductOptions } from "@/features/products/options-actions"
import { getActiveGlobalOptions } from "@/features/products/global-options-actions"
import { OptionBehavior, OptionDataType, OptionDisplayType } from "@prisma/client"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function ProductOptionsManager({ productId, open, onOpenChange, inline = false }: { productId: string, open?: boolean, onOpenChange?: (o: boolean) => void, inline?: boolean }) {
  const [options, setOptions] = useState<any[]>([])
  const [globalOptions, setGlobalOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (open) {
      fetchOptions()
      fetchGlobalOptions()
    }
  }, [open, productId])

  const fetchOptions = async () => {
    setLoading(true)
    try {
      const res = await getProductOptions(productId)
      if (res.success) {
        setOptions(res.options || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchGlobalOptions = async () => {
    try {
      const res = await getActiveGlobalOptions()
      setGlobalOptions(res)
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddGlobalOption = async (globalOpt: any) => {
    setLoading(true)
    try {
      const res = await addProductOption(productId, {
        name: globalOpt.name,
        dataType: globalOpt.dataType,
        displayType: globalOpt.displayType,
        behavior: globalOpt.behavior,
        systemOptionId: globalOpt.id,
        isRequired: true
      })
      
      if (res.success) {
        toast.success("تم إضافة الخيار")
        await fetchOptions()
      } else {
        toast.error(res.error)
      }
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOption = async (optId: string) => {
    setLoading(true)
    const res = await deleteProductOption(optId)
    if (res.success) {
      toast.success("تم الحذف")
      await fetchOptions()
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }

  const handleToggleValue = async (productOptId: string, globalVal: any, isCurrentlySelected: boolean, currentProductValId?: string) => {
    setLoading(true)
    try {
      if (isCurrentlySelected && currentProductValId) {
        await deleteProductOptionValue(currentProductValId)
      } else {
        await addProductOptionValue(productOptId, { label: globalVal.label, value: globalVal.value })
      }
      await fetchOptions()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    const res = await generateVariants(productId)
    if (res.success) {
      toast.success(`تم توليد ${res.count} متغير بنجاح`)
      if (onOpenChange) onOpenChange(false)
    } else {
      toast.error(res.error)
    }
    setGenerating(false)
  }

  // Filter out global options that have already been added
  const availableGlobalOptions = globalOptions.filter(gOpt => !options.some(o => o.systemOptionId === gOpt.id || o.name === gOpt.name))

  const content = (
    <div className="space-y-6 py-4" dir="rtl">
      {!inline && (
        <div className="mb-4">
          <h2 className="text-xl font-bold">إدارة المتغيرات والخيارات للمنتج</h2>
          <p className="text-muted-foreground text-sm mt-1">
            اختر من المتغيرات العامة المفعلة، وحدد القيم المتاحة لهذا المنتج تحديداً لتوليد المتغيرات.
          </p>
        </div>
      )}

      {/* Global Options */}
      {availableGlobalOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableGlobalOptions.map(opt => (
            <Button 
              key={opt.id} 
              variant="outline" 
              size="sm"
              className="bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary"
              onClick={(e) => { e.preventDefault(); handleAddGlobalOption(opt); }}
              disabled={loading}
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة: {opt.name === 'Color' ? 'اللون' : opt.name === 'Size' ? 'المقاس' : opt.name}
            </Button>
          ))}
        </div>
      )}

      {/* Added Options List */}
      <div className="space-y-4">
        {options.map((opt, index) => {
          // Find matching global option to show all possible values
          const globalOpt = globalOptions.find(g => g.id === opt.systemOptionId || g.name === opt.name)
          
          return (
            <div key={opt.id} className="border border-border/50 rounded-xl bg-card shadow-sm overflow-hidden">
              <div className="bg-muted/30 p-3 flex items-center justify-between border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold">{index + 1}</span>
                  <h4 className="font-bold">{opt.name === 'Color' ? 'اللون' : opt.name === 'Size' ? 'المقاس' : opt.name}</h4>
                  <Badge variant="outline" className="text-[10px] h-5">{opt.behavior === 'VARIANT' ? 'متغير' : 'سمة وصفية'}</Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-8 px-2" onClick={(e) => { e.preventDefault(); handleDeleteOption(opt.id); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-3">حدد القيم المتوفرة في هذا المنتج تحديداً:</p>
                <div className="flex flex-wrap gap-2">
                  {globalOpt ? (
                    globalOpt.values.map((gVal: any) => {
                      const productVal = opt.values?.find((v: any) => v.label === gVal.label)
                      const isSelected = !!productVal
                      
                      return (
                        <button
                          key={gVal.id}
                          disabled={loading}
                          onClick={(e) => { e.preventDefault(); handleToggleValue(opt.id, gVal, isSelected, productVal?.id); }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${isSelected ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background text-muted-foreground border-border/50 hover:bg-muted'}`}
                        >
                          {opt.dataType === 'COLOR' && (
                            <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: gVal.value }} />
                          )}
                          {gVal.label}
                        </button>
                      )
                    })
                  ) : (
                    // Fallback if no global option matches
                    opt.values?.map((v: any) => (
                      <Badge key={v.id} variant="default">{v.label}</Badge>
                    ))
                  )}
                  
                  {globalOpt && globalOpt.values.length === 0 && (
                    <span className="text-xs text-red-500">لم يتم إعداد أي قيم عامة لهذا الخيار في لوحة التحكم.</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        
        {options.length === 0 && (
          <div className="text-center py-12 bg-slate-50 border border-dashed rounded-xl">
            <Settings className="w-8 h-8 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">لم تقم بتحديد أي خيارات أو متغيرات لهذا المنتج.</p>
            <p className="text-xs text-muted-foreground mt-1">اضغط على الخيارات العلوية لإضافتها.</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center border-t border-border/50 pt-4 mt-6">
        <Button 
          className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          onClick={(e) => { e.preventDefault(); handleGenerate(); }}
          disabled={generating || options.filter(o => o.behavior === 'VARIANT').length === 0}
        >
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          توليد المتغيرات وتحديث الأسعار
        </Button>
        {!inline && (
          <Button variant="ghost" onClick={(e) => { e.preventDefault(); onOpenChange?.(false); }}>إغلاق</Button>
        )}
      </div>
    </div>
  )

  if (inline) {
    return content
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="hidden">إدارة المتغيرات</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
