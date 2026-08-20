import React from "react"
import Link from "next/link"
import sanitizeHtml from 'sanitize-html'
import { getActiveArticles } from "@/features/articles/actions"
import { ArrowLeft } from "lucide-react"

export async function LatestArticlesWidget({ widget }: { widget: any }) {
  const { articles } = await getActiveArticles(3)

  if (!articles || articles.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl opacity-50">📰</span>
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">{widget.title || "أحدث المقالات"}</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            لا توجد مقالات لعرضها. يرجى إضافة مقالات في المدونة لتظهر هنا.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {widget.settings?.title || "أحدث المقالات"}
          </h2>
          {widget.settings?.subtitle && (
            <p className="text-muted-foreground mt-2 text-lg">
              {widget.settings?.subtitle}
            </p>
          )}
        </div>
        <Link prefetch={false} 
          href="/blog"
          className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
        >
          عرض الكل
          <ArrowLeft className="w-4 h-4 rtl-flip" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: any) => (
          <Link prefetch={false} href={`/blog/${article.slug}`} key={article.id} className="group block">
            <div className="bg-white rounded-2xl border border-border overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
              <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                {article.imageUrl ? (
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-slate-100">
                    لا توجد صورة
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="text-xs text-muted-foreground mb-3">
                  {new Date(article.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <div 
                  className="text-muted-foreground text-sm line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content, { allowedTags: [], allowedAttributes: {} }).substring(0, 150) + "..." }} 
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-8 text-center sm:hidden">
        <Link prefetch={false} 
          href="/blog"
          className="inline-flex items-center justify-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
        >
          عرض كل المقالات
          <ArrowLeft className="w-4 h-4 rtl-flip" />
        </Link>
      </div>
    </div>
  )
}
