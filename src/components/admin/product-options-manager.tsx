"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Trash2, Plus, GripVertical, Settings, Save, AlertCircle, RefreshCw } from "lucide-react"
import { SYSTEM_OPTIONS, COMPATIBLE_DISPLAY_TYPES, getSystemOption } from "@/lib/product-options"
import { addProductOption, updateProductOption, deleteProductOption, addProductOptionValue, deleteProductOptionValue, generateVariants, getProductOptions } from "@/features/products/options-actions"
import { OptionBehavior, OptionDataType, OptionDisplayType } from "@prisma/client"
import { toast } from "sonner"

export function ProductOptionsManager({ productId, open, onOpenChange }: { productId: string, open: boolean, onOpenChange: (o: boolean) => void }) {
  const [options, setOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  // In a real implementation we would fetch existing options on mount
  // For this exercise, we assume the parent fetches and passes, or we fetch here.
  useEffect(() => {
    if (open) {
      fetchOptions()
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

  const handleAddSystemOption = async (sysOptId: string) => {
    const sysDef = getSystemOption(sysOptId)
    if (!sysDef) return
    
    setLoading(true)
    const res = await addProductOption(productId, {
      name: sysDef.nameAr || sysDef.name,
      dataType: sysDef.dataType,
      displayType: sysDef.defaultDisplayType,
      behavior: sysDef.defaultBehavior,
      systemOptionId: sysDef.id,
      isRequired: true
    })
    
    if (res.success) {
      toast.success("Option added")
      // fetchOptions()
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    const res = await generateVariants(productId)
    if (res.success) {
      toast.success(`Generated ${res.count} variants successfully`)
    } else {
      toast.error(res.error)
    }
    setGenerating(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>إدارة خيارات المنتج</DialogTitle>
          <DialogDescription>
            قم بإضافة خيارات (مثل اللون، المقاس) أو سمات (مثل الخامة، الضمان).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Add System Options */}
          <div className="flex flex-wrap gap-2">
            {SYSTEM_OPTIONS.map(opt => (
              <Button 
                key={opt.id} 
                variant="outline" 
                size="sm"
                onClick={() => handleAddSystemOption(opt.id)}
                disabled={loading}
              >
                <Plus className="w-4 h-4 ml-2" />
                {opt.nameAr || opt.name}
              </Button>
            ))}
            <Button variant="default" size="sm">
              <Plus className="w-4 h-4 ml-2" />
              خيار مخصص
            </Button>
          </div>

          <div className="bg-amber-50 text-amber-900 p-4 rounded-md flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong>الفرق بين خيارات المتغيرات والسمات:</strong>
              <ul className="list-disc list-inside mt-1">
                <li><strong>خيارات المتغيرات (Variant Option):</strong> ستولد متغيرات فعلية (مثل أحمر/صغير) لها سعر ومخزون منفصل.</li>
                <li><strong>سمات المنتج (Product Attribute):</strong> معلومات إضافية تعرض في تفاصيل المنتج ولا تولد متغيرات (مثل بلد الصنع).</li>
              </ul>
            </div>
          </div>

          {/* Option List - Placeholder for complex drag-and-drop & editing */}
          <div className="border rounded-lg p-6 text-center text-muted-foreground bg-slate-50">
            {options.length === 0 ? "لم يتم إضافة أي خيارات بعد." : "جار عرض الخيارات..."}
          </div>

          <div className="flex justify-between items-center border-t pt-4 mt-6">
            <Button 
              variant="outline" 
              className="text-primary border-primary hover:bg-primary/5"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? <RefreshCw className="w-4 h-4 ml-2 animate-spin" /> : <Settings className="w-4 h-4 ml-2" />}
              توليد المتغيرات
            </Button>
            <Button onClick={() => onOpenChange(false)}>إغلاق</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
