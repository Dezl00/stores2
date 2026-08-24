import { getActiveArticles } from "@/features/articles/actions"
import sanitizeHtml from 'sanitize-html'
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const revalidate = 3600 // Cache for 1 hour

export const metadata = {
  title: "الأدلة والنصائح",
  description: "أحدث المقالات والأخبار عن العسل ومنتجاتنا",
}

export default async function BlogPage() {
  const { articles } = await getActiveArticles()

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 pt-4 pb-12 md:pt-8 md:pb-20 min-h-screen max-w-7xl">
      {/* Page Header */}
      <div className="mb-12 relative overflow-hidden rounded-3xl bg-primary p-10 sm:p-16 text-center shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary-foreground mb-4">الأدلة والنصائح</h1>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-primary-foreground/80 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Link prefetch={false} href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 rtl-flip opacity-50" />
            <span className="text-white font-medium">الأدلة والنصائح</span>
          </nav>
        </div>
      </div>

      {!articles || articles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border">
          <p className="text-muted-foreground text-lg">لا توجد مقالات منشورة حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article: any) => (
            <Link prefetch={false} href={`/blog/${article.slug}`} key={article.id} className="group block h-full">
              <div className="bg-white rounded-2xl border border-border overflow-hidden transition-all hover:shadow-xl hover:border-primary/30 h-full flex flex-col">
                <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden shrink-0">
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
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-sm text-muted-foreground mb-3">
                    {new Date(article.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <div 
                    className="prose prose-slate prose-sm text-muted-foreground line-clamp-3 mb-6 flex-1 overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content, { allowedTags: [], allowedAttributes: {} }).substring(0, 150) + "..." }} 
                  />
                  <div className="inline-flex items-center gap-2 text-primary font-medium mt-auto">
                    قراءة المزيد
                    <ArrowLeft className="w-4 h-4 rtl-flip transition-transform group-hover:-translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
