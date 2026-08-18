import React from "react"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import type { Metadata } from "next"

import { cache } from "react"

export const revalidate = 3600

import { resolveStoreId } from "@/lib/store-context"

const getDepartment = cache(async (slug: string) => {
  return db.department.findFirst({
    where: { slug, storeId: await resolveStoreId() },
    include: {
      categories: { 
        where: { parentId: null },
        orderBy: { createdAt: "asc" } 
      },
    }
  })
})

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const [department, theme] = await Promise.all([
    getDepartment(decodeURIComponent(params.slug)),
    db.themeConfig.findUnique({ where: { storeId: await resolveStoreId() } })
  ])
  
  if (!department) return { title: "المجال غير موجود" }
  
  const storeName = theme?.storeName || "العسال";
  const ogImages = department.imageUrl 
    ? [{ url: department.imageUrl, width: 800, height: 600, alt: department.name }]
    : [];

  return {
    title: department.name,
    description: department.description || `تصفح منتجات مجال ${department.name} في ${storeName}`,
    openGraph: {
      title: `${department.name} | ${storeName}`,
      description: department.description || `تصفح منتجات مجال ${department.name} في ${storeName}`,
      url: `/department/${department.slug}`,
      type: 'website',
      siteName: storeName,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${department.name} | ${storeName}`,
      description: department.description || `تصفح منتجات مجال ${department.name} في ${storeName}`,
      images: ogImages.map(img => img.url),
    },
  }
}

export default async function DepartmentPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const departmentSlug = decodeURIComponent(params.slug);
  const department = await getDepartment(departmentSlug)

  if (!department) notFound()



  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-12">
      {/* Department Header */}
      <div className="mb-12 relative overflow-hidden rounded-3xl bg-primary p-10 sm:p-16 text-center shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary-foreground mb-4">{department.name}</h1>
          
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-primary-foreground/80 mb-4 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Link prefetch={false} href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <Link prefetch={false} href="/products" className="hover:text-white transition-colors">المنتجات</Link>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <span className="text-white font-medium">{department.name}</span>
          </nav>
        </div>
      </div>

      {department.categories && department.categories.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">أقسام {department.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {department.categories.map(child => (
              <Link prefetch={false} 
                key={child.id} 
                href={`/category/${child.slug}`}
                className="group relative rounded-2xl border border-border/50 bg-card p-4 text-center transition-all hover:border-primary/50 hover:shadow-lg"
              >
                {child.imageUrl && (
                  <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border border-border/50 bg-muted flex items-center justify-center p-4">
                    <img src={child.imageUrl} alt={child.name} className="h-full w-full object-contain transition-transform group-hover:scale-110" />
                  </div>
                )}
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{child.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
