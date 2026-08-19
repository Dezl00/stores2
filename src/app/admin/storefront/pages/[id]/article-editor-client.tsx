"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Switch } from "@/components/ui/switch"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { ImageUploader } from "@/components/ui/image-uploader"
import { toast } from "sonner"
import { Save, ArrowRight, Loader2, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { createArticle, updateArticle, deleteArticle } from "@/features/articles/actions"
import { ConfirmModal } from "@/components/ui/confirm-modal"

export function ArticleEditorClient({ initialArticle }: { initialArticle?: any }) {
  const router = useRouter()
  const isEditing = !!initialArticle

  const [title, setTitle] = useState(initialArticle?.title || "")
  const [content, setContent] = useState(initialArticle?.content || "")
  const [imageUrl, setImageUrl] = useState(initialArticle?.imageUrl || "")
  const [seoTitle, setSeoTitle] = useState(initialArticle?.seoTitle || "")
  const [seoDesc, setSeoDesc] = useState(initialArticle?.seoDesc || "")
  const [isActive, setIsActive] = useState(initialArticle?.isActive ?? true)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  async function handleSave() {
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان المقال")
      return
    }
    if (!content.trim()) {
      toast.error("يرجى كتابة محتوى المقال")
      return
    }

    setIsSaving(true)
    try {
      const data = { title, content, imageUrl, seoTitle, seoDesc, isActive }
      
      let res
      if (isEditing) {
        res = await updateArticle(initialArticle.id, data)
      } else {
        res = await createArticle(data)
      }

      if (res?.success) {
        toast.success(isEditing ? "تم تحديث المقال بنجاح" : "تم إضافة المقال بنجاح")
        router.push("/admin/articles")
      } else {
        toast.error(res?.error || "حدث خطأ غير معروف")
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الحفظ")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!initialArticle) return
    setIsDeleting(true)
    try {
      const res = await deleteArticle(initialArticle.id)
      if (res?.success) {
        toast.success("تم حذف المقال بنجاح")
        router.push("/admin/articles")
      } else {
        toast.error(res?.error || "حدث خطأ غير معروف")
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء الحذف")
    } finally {
      setIsDeleting(false)
      setIsConfirmOpen(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link prefetch={false} href="/admin/articles">
            <Button variant="ghost" size="icon">
              <ArrowRight className="w-5 h-5 rtl-flip" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{isEditing ? "تعديل المقال" : "إضافة مقال جديد"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditing && (
            <>
              <Link prefetch={false} href={`/blog/${initialArticle?.slug}`} target="_blank">
                <Button variant="outline" className="gap-2 text-primary hover:text-primary border-primary hover:bg-primary/5">
                  <ExternalLink className="w-4 h-4" />
                  معاينة
                </Button>
              </Link>
              <Button variant="destructive" className="gap-2" onClick={() => setIsConfirmOpen(true)} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                حذف
              </Button>
              <ConfirmModal
                isOpen={isConfirmOpen}
                title="تأكيد الحذف"
                description="هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء."
                onConfirm={handleDelete}
                onCancel={() => setIsConfirmOpen(false)}
                isLoading={isDeleting}
              />
            </>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ المقال
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="bg-white p-6 rounded-xl border border-border space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">عنوان المقال <span className="text-destructive">*</span></label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="أدخل عنوان المقال..." 
                className="text-lg font-bold"
              />
            </div>
            
            <div className="space-y-2 min-w-0">
              <label className="text-sm font-medium">محتوى المقال <span className="text-destructive">*</span></label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-border space-y-4">
            <h3 className="font-bold">الإعدادات</h3>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium cursor-pointer">تفعيل المقال</label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="pt-4 border-t border-border">
              <label className="text-sm font-medium block mb-2">صورة الغلاف</label>
              <div className="aspect-video w-full">
                <ImageUploader value={imageUrl} onChange={setImageUrl} label="اختر صورة الغلاف" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-border space-y-4">
            <h3 className="font-bold">تحسين محركات البحث (SEO)</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">عنوان SEO</label>
              <Input 
                value={seoTitle} 
                onChange={e => setSeoTitle(e.target.value)} 
                placeholder={title || "عنوان المقال لمحركات البحث"} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">وصف SEO</label>
              <textarea 
                value={seoDesc} 
                onChange={e => setSeoDesc(e.target.value)} 
                placeholder="وصف مختصر للمقال يظهر في نتائج البحث..."
                className="w-full h-24 p-3 rounded-md border border-input bg-transparent text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
