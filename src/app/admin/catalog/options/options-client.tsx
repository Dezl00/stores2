"use client"

import React, { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toggleGlobalOption, addGlobalOptionValue, deleteGlobalOptionValue } from "@/features/products/global-options-actions"
import { toast } from "sonner"
import { Plus, Trash2, Settings, Loader2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function OptionsClient({ initialOptions }: { initialOptions: any[] }) {
  const [options, setOptions] = useState(initialOptions)
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})
  const [activeConfigOption, setActiveConfigOption] = useState<string | null>(null)
  
  // For adding new value
  const [newLabel, setNewLabel] = useState("")
  const [newValue, setNewValue] = useState("")

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      setLoadingMap(prev => ({ ...prev, [id]: true }))
      const res = await toggleGlobalOption(id, !currentStatus)
      if (res.success) {
        setOptions(options.map(o => o.id === id ? { ...o, isActive: !currentStatus } : o))
        toast.success(currentStatus ? "تم تعطيل الخيار" : "تم تفعيل الخيار بنجاح")
      }
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ")
    } finally {
      setLoadingMap(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleAddValue = async (optionId: string, optionType: string) => {
    if (!newLabel || !newValue) {
      toast.error("يرجى إدخال الاسم والقيمة")
      return
    }
    
    try {
      setLoadingMap(prev => ({ ...prev, ['add_'+optionId]: true }))
      const res = await addGlobalOptionValue(optionId, newLabel, newValue)
      if (res.success) {
        toast.success("تم إضافة القيمة بنجاح")
        setOptions(options.map(o => {
          if (o.id === optionId) {
            return { ...o, values: [...o.values, res.value] }
          }
          return o
        }))
        setNewLabel("")
        setNewValue(optionType === 'COLOR' ? "#000000" : "")
      }
    } catch (e: any) {
      toast.error("حدث خطأ أثناء الإضافة")
    } finally {
      setLoadingMap(prev => ({ ...prev, ['add_'+optionId]: false }))
    }
  }

  const handleDeleteValue = async (valueId: string, optionId: string) => {
    try {
      setLoadingMap(prev => ({ ...prev, ['del_'+valueId]: true }))
      await deleteGlobalOptionValue(valueId)
      toast.success("تم الحذف بنجاح")
      setOptions(options.map(o => {
        if (o.id === optionId) {
          return { ...o, values: o.values.filter((v: any) => v.id !== valueId) }
        }
        return o
      }))
    } catch (e: any) {
      toast.error("حدث خطأ")
    } finally {
      setLoadingMap(prev => ({ ...prev, ['del_'+valueId]: false }))
    }
  }

  // Helper for placeholder based on datatype/name
  const getLabelPlaceholder = (name: string, dataType: string) => {
    switch (name.toLowerCase()) {
      case 'color': return "مثال: أحمر"
      case 'size': return "مثال: كبير (L)"
      case 'material': return "مثال: قطن 100%"
      case 'weight': return "مثال: 500 جم"
      case 'volume': return "مثال: 50 مل"
      case 'flavor': return "مثال: فانيلا"
      case 'style': return "مثال: كلاسيك"
      default: return "مثال: قيمة جديدة"
    }
  }

  const getValuePlaceholder = (name: string, dataType: string) => {
    switch (name.toLowerCase()) {
      case 'color': return "#FF0000"
      case 'size': return "L"
      case 'material': return "Cotton"
      case 'weight': return "500g"
      case 'volume': return "50ml"
      case 'flavor': return "Vanilla"
      case 'style': return "Classic"
      default: return "New Value"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {options.map(option => (
        <div key={option.id} className={`bg-card border rounded-xl overflow-hidden shadow-sm transition-all ${option.isActive ? 'border-primary ring-1 ring-primary/20' : 'border-border/50 opacity-80'}`}>
          <div className="p-5 border-b border-border/10 flex items-center justify-between bg-muted/20">
            <div>
              <h3 className="font-bold text-lg">
                {option.name === 'Color' ? 'اللون' : 
                 option.name === 'Size' ? 'المقاس' : 
                 option.name === 'Material' ? 'الخامة' : 
                 option.name === 'Weight' ? 'الوزن' : 
                 option.name === 'Volume' ? 'الحجم' : 
                 option.name === 'Style' ? 'التصميم' : 
                 option.name === 'Capacity' ? 'السعة' :
                 option.name === 'Flavor' ? 'النكهة' :
                 option.name === 'Scent' ? 'الرائحة' :
                 option.name === 'Shape' ? 'الشكل' :
                 option.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {option.behavior === 'VARIANT' ? 'يُستخدم لتوليد متغيرات' : 'خاصية وصفية فقط'}
              </p>
            </div>
            <Switch 
              checked={option.isActive} 
              onCheckedChange={() => handleToggle(option.id, option.isActive)}
              disabled={loadingMap[option.id]}
            />
          </div>
          
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {option.values.map((v: any) => (
                <Badge key={v.id} variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5">
                  {option.dataType === 'COLOR' && (
                    <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: v.value }} />
                  )}
                  <span>{v.label}</span>
                  {activeConfigOption === option.id && (
                    <button onClick={() => handleDeleteValue(v.id, option.id)} className="text-muted-foreground hover:text-red-500 mr-1">
                      {loadingMap['del_'+v.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                    </button>
                  )}
                </Badge>
              ))}
              {option.values.length === 0 && <span className="text-xs text-muted-foreground">لا توجد قيم مسجلة</span>}
            </div>

            {activeConfigOption === option.id ? (
              <div className="pt-4 border-t border-border/50 space-y-3 mt-4 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">الاسم الظاهر (عربي)</label>
                    <Input placeholder={getLabelPlaceholder(option.name, option.dataType)} value={newLabel} onChange={e => setNewLabel(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">{option.dataType === 'COLOR' ? 'اللون (كود HEX)' : 'القيمة الفعلية'}</label>
                    {option.dataType === 'COLOR' ? (
                      <div className="flex items-center gap-2">
                        <Input type="color" value={newValue || '#000000'} onChange={e => setNewValue(e.target.value)} className="h-8 w-12 p-0 border-0 cursor-pointer" />
                        <Input value={newValue || '#000000'} onChange={e => setNewValue(e.target.value)} className="h-8 text-sm flex-1" dir="ltr" />
                      </div>
                    ) : (
                      <Input placeholder={getValuePlaceholder(option.name, option.dataType)} value={newValue} onChange={e => setNewValue(e.target.value)} className="h-8 text-sm" />
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAddValue(option.id, option.dataType)} disabled={loadingMap['add_'+option.id]} className="flex-1">
                    {loadingMap['add_'+option.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إضافة القيمة'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setActiveConfigOption(null)}>إلغاء</Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2 text-muted-foreground hover:text-primary gap-2"
                onClick={() => {
                  setActiveConfigOption(option.id);
                  setNewLabel("");
                  setNewValue(option.dataType === 'COLOR' ? "#000000" : "");
                }}
              >
                <Settings className="w-4 h-4" /> تخصيص القيم
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
