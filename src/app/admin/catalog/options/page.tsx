import React from "react"
import { getGlobalOptions } from "@/features/products/global-options-actions"
import { OptionsClient } from "./options-client"

export const metadata = {
  title: "إدارة الخيارات والمتغيرات",
}

export default async function GlobalOptionsPage() {
  const options = await getGlobalOptions()
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">إدارة المتغيرات (Variants & Options)</h1>
        <p className="text-muted-foreground mt-2">
          قم بتفعيل الخيارات التي ترغب في توفيرها في متجرك (مثل الألوان والمقاسات). الخيارات المفعلة ستظهر تلقائياً عند إضافة منتج جديد.
        </p>
      </div>
      
      <OptionsClient initialOptions={options} />
    </div>
  )
}
