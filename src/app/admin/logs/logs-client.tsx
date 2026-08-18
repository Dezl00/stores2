"use client"
import React, { useState } from 'react'

export function LogsClient({ logs, currentUser }: { logs: any[], currentUser: any }) {
  const permissions = currentUser?.permissions || []
  const isAdmin = currentUser?.role === 'STORE_OWNER'
  const hasPerm = (perm: string) => isAdmin || permissions.includes(perm)

  const allowedTabs = [
    ...(hasPerm('security.logs') ? ['logs'] : [])
  ]

  const [activeTab, setActiveTab] = useState(allowedTabs[0] || 'logs')
  const [filterType, setFilterType] = useState('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const filteredLogs = logs.filter(log => {
    if (filterType === 'all') return true
    
    const logDate = new Date(log.createdAt).getTime()
    const now = new Date().getTime()
    
    if (filterType === 'today') {
      return now - logDate <= 24 * 60 * 60 * 1000
    }
    if (filterType === 'week') {
      return now - logDate <= 7 * 24 * 60 * 60 * 1000
    }
    if (filterType === 'month') {
      return now - logDate <= 30 * 24 * 60 * 60 * 1000
    }
    if (filterType === 'custom') {
      const from = customFrom ? new Date(customFrom).getTime() : 0
      const to = customTo ? new Date(customTo).getTime() + 24*60*60*1000 : Infinity
      return logDate >= from && logDate <= to
    }
    
    return true
  })

  const getActionBadge = (action: string) => {
    const actionUpper = action.toUpperCase();
    
    const isDelete = actionUpper.includes('DELETE') || action === 'حذف';
    const isCreate = actionUpper.includes('CREATE') || action === 'إنشاء' || action === 'إضافة';
    const isSort = actionUpper === 'UPDATEORDER' || action === 'ترتيب';
    const isUpdate = (actionUpper.includes('UPDATE') && !isSort) || action === 'تعديل';
    const isLogin = actionUpper.includes('LOGIN') || action === 'تسجيل دخول';
    
    let label = action;
    if (isDelete) label = 'حذف';
    else if (isCreate) label = 'إضافة';
    else if (isSort) label = 'ترتيب';
    else if (isUpdate) label = 'تعديل';
    else if (isLogin) label = 'تسجيل دخول';

    const colorClass = isDelete ? 'bg-red-100 text-red-700' : isCreate ? 'bg-green-100 text-green-700' : isSort ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700';

    return (
      <span className={`h-9 min-w-[100px] px-3 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium ${colorClass}`}>
        {label}
      </span>
    );
  }

  const getEntityName = (type: string) => {
    const map: Record<string, string> = {
      'Product': 'منتج',
      'Category': 'قسم',
      'Brand': 'ماركة',
      'Order': 'طلب',
      'Widget': 'مكون واجهة',
      'User': 'مستخدم',
      'Backup': 'نسخة احتياطية',
      'ThemeConfig': 'إعدادات المتجر'
    };
    return map[type] || type;
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
  }

  const formatDetails = (details: any, entityType: string) => {
    if (!details) return 'بدون تفاصيل';
    
    // Custom details mapping for specific types
    if (entityType === 'Widget') {
      if (details.type) return `النوع: ${details.type}`;
      if (details.id) return `تحديث واجهة: ${details.id}`;
    }

    if (details.message) return details.message;
    
    // Fallback: show modified fields if any
    if (typeof details === 'object') {
      const keys = Object.keys(details).filter(k => k !== 'message' && k !== 'id' && k !== 'type');
      if (keys.length > 0) {
        // If status was changed, try to translate the values
        if (details.status) {
          const statusMap: Record<string, string> = {
            'CONFIRMED': 'مؤكد',
            'PENDING': 'قيد التنفيذ',
            'SHIPPED': 'تم الشحن',
            'OUT_FOR_DELIVERY': 'خرج للتوصيل',
            'DELIVERED': 'تم التوصيل',
            'CANCELLED': 'ملغي'
          };
          if (typeof details.status === 'string' && statusMap[details.status]) {
            details.status = statusMap[details.status];
          }
        }
        return `تم تعديل: ${keys.join(', ')}`;
      }
    }
    
    return 'تم الإجراء بنجاح';
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>الرئيسية</span>
          <span>/</span>
          <span className="text-foreground font-medium">سجل النشاطات</span>
        </nav>
      </div>

      {activeTab === 'logs' && hasPerm('security.logs') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-card p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium whitespace-nowrap">تصفية بالتاريخ:</span>
              <select 
                className="text-sm border border-input rounded-md px-3 py-1.5 bg-background focus:ring-1 focus:ring-primary outline-none font-medium text-muted-foreground"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="all">الكل</option>
                <option value="today">اليوم</option>
                <option value="week">آخر أسبوع</option>
                <option value="month">آخر شهر</option>
                <option value="custom">مخصص</option>
              </select>
            </div>
            {filterType === 'custom' && (
              <div className="flex flex-wrap items-center gap-4 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">من:</span>
                  <input type="date" className="text-sm border border-input rounded-md px-2 py-1.5 bg-background focus:ring-1 focus:ring-primary outline-none font-medium text-muted-foreground" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">إلى:</span>
                  <input type="date" className="text-sm border border-input rounded-md px-2 py-1.5 bg-background focus:ring-1 focus:ring-primary outline-none font-medium text-muted-foreground" value={customTo} onChange={e => setCustomTo(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <div className="border border-border/50 rounded-xl bg-card overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-muted/30 border-b border-border/50">
                  <tr>
                    <th className="p-4 font-medium text-muted-foreground">التاريخ</th>
                    <th className="p-4 font-medium text-muted-foreground">المستخدم</th>
                    <th className="p-4 font-medium text-muted-foreground">نوع الإجراء</th>
                    <th className="p-4 font-medium text-muted-foreground">العنصر</th>
                    <th className="p-4 font-medium text-muted-foreground">التفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium text-muted-foreground" dir="rtl">{formatDate(log.createdAt)}</td>
                      <td className="p-4 font-medium">{log.user?.name || 'النظام'}</td>
                      <td className="p-4">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="p-4 font-medium">
                        {getEntityName(log.entityType)}
                      </td>
                      <td className="p-4 text-muted-foreground max-w-[250px] truncate font-medium">
                        {formatDetails(log.details, log.entityType)}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground font-medium">لا توجد أنشطة مسجلة</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/5 rounded-lg border border-border/50 font-medium">
                  لا توجد أنشطة مسجلة
                </div>
              ) : (
                filteredLogs.map(log => (
                  <div key={log.id} className="bg-card border border-border/50 rounded-lg p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
                      <div className="font-medium text-foreground text-base">
                        {log.user?.name || 'النظام'}
                      </div>
                      {getActionBadge(log.action)}
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">العنصر:</span>
                        <span className="text-sm font-medium">{getEntityName(log.entityType)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">التاريخ:</span>
                        <span className="text-sm font-medium" dir="rtl">{formatDate(log.createdAt)}</span>
                      </div>

                      <div className="mt-1 pt-3 border-t border-border/50 flex flex-col gap-2">
                        <span className="text-sm font-medium text-muted-foreground">التفاصيل:</span>
                        <span className="text-sm font-medium text-foreground bg-muted/30 p-2.5 rounded-md break-words">
                          {formatDetails(log.details, log.entityType)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
