"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2, PlusCircle, X, ExternalLink, Link as LinkIcon, MoveUp, MoveDown, Loader2, ArrowRight, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { createMenuItem, updateMenuItem, deleteMenuItem } from "@/features/navigation/actions"
import Link from "next/link"

export function MenuItemsClient({ menu }: { menu: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  function resetForm() {
    setEditingItem(null)
    const form: any = document.getElementById("add-item-form")
    if (form) form.reset()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    let res;
    if (editingItem) {
      res = await updateMenuItem(editingItem.id, menu.id, formData)
    } else {
      res = await createMenuItem(menu.id, formData)
    }
    
    setIsSubmitting(false)
    
    if (res.success) {
      toast.success(editingItem ? "تم تعديل الرابط بنجاح" : "تمت إضافة الرابط بنجاح")
      resetForm()
    } else {
      toast.error(res.error || "حدث خطأ ما")
    }
  }

  async function confirmDelete() {
    if (!itemToDelete) return
    const res = await deleteMenuItem(itemToDelete, menu.id)
    if (res.success) {
      toast.success("تم الحذف بنجاح")
    } else {
      toast.error(res.error || "حدث خطأ أثناء الحذف")
    }
    setDeleteModalOpen(false)
    setItemToDelete(null)
  }

  // Populate form when editingItem changes
  React.useEffect(() => {
    if (editingItem) {
      const form: any = document.getElementById("add-item-form")
      if (form) {
        form.label.value = editingItem.label || ""
        form.url.value = editingItem.url || ""
        form.sortOrder.value = editingItem.sortOrder || 0
      }
      setIsFormVisible(true)
    }
  }, [editingItem])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Link prefetch={false} href="/admin/navigation" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowRight className="h-4 w-4 rtl-flip" /> العودة للقوائم
            </Link>
          </div>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <span>الرئيسية</span>
            <span>/</span>
            <span>القوائم</span>
            <span>/</span>
            <span className="text-foreground">روابط {menu.name}</span>
          </nav>
        </div>
        <div className="flex items-center gap-3 lg:hidden">
           <Button onClick={() => setIsFormVisible(!isFormVisible)} className="gap-2">
             <PlusCircle className="h-4 w-4" />
             {isFormVisible ? "إخفاء النموذج" : "إضافة رابط"}
           </Button>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-8 relative">
        
        {/* Main Table Column (Left in RTL) */}
        <div className="flex-1 w-full">
          <div className="rounded-xl border border-border/50 bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="border-b border-border/50 bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium w-12"></th>
                    <th className="px-6 py-4 font-medium">العنوان (الاسم)</th>
                    <th className="px-6 py-4 font-medium">الرابط الموجه إليه</th>
                    <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {(!menu.items || menu.items.length === 0) ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        لا توجد روابط مسجلة في هذه القائمة. قم بإضافة رابط من القائمة الجانبية.
                      </td>
                    </tr>
                  ) : (
                    menu.items.map((item: any) => (
                      <tr key={item.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-6 py-4 text-center">
                          <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <LinkIcon className="h-4 w-4 text-primary/60" />
                            <span className="font-medium text-foreground">{item.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground" dir="ltr">
                          {item.url}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => setEditingItem(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setItemToDelete(item.id)
                                setDeleteModalOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sticky Form Column (Right in RTL) */}
        <div className={`w-full lg:w-[400px] shrink-0 lg:sticky lg:top-4 order-first transition-all duration-300 ${!isFormVisible ? 'hidden lg:block' : 'block'}`}>
          <div className="rounded-xl border border-border/50 bg-background shadow-sm overflow-hidden flex flex-col">
            <div className="border-b border-border/50 px-6 py-4 bg-muted/5 shrink-0 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{editingItem ? "تعديل الرابط" : "إضافة رابط جديد"}</h2>
                <p className="text-xs text-muted-foreground mt-1">أضف روابط لأقسام أو صفحات المتجر.</p>
              </div>
              {editingItem && (
                <Button variant="ghost" size="icon" onClick={resetForm} className="h-8 w-8 shrink-0 text-muted-foreground">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5" id="add-item-form">
                <div className="space-y-2">
                  <label className="text-sm font-medium">العنوان <span className="text-red-500">*</span></label>
                  <input 
                    name="label"
                    type="text" 
                    required
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="مثال: من نحن، تواصل معنا"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الرابط الوجهة <span className="text-red-500">*</span></label>
                  <input 
                    name="url"
                    type="text" 
                    required
                    dir="ltr"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left"
                    placeholder="/about-us"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">الترتيب</label>
                  <input 
                    name="sortOrder"
                    type="number"
                    defaultValue={0}
                    dir="ltr"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left"
                  />
                </div>

                <div className="pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full h-10 shadow-sm flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingItem ? "تحديث الرابط" : "إضافة الرابط")}
                </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="حذف الرابط"
        description="هل أنت متأكد من حذف هذا الرابط من القائمة؟"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  )
}
