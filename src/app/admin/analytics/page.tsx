import { db as prisma } from '@/lib/db'
import { AnalyticsClient } from './analytics-client'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { resolveStoreId } from "@/lib/store-context"

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const session = await auth()
  if (session?.user?.role !== 'STORE_OWNER' && session?.user?.role !== 'MANAGER') redirect('/admin')
  const storeId = await resolveStoreId()

  const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30))
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0))
  const yesterdayStart = new Date(new Date().setHours(0, 0, 0, 0))
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  // We will filter out US visits in JS or DB. DB is better.
  const pageVisits = await prisma.pageVisit.findMany({
    where: { 
      storeId,
      createdAt: { gte: thirtyDaysAgo },
      country: { notIn: ['US', 'USA', 'United States', 'United States of America', 'us'] }
    },
    select: { createdAt: true, country: true, city: true, path: true }
  })
  
  const productViews = await prisma.productView.findMany({
    where: { 
      product: { storeId },
      createdAt: { gte: thirtyDaysAgo },
      // Optional: if product views had country, we'd filter here too, but they don't
    },
    include: { product: { select: { id: true, name: true, images: { take: 1, select: { url: true } } } } }
  })

  // Group by day for charts
  const visitsByDay = pageVisits.reduce((acc: any, v) => {
    const d = v.createdAt.toISOString().split('T')[0]
    acc[d] = (acc[d] || 0) + 1
    return acc
  }, {})

  const viewsByDay = productViews.reduce((acc: any, v) => {
    const d = v.createdAt.toISOString().split('T')[0]
    acc[d] = (acc[d] || 0) + 1
    return acc
  }, {})

  const allDates = Array.from(new Set([...Object.keys(visitsByDay), ...Object.keys(viewsByDay)])).sort()
  const chartData = allDates.map(date => ({
    date,
    visits: visitsByDay[date] || 0,
    views: viewsByDay[date] || 0
  }))

  // Today and Yesterday Comparison
  const todayVisitsCount = pageVisits.filter(v => new Date(v.createdAt) >= todayStart).length
  const yesterdayVisitsCount = pageVisits.filter(v => new Date(v.createdAt) >= yesterdayStart && new Date(v.createdAt) < todayStart).length
  
  const todayViewsCount = productViews.filter(v => new Date(v.createdAt) >= todayStart).length
  const yesterdayViewsCount = productViews.filter(v => new Date(v.createdAt) >= yesterdayStart && new Date(v.createdAt) < todayStart).length

  // Top Products
  const productViewCounts = productViews.reduce((acc: any, v) => {
    const id = v.productId
    if (!acc[id]) acc[id] = { count: 0, name: v.product?.name || 'منتج محذوف', image: v.product?.images?.[0]?.url || null }
    acc[id].count += 1
    return acc
  }, {})

  const topProducts = Object.values(productViewCounts)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 10)

  // Translation helpers
  const translateCountry = (c: string) => {
    const map: any = {
      'EG': 'مصر', 'Egypt': 'مصر',
      'SA': 'السعودية', 'Saudi Arabia': 'السعودية',
      'AE': 'الإمارات', 'United Arab Emirates': 'الإمارات',
      'KW': 'الكويت', 'Kuwait': 'الكويت',
      'QA': 'قطر', 'Qatar': 'قطر',
      'OM': 'عمان', 'Oman': 'عمان',
      'BH': 'البحرين', 'Bahrain': 'البحرين',
      'JO': 'الأردن', 'Jordan': 'الأردن',
      'MA': 'المغرب', 'Morocco': 'المغرب',
      'DZ': 'الجزائر', 'Algeria': 'الجزائر',
      'TN': 'تونس', 'Tunisia': 'تونس',
      'IQ': 'العراق', 'Iraq': 'العراق',
      'SD': 'السودان', 'Sudan': 'السودان',
      'YE': 'اليمن', 'Yemen': 'اليمن',
      'SY': 'سوريا', 'Syria': 'سوريا',
      'PS': 'فلسطين', 'Palestine': 'فلسطين',
      'LB': 'لبنان', 'Lebanon': 'لبنان',
      'LY': 'ليبيا', 'Libya': 'ليبيا',
    }
    return map[c] || c
  }

  const translateCity = (c: string) => {
    if (!c) return 'غير محدد'
    const map: any = {
      'Cairo': 'القاهرة', 'Alexandria': 'الإسكندرية', 'Giza': 'الجيزة',
      'Riyadh': 'الرياض', 'Jeddah': 'جدة', 'Mecca': 'مكة', 'Medina': 'المدينة',
      'Dubai': 'دبي', 'Abu Dhabi': 'أبوظبي', 'Sharjah': 'الشارقة',
      'Amman': 'عمان', 'Kuwait City': 'مدينة الكويت', 'Doha': 'الدوحة',
      'Manama': 'المنامة', 'Muscat': 'مسقط', 'Baghdad': 'بغداد',
      'Khartoum': 'الخرطوم', 'Damascus': 'دمشق', 'Beirut': 'بيروت',
      'Tanta': 'طنطا', 'Mansoura': 'المنصورة', 'Suez': 'السويس', 'Port Said': 'بورسعيد',
      'Ismailia': 'الإسماعيلية', 'Aswan': 'أسوان', 'Asyut': 'أسيوط', 'Sohag': 'سوهاج',
      'Minya': 'المنيا', 'Qena': 'قنا', 'Fayoum': 'الفيوم', 'Banha': 'بنها',
      'Damanhur': 'دمنهور', 'Zagazig': 'الزقازيق', 'Ash Sharqiyah': 'الشرقية',
      'Dakahlia': 'الدقهلية', 'Gharbia': 'الغربية', 'Monufia': 'المنوفية',
      'Damietta': 'دمياط', 'Kafr El Sheikh': 'كفر الشيخ', 'Beni Suef': 'بني سويف',
      'Hurghada': 'الغردقة', 'Sharm El Sheikh': 'شرم الشيخ', 'Luxor': 'الأقصر',
      'Dammam': 'الدمام', 'Khobar': 'الخبر', 'Dhahran': 'الظهران', 'Al Ahsa': 'الأحساء',
      'Taif': 'الطائف', 'Tabuk': 'تبوك', 'Abha': 'أبها', 'Najran': 'نجران',
      'Jizan': 'جازان', 'Al Qassim': 'القصيم', 'Hail': 'حائل', 'Jubail': 'الجبيل',
      'unknown': 'غير محدد', 'Unknown': 'غير محدد', '(not set)': 'غير محدد',
    }
    // Check if the city contains any of these
    for (const [en, ar] of Object.entries(map)) {
      if (c.toLowerCase() === en.toLowerCase()) return ar as string
    }
    // If not found, try to see if it's already arabic (contains arabic letters)
    const arabicRegex = /[\u0600-\u06FF]/;
    if (arabicRegex.test(c)) return c;
    
    // Return original if no translation found (maybe it's a small city)
    return map[c] || c
  }

  const getPageName = (p: string) => {
    if (p === '/') return 'الرئيسية'
    if (p === '/products' || p.startsWith('/products?')) return 'جميع المنتجات'
    if (p === '/checkout') return 'إتمام الطلب'
    if (p === '/account') return 'حسابي'
    if (p.startsWith('/category/')) return 'قسم: ' + decodeURIComponent(p.split('/category/')[1].split('?')[0])
    if (p.startsWith('/product/')) return 'منتج: ' + decodeURIComponent(p.split('/product/')[1].split('?')[0])
    if (p.startsWith('/search')) return 'نتائج البحث'
    if (p.startsWith('/brands')) return 'الماركات'
    return p
  }

  // Countries and Cities (using PageVisits as base)
  const countryCounts = pageVisits.reduce((acc: any, v) => {
    const c = translateCountry(v.country || 'غير محدد')
    acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})
  
  const cityCounts = pageVisits.reduce((acc: any, v) => {
    const c = translateCity(v.city || 'غير محدد')
    acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})

  const topCountries = Object.entries(countryCounts)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const topCities = Object.entries(cityCounts)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const pathCounts = pageVisits.reduce((acc: any, v) => {
    if (v.path) {
      const name = getPageName(v.path)
      acc[name] = (acc[name] || 0) + 1
    }
    return acc
  }, {})

  const topPages = Object.entries(pathCounts)
    .map(([path, count]) => ({ path, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return (
    <AnalyticsClient 
      chartData={chartData} 
      totalVisits={pageVisits.length} 
      totalViews={productViews.length}
      todayVisits={todayVisitsCount}
      yesterdayVisits={yesterdayVisitsCount}
      todayViews={todayViewsCount}
      yesterdayViews={yesterdayViewsCount}
      topProducts={topProducts}
      topCountries={topCountries}
      topCities={topCities}
      topPages={topPages}
    />
  )
}
