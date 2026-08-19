"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2, List, PlusCircle, Loader2 } from "lucide-react"
import { createMenu, deleteMenu } from "@/features/navigation/actions"

import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"

import { useRouter } from "next/navigation"

export function NavigationClient({ menus }: { menus: any[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [menuToDelete, setMenuToDelete] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await createMenu(formData)
    setIsSubmitting(false)
    if (res.success) {
      toast.success("تم إنشاء القائمة بنجاح")
      const form: any = document.getElementById("add-menu-form")
      if (form) form.reset()
    } else {
      toast.error(res.error || "حدث خطأ ما")
    }
  }

  async function confirmDelete() {
    if (!menuToDelete) return
    const res = await deleteMenu(menuToDelete)
    if (res.success) {
      toast.success("تم الحذف بنجاح")
    } else {
      toast.error(res.error || "حدث خطأ أثناء الحذف")
    }
    setDeleteModalOpen(false)
    setMenuToDelete(null)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>الرئيسية</span>
          <span>/</span>
          <span className="text-foreground">القوائم والروابط</span>
        </nav>
        <div className="flex items-center gap-3 lg:hidden">
           <Button onClick={() => setIsFormVisible(!isFormVisible)} className="gap-2">
             <PlusCircle className="h-4 w-4" />
             {isFormVisible ? "إخفاء النموذج" : "إنشاء قائمة"}
           </Button>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-8 relative">
        
        {/* Main Table Column (Left in RTL) */}
        <div className="flex-1 w-full">
          <div className="rounded-xl border border-border/50 bg-card shadow-sm">
            <div className="flex items-center border-b border-border/50 p-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="ابحث عن قائمة..."
                  className="h-10 w-full rounded-md border border-input bg-transparent pr-10 pl-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="border-b border-border/50 bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">اسم القائمة (المعرف)</th>
                    <th className="px-6 py-4 font-medium">عدد الروابط</th>
                    <th className="px-6 py-4 font-medium">تاريخ الإنشاء</th>
                    <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {menus.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        لا توجد قوائم مسجلة. قم بإنشاء قائمة جديدة للبدء.
                      </td>
                    </tr>
                  ) : (
                    menus.map((menu) => (
                      <tr key={menu.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <List className="h-5 w-5 text-primary/60" />
                            <span className="font-medium text-foreground">{menu.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {menu._count?.items || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(menu.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => router.push(`/admin/navigation/${menu.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setMenuToDelete(menu.id)
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
            <div className="border-b border-border/50 px-6 py-4 bg-muted/5 shrink-0">
              <h2 className="text-lg font-semibold tracking-tight">إنشاء قائمة جديدة</h2>
              <p className="text-xs text-muted-foreground mt-1">القائمة يمكن أن تحتوي على عدة روابط (مثل القائمة العلوية).</p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6" id="add-menu-form">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم القائمة (المعرف) <span className="text-red-500">*</span></label>
                  <input 
                    name="name"
                    type="text" 
                    required
                    dir="ltr"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left"
                    placeholder="header-menu"
                  />
                  <p className="text-xs text-muted-foreground">يفضل أن يكون بالإنجليزية لسهولة برمجته في القالب.</p>
                </div>

                <div className="pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full h-10 shadow-sm flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "إنشاء القائمة"}
                </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="حذف القائمة"
        description="هل أنت متأكد من حذف هذه القائمة وجميع الروابط بداخلها؟"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  )
}
