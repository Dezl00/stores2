"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, Eye, Trash2, Box } from "lucide-react"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { updateOrderStatus, deleteOrder } from "@/features/orders/actions"
import { usePermissions } from "@/hooks/use-permissions"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

export function OrdersClient({ 
  orders, 
  currentPage = 1, 
  totalPages = 1, 
  initialSearch = "", 
  initialStatus = "all" 
}: { 
  orders: any[],
  currentPage?: number,
  totalPages?: number,
  initialSearch?: string,
  initialStatus?: string
}) {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission("orders.edit")
  const canDelete = hasPermission("orders.delete")



  const pathname = usePathname()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState(initialStatus)

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (statusFilter && statusFilter !== "ALL" && statusFilter !== "all") params.set("status", statusFilter)
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, statusFilter])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (statusFilter && statusFilter !== "ALL" && statusFilter !== "all") params.set("status", statusFilter)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }
  
  const statusLabels: Record<string, string> = {
    "PENDING": "قيد التنفيذ",
    "CONFIRMED": "مؤكد",
    "SHIPPED": "تم الشحن",
    "OUT_FOR_DELIVERY": "خرج للتوصيل",
    "DELIVERED": "تم التوصيل",
    "CANCELLED": "ملغي"
  }
  
  const statusColors: Record<string, string> = {
    "PENDING": "bg-yellow-100 text-yellow-800",
    "CONFIRMED": "bg-blue-100 text-blue-800",
    "SHIPPED": "bg-indigo-100 text-indigo-800",
    "OUT_FOR_DELIVERY": "bg-orange-100 text-orange-800",
    "DELIVERED": "bg-green-100 text-green-800",
    "CANCELLED": "bg-red-100 text-red-800"
  }

  // Server already filters orders
  const filteredOrders = orders

  async function handleStatusChange(orderId: string, newStatus: string) {
    const res = await updateOrderStatus(orderId, newStatus)
    if (res.success) {
      toast.success("تم تحديث حالة الطلب بنجاح")
      router.refresh()
    } else {
      toast.error(res.error || "حدث خطأ أثناء التحديث")
    }
  }



  async function confirmDelete() {
    if (!orderToDelete) return
    const res = await deleteOrder(orderToDelete)
    if (res.success) {
      toast.success("تم حذف الطلب بنجاح")
    } else {
      toast.error(res.error || "حدث خطأ أثناء الحذف")
    }
    setDeleteModalOpen(false)
    setOrderToDelete(null)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>الرئيسية</span>
          <span>/</span>
          <span className="text-foreground">الطلبات</span>
        </nav>
      </div>

      <div className="rounded-xl border border-border/50 bg-card shadow-sm">
        <div className="flex items-center border-b border-border/50 p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث برقم الطلب، اسم العميل، او رقم الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-transparent pr-10 pl-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border/50">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={statusFilter === "ALL" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setStatusFilter("ALL")}
            >
              الكل
            </Button>
            {Object.entries(statusLabels).map(([val, label]) => (
              <Button 
                key={val} 
                variant={statusFilter === val ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStatusFilter(val)}
              >
                {label}
              </Button>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const params = new URLSearchParams()
              if (searchQuery) params.set("search", searchQuery)
              if (statusFilter && statusFilter !== "ALL" && statusFilter !== "all") params.set("status", statusFilter)
              window.location.href = `/api/admin/export/orders?${params.toString()}`
            }}
          >
            تصدير للإكسل
          </Button>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-border/50">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              لا توجد طلبات متطابقة مع بحثك.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-4 space-y-4 transition-colors hover:bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold text-foreground">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={!canEdit}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full appearance-none cursor-pointer outline-none ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}
                  >
                    {Object.entries(statusLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">العميل</p>
                    <p className="font-medium truncate">{order.user?.name || order.user?.email || "عميل غير مسجل"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs mb-1">الإجمالي</p>
                    <p className="font-bold text-primary">{order.totalAmount.toFixed(2)} ج.م</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className="text-xs text-muted-foreground font-sans" dir="ltr">
                    {new Date(order.createdAt).toLocaleDateString('en-GB')} {new Date(order.createdAt).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link prefetch={false} 
                      href={`/admin/orders/${order.id}`}
                      className="h-8 text-xs hover:bg-primary/10 hover:text-primary flex items-center justify-center px-3 rounded-md transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 ml-1.5" />
                      عرض
                    </Link>
                    {canDelete && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setOrderToDelete(order.id)
                          setDeleteModalOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="border-b border-border/50 bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">رقم الطلب</th>
                <th className="px-6 py-4 font-medium">العميل</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">الإجمالي</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    لا توجد طلبات متطابقة مع بحثك.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-right font-sans" dir="ltr">
                      {order.user?.name || order.user?.email || "عميل غير مسجل"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-sans" dir="ltr">
                      {new Date(order.createdAt).toLocaleDateString('en-GB')} {new Date(order.createdAt).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-medium font-sans" dir="ltr">
                      {order.totalAmount.toFixed(2)} ج.م
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={!canEdit}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full appearance-none cursor-pointer outline-none ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}
                      >
                        <option value="PENDING">قيد التنفيذ</option>
                        <option value="CONFIRMED">مؤكد</option>
                        <option value="SHIPPED">تم الشحن</option>
                        <option value="OUT_FOR_DELIVERY">خرج للتوصيل</option>
                        <option value="DELIVERED">تم التوصيل</option>
                        <option value="CANCELLED">ملغي</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link prefetch={false} 
                          href={`/admin/orders/${order.id}`}
                          className="h-8 w-8 text-muted-foreground hover:text-primary flex items-center justify-center rounded-md transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {canDelete && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setOrderToDelete(order.id)
                              setDeleteModalOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border/50 bg-card rounded-b-xl">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              السابق
            </Button>
            <span className="text-sm text-muted-foreground">
              صفحة {currentPage} من {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              التالي
            </Button>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="حذف الطلب"
        description="هل أنت متأكد من حذف هذا الطلب بشكل نهائي؟"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  )
}
