import React from "react"
import { db } from "@/lib/db"
import { resolveStoreId } from "@/lib/store-context"
import { updateReviewStatus } from "@/features/reviews/actions"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const storeId = await resolveStoreId()
  if (!storeId) {
    return <div className="p-6 text-red-500">Store ID not found</div>
  }

  const resolvedParams = await searchParams
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : 'all'

  const where: any = { storeId }
  
  if (status && status !== 'all') {
    where.status = status
  }

  const reviews = await db.productReview.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          name: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true }
          }
        }
      }
    }
  })

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 text-yellow-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className={`w-4 h-4 ${i < rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <span>الرئيسية</span>
        <span>/</span>
        <span className="text-foreground">إدارة التقييمات</span>
      </nav>

      <div className="mb-6 flex gap-2">
        <Link 
          href="?status=all"
          className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${status === 'all' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-background border border-border/50 text-foreground hover:bg-muted'}`}
        >
          الكل
        </Link>
        <Link 
          href="?status=PENDING"
          className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${status === 'PENDING' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-background border border-border/50 text-foreground hover:bg-muted'}`}
        >
          قيد المراجعة
        </Link>
        <Link 
          href="?status=APPROVED"
          className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${status === 'APPROVED' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-background border border-border/50 text-foreground hover:bg-muted'}`}
        >
          موافق
        </Link>
        <Link 
          href="?status=REJECTED"
          className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${status === 'REJECTED' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-background border border-border/50 text-foreground hover:bg-muted'}`}
        >
          مرفوض
        </Link>
      </div>

      <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
              <tr>
                <th className="p-4 font-semibold">اسم المنتج</th>
                <th className="p-4 font-semibold">اسم العميل</th>
                <th className="p-4 font-semibold">التقييم</th>
                <th className="p-4 font-semibold">التعليق</th>
                <th className="p-4 font-semibold">الحالة</th>
                <th className="p-4 font-semibold">التاريخ</th>
                <th className="p-4 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    لا توجد تقييمات مطابقة للبحث
                  </td>
                </tr>
              ) : reviews.map((review) => (
                <tr key={review.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-3">
                      {review.product.images[0]?.url ? (
                        <img 
                          src={review.product.images[0].url} 
                          alt={review.product.name} 
                          className="w-10 h-10 rounded-md object-cover border border-border/50" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-muted border border-border/50 flex items-center justify-center text-muted-foreground text-xs shrink-0">
                          صورة
                        </div>
                      )}
                      <span className="font-medium text-foreground">{review.product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle text-muted-foreground">
                    {review.userName || 'عميل مجهول'}
                  </td>
                  <td className="p-4 align-middle">
                    {renderStars(review.rating)}
                  </td>
                  <td className="p-4 align-middle text-muted-foreground max-w-xs truncate" title={review.comment || ''}>
                    {review.comment || '-'}
                  </td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex px-2 py-1 rounded-md text-[11px] font-medium border ${
                      review.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      review.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {review.status === 'APPROVED' ? 'موافق' :
                       review.status === 'REJECTED' ? 'مرفوض' : 'قيد المراجعة'}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-muted-foreground whitespace-nowrap">
                    {new Intl.DateTimeFormat('ar-EG', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }).format(review.createdAt)}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center justify-center gap-3">
                      {review.status !== 'APPROVED' && (
                        <form action={updateReviewStatus.bind(null, review.id, 'APPROVED')}>
                          <button type="submit" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">
                            موافقة
                          </button>
                        </form>
                      )}
                      {review.status !== 'REJECTED' && (
                        <form action={updateReviewStatus.bind(null, review.id, 'REJECTED')}>
                          <button type="submit" className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
                            رفض
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}