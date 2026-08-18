import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireStoreAdmin } from "@/lib/auth/require-admin"
import { resolveStoreId } from "@/lib/store-context"
import * as XLSX from "xlsx"

export async function GET(request: Request) {
  try {
    await requireStoreAdmin()
  } catch (e: any) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'

  const storeId = await resolveStoreId()
  const where: any = { storeId }
  
  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { userId: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { phone: { contains: search, mode: "insensitive" } } }
    ]
  }

  if (status && status !== 'all' && status !== 'ALL') {
    where.status = status
  }

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
    }
  })

  const statusLabels: Record<string, string> = {
    "PENDING": "قيد التنفيذ",
    "CONFIRMED": "مؤكد",
    "SHIPPED": "تم الشحن",
    "OUT_FOR_DELIVERY": "خرج للتوصيل",
    "DELIVERED": "تم التوصيل",
    "CANCELLED": "ملغي"
  }

  const dataToExport = orders.map((o) => {
    return {
      "رقم الطلب": o.id,
      "اسم العميل": o.user?.name || o.user?.email || "عميل غير مسجل",
      "الإجمالي": o.totalAmount,
      "التاريخ": new Date(o.createdAt).toLocaleDateString('ar-EG'),
      "الحالة": statusLabels[o.status] || o.status,
    }
  })

  const ws = XLSX.utils.json_to_sheet(dataToExport)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "الطلبات")
  
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Assal_Orders.xlsx"'
    }
  })
}
