"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Loader2, Edit, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { deleteArticle, updateArticle } from "@/features/articles/actions"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"

export function ArticleActionsClient({ article }: { article: any }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [isActive, setIsActive] = useState(article.isActive)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const res = await deleteArticle(article.id)
      if (res?.success) {
        toast.success("تم حذف المقال بنجاح")
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

  async function handleToggle() {
    const newStatus = !isActive
    setIsActive(newStatus)
    setIsToggling(true)
    try {
      const res = await updateArticle(article.id, { isActive: newStatus })
      if (res?.success) {
        toast.success(`تم ${newStatus ? 'تفعيل' : 'إخفاء'} المقال`)
      } else {
        toast.error(res?.error || "حدث خطأ غير معروف")
        setIsActive(!newStatus) // revert
      }
    } catch (e) {
      toast.error("حدث خطأ")
      setIsActive(!newStatus) // revert
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-2 px-2" title={isActive ? "مفعل" : "مخفي"}>
          <Switch 
            checked={isActive} 
            onCheckedChange={handleToggle} 
            disabled={isToggling || isDeleting}
          />
        </div>

        <Link prefetch={false} href={`/blog/${article.slug}`} target="_blank">
          <Button variant="ghost" size="icon" className="hover:text-primary" title="معاينة المقال">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Link>

        <Link prefetch={false} href={`/admin/articles/${article.id}`}>
          <Button variant="ghost" size="icon" className="hover:text-primary">
            <Edit className="w-4 h-4" />
          </Button>
        </Link>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setIsConfirmOpen(true)}
          disabled={isDeleting || isToggling}
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isDeleting}
      />
    </>
  )
}
