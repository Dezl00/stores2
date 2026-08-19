"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, Eye, Trash2, User, Phone, MapPin, Mail, Calendar, ChevronLeft, Package, Clock, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { deleteCustomer } from "@/features/customers/actions"
import { usePermissions } from "@/hooks/use-permissions"

import { useRouter, useSearchParams, usePathname } from "next/navigation"

export function CustomersClient({ customers, currentPage = 1, totalPages = 1, initialSearch = "" }: { customers: any[], currentPage?: number, totalPages?: number, initialSearch?: string }) {
  const { hasPermission } = usePermissions()
  const canDelete = hasPermission("customers.delete")

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const router = useRouter()
  const pathname = usePathname()

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== initialSearch) {
        const params = new URLSearchParams()
        if (searchQuery) params.set("search", searchQuery)
        params.set("page", "1")
        router.push(`${pathname}?${params.toString()}`)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, initialSearch, pathname, router])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  async function confirmDelete() {
    if (!customerToDelete) return
    const res = await deleteCustomer(customerToDelete)
    if (res.success) {
      toast.success("تم حذف العميل بنجاح")
      if (selectedCustomer?.id === customerToDelete) setSelectedCustomer(null)
    } else {
      toast.error(res.error || "حدث خطأ أثناء الحذف")
    }
    setDeleteModalOpen(false)
    setCustomerToDelete(null)
  }

  const filteredCustomers = customers; // Already filtered and paginated from server

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'قيد الانتظار'
      case 'PROCESSING': return 'جاري التجهيز'
      case 'COMPLETED': return 'مكتمل'
      case 'CANCELLED': return 'ملغي'
      default: return status
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>الرئيسية</span>
          <span>/</span>
          <span className="text-foreground">العملاء</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:h-[calc(100vh-12rem)] md:min-h-[600px]">
        {/* Right pane: Customer List */}
        <div className="md:col-span-1 rounded-xl border border-border bg-card flex flex-col md:h-full md:overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/5 shrink-0">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث بالاسم، البريد، أو الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background pr-10 pl-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 md:overflow-y-auto scrollbar-thin">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                لا يوجد عملاء يطابقون بحثك
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredCustomers.map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className={`w-full text-start p-4 transition-all hover:bg-muted/50 flex items-center justify-between ${selectedCustomer?.id === customer.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${selectedCustomer?.id === customer.id ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-foreground truncate max-w-[150px]">{customer.name || "بدون اسم"}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">{customer.email}</span>
                      </div>
                    </div>
                    <ChevronLeft className={`h-4 w-4 transition-transform ${selectedCustomer?.id === customer.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-border bg-card shrink-0 flex items-center justify-between gap-2">
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

        {/* Left pane: Customer Details */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card md:h-full md:overflow-hidden flex flex-col">
          {!selectedCustomer ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
              <div className="h-20 w-20 rounded-full border border-border bg-muted/20 flex items-center justify-center">
                <User className="h-10 w-10 opacity-20" />
              </div>
              <div>
                <p className="font-medium text-lg text-foreground">حدد عميلاً من القائمة</p>
                <p className="text-sm mt-1">لعرض التفاصيل الكاملة وسجل الطلبات</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 md:overflow-y-auto scrollbar-thin">
              {/* Header Profile */}
              <div className="p-6 border-b border-border">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full border border-border bg-muted/30 flex items-center justify-center text-muted-foreground">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{selectedCustomer.name || "بدون اسم"}</h2>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>عضو منذ {new Date(selectedCustomer.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                  </div>
                  {canDelete && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        setCustomerToDelete(selectedCustomer.id)
                        setDeleteModalOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف الحساب
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b border-border pb-2">بيانات التواصل</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="text-foreground">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground shrink-0">
                        <Phone className="h-4 w-4" />
                      </div>
                      <span className="text-foreground">{selectedCustomer.phone || <span className="text-muted-foreground italic">غير محدد</span>}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span className="text-foreground line-clamp-2">{selectedCustomer.address || <span className="text-muted-foreground italic">غير محدد</span>}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b border-border pb-2">إحصائيات العميل</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg p-4 border border-border text-center">
                      <span className="block text-3xl font-bold text-primary mb-1">{selectedCustomer._count?.orders || 0}</span>
                      <span className="text-xs text-muted-foreground font-medium">إجمالي الطلبات</span>
                    </div>
                    <div className="rounded-lg p-4 border border-border text-center">
                      <span className="block text-3xl font-bold text-primary mb-1">
                        {selectedCustomer.orders?.filter((o: any) => o.status === 'COMPLETED').length || 0}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">الطلبات المكتملة</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div className="p-6 pt-0">
                <h3 className="font-bold text-lg border-b border-border pb-2 mb-4">سجل الطلبات</h3>
                
                {!selectedCustomer.orders || selectedCustomer.orders.length === 0 ? (
                  <div className="text-center p-8 rounded-lg border border-border border-dashed">
                    <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">لم يقم هذا العميل بأي طلبات حتى الآن.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomer.orders.map((order: any) => (
                      <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/10 transition-colors gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${getStatusColor(order.status)}`}>
                            {order.status === 'COMPLETED' ? <CheckCircle2 className="h-5 w-5" /> : 
                             order.status === 'CANCELLED' ? <XCircle className="h-5 w-5" /> : 
                             <Clock className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="font-bold text-sm">طلب #{order.id.substring(0, 8).toUpperCase()}</div>
                            <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                              <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                              <span>•</span>
                              <span>{order.totalAmount} ج.م</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/admin/orders?search=${order.id.substring(0, 8)}`} target="_blank">عرض</a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="حذف العميل"
        description="هل أنت متأكد من حذف حساب هذا العميل؟ سيتم حذف جميع بياناته."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  )
}
