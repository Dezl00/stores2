"use client"
import React, { useState, useRef } from "react"
import { UploadCloud, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  className?: string
  label?: string
}

export function ImageUploader({ value, onChange, className, label = "اختر صورة للرفع" }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      await uploadFile(file)
    } else {
      toast.error("يرجى إفلات ملف صورة صالح")
    }
  }

  const uploadFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت.")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })
      
      const data = await res.json()
      
      if (res.ok && data.url) {
        onChange(data.url)
        toast.success("تم رفع الصورة بنجاح")
      } else {
        throw new Error(data.error || "فشل الرفع")
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء رفع الصورة")
      console.error(error)
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadFile(file)
  }

  return (
    <div 
      className={cn("space-y-2", className)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {label && <label className="text-xs font-semibold text-foreground">{label}</label>}
      
      <div className="relative group">
        <input 
          type="file"
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={handleFileSelect}
        />
        
        {value ? (
          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border/50 bg-muted/20">
            <img src={value} alt="Uploaded" className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
              <button 
                type="button"
                onClick={() => inputRef.current?.click()}
                className="bg-white text-black px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-primary hover:text-white transition-colors"
              >
                تغيير
              </button>
              <button 
                type="button"
                onClick={() => onChange("")}
                className="bg-destructive text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-destructive/90 transition-colors"
              >
                حذف
              </button>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-32 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors bg-muted/20 flex flex-col items-center justify-center text-muted-foreground disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            ) : (
              <UploadCloud className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-xs font-medium">
              {isUploading ? "جاري الرفع..." : "اضغط أو اسحب الصورة هنا للرفع"}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
