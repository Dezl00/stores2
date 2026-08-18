'use client'
import React, { useState, useMemo, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, X, Loader2, ChevronDown, ChevronUp, Users, Search, User, Phone, Lock, MoreVertical, Crown } from 'lucide-react'
import { deleteAccount, createAccount, updateAccount, updateAccountStatus } from "@/features/accounts/actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { toast } from 'sonner'
import { usePermissions } from "@/hooks/use-permissions"

const PERMISSIONS_SCHEMA = [
  { 
    id: 'products', 
    label: 'المنتجات',
    subPermissions: [
      { id: 'view', label: 'الوصول لقائمة المنتجات' },
      { id: 'add', label: 'إضافة منتج جديد' },
      { id: 'edit', label: 'تعديل بيانات المنتجات' },
      { id: 'delete', label: 'حذف المنتجات' }
    ]
  },
  { 
    id: 'orders', 
    label: 'الطلبات',
    subPermissions: [
      { id: 'view', label: 'الوصول لقائمة الطلبات' },
      { id: 'edit', label: 'تعديل حالة الطلب' },
      { id: 'delete', label: 'حذف الطلبات' }
    ]
  },
  { 
    id: 'customers', 
    label: 'العملاء',
    subPermissions: [
      { id: 'view', label: 'الوصول لقائمة العملاء' },
      { id: 'edit', label: 'تعديل بيانات العملاء' },
      { id: 'delete', label: 'حذف العملاء' }
    ]
  },
  { 
    id: 'departments', 
    label: 'المجالات',
    subPermissions: [
      { id: 'view', label: 'الوصول للمجالات' },
      { id: 'add', label: 'إضافة مجال' },
      { id: 'edit', label: 'تعديل مجال' },
      { id: 'delete', label: 'حذف مجال' }
    ]
  },
  { 
    id: 'categories', 
    label: 'الأقسام',
    subPermissions: [
      { id: 'view', label: 'الوصول للأقسام' },
      { id: 'add', label: 'إضافة قسم' },
      { id: 'edit', label: 'تعديل قسم' },
      { id: 'delete', label: 'حذف قسم' }
    ]
  },
  { 
    id: 'articles', 
    label: 'المقالات',
    subPermissions: [
      { id: 'view', label: 'الوصول للمقالات' },
      { id: 'add', label: 'إضافة مقال' },
      { id: 'edit', label: 'تعديل مقال' },
      { id: 'delete', label: 'حذف مقال' }
    ]
  },
  { 
    id: 'employees_of_the_month', 
    label: 'موظف الشهر',
    subPermissions: [
      { id: 'view', label: 'الوصول للقائمة' },
      { id: 'add', label: 'إضافة موظف' },
      { id: 'edit', label: 'تعديل موظف' },
      { id: 'delete', label: 'حذف موظف' }
    ]
  },
  { 
    id: 'settings', 
    label: 'الإعدادات',
    subPermissions: [
      { id: 'general', label: 'الإعدادات العامة' },
      { id: 'appearance', label: 'المظهر والهوية' },
      { id: 'social', label: 'التواصل الاجتماعي' },
      { id: 'branches', label: 'الفروع والمواقع' },
      { id: 'backups', label: 'النسخ الاحتياطي' },
      { id: 'notifications', label: 'الإشعارات المتقدمة' },
      { id: 'advanced', label: 'الإعدادات المتقدمة' }
    ]
  },
  { 
    id: 'offers', 
    label: 'العروض وأكواد الخصم',
    subPermissions: [
      { id: 'view', label: 'الوصول للعروض' },
      { id: 'add', label: 'إضافة عروض' },
      { id: 'edit', label: 'تعديل العروض' },
      { id: 'delete', label: 'حذف العروض' }
    ]
  },
  { 
    id: 'widgets', 
    label: 'واجهة المتجر والتصميم',
    subPermissions: [
      { id: 'view', label: 'الوصول للواجهات' },
      { id: 'edit', label: 'تعديل وتخصيص الواجهات' }
    ]
  },
  { 
    id: 'shipping-payment', 
    label: 'الدفع والشحن',
    subPermissions: [
      { id: 'shipping', label: 'إعدادات الشحن' },
      { id: 'payment', label: 'طرق الدفع' }
    ]
  },
  { 
    id: 'accounts', 
    label: 'الحسابات والصلاحيات',
    subPermissions: [
      { id: 'view', label: 'الوصول للحسابات' },
      { id: 'add', label: 'إضافة حسابات' },
      { id: 'edit', label: 'تعديل الحسابات والصلاحيات' },
      { id: 'delete', label: 'حذف الحسابات' }
    ]
  },
  { 
    id: 'analytics', 
    label: 'الإحصائيات والتقارير',
    subPermissions: [
      { id: 'view', label: 'الوصول للإحصائيات' }
    ]
  },
  { 
    id: 'security', 
    label: 'السجلات',
    subPermissions: [
      { id: 'profile', label: 'الملف الشخصي' },
      { id: 'logs', label: 'الوصول للسجلات' }
    ]
  }
]

export function AccountsClient({ accounts }: { accounts: any[] }) {
  const { hasPermission } = usePermissions()
  const canAdd = hasPermission("accounts.add")
  const canEdit = hasPermission("accounts.edit")
  const canDelete = hasPermission("accounts.delete")

  const [isFormVisible, setIsFormVisible] = useState(canAdd)
  const [editingItem, setEditingItem] = useState<any>(null)
  
  // State for permissions (stores full keys like "products.view")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  
  // Accordion open state per section
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any>(null)

  // Compute all available permission keys
  const allPermissionKeys = useMemo(() => {
    let keys: string[] = []
    PERMISSIONS_SCHEMA.forEach(section => {
      section.subPermissions.forEach(sub => {
        keys.push(`${section.id}.${sub.id}`)
      })
    })
    return keys
  }, [])

  const [localAccounts, setLocalAccounts] = useState(accounts)

  React.useEffect(() => {
    setLocalAccounts(accounts)
  }, [accounts])

  function resetForm() {
    setEditingItem(null)
    setSelectedPermissions([])
    setIsFormVisible(false)
    setOpenSections({})
    const form: any = document.getElementById("add-account-form")
    if (form) form.reset()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    // We send empty string for role since we aren't using it anymore in UI, backend will default to MANAGER
    formData.set('role', 'MANAGER')
    formData.set('permissions', JSON.stringify(selectedPermissions))
    
    let res
    if (editingItem) res = await updateAccount(editingItem.id, formData)
    else res = await createAccount(formData)
      
    setIsSubmitting(false)
    if (res.success) {
      toast.success('تم الحفظ بنجاح')
      resetForm()
    } else {
      toast.error(res.error || 'فشل الحفظ')
    }
  }

  async function handleDeleteConfirm() {
    if (!itemToDelete) return
    setIsDeleting(true)
    const res = await deleteAccount(itemToDelete.id)
    setIsDeleting(false)
    if (res.success) toast.success('تم الحذف بنجاح')
    else toast.error(res.error || 'فشل الحذف')
    setDeleteModalOpen(false)
  }

  const [isPending, startTransition] = useTransition()

  function handleUpdateStatus(id: string, active: boolean) {
    setLocalAccounts(prev => prev.map(a => a.id === id ? { ...a, isActive: active } : a))
    startTransition(async () => {
      const res = await updateAccountStatus(id, active)
      if (!res.success) {
        toast.error(res.error || 'فشل تحديث الحالة')
        setLocalAccounts(prev => prev.map(a => a.id === id ? { ...a, isActive: !active } : a))
      }
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPermissions(allPermissionKeys)
    } else {
      setSelectedPermissions([])
    }
  }

  const handleSectionSelect = (sectionId: string, checked: boolean) => {
    const sectionKeys = PERMISSIONS_SCHEMA.find(s => s.id === sectionId)?.subPermissions.map(sub => `${sectionId}.${sub.id}`) || []
    
    if (checked) {
      // Add all section keys that are not already selected
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...sectionKeys])))
    } else {
      // Remove all section keys
      setSelectedPermissions(prev => prev.filter(p => !sectionKeys.includes(p)))
    }
  }

  const handleSubPermissionSelect = (permissionKey: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionKey])
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permissionKey))
    }
  }

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>الرئيسية</span>
          <span>/</span>
          <span className="text-foreground">الحسابات والصلاحيات</span>
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row-reverse gap-6 relative items-start">
        {/* Table Area */}
        <div className="flex-1 w-full order-last lg:order-first">
          <div className="rounded-[16px] border border-border/40 bg-card overflow-hidden">
            {/* Table Toolbar */}
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 bg-card">
              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="ابحث عن مستخدم..." 
                  className="w-full h-10 pl-3 pr-10 border border-border/60 rounded-lg bg-transparent text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              {canAdd && (
                <Button 
                  onClick={() => resetForm()} 
                  className="w-full sm:w-auto bg-[#2453E3] hover:bg-[#1e293b] text-white rounded-lg px-6"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة مستخدم
                </Button>
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-muted/20 border-b border-border/40 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">الاسم</th>
                    <th className="px-6 py-4 font-medium">رقم الهاتف / البريد</th>
                    <th className="px-6 py-4 font-medium">الصلاحيات</th>
                    <th className="px-6 py-4 font-medium">الحالة</th>
                    <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {localAccounts.map(acc => {
                    const permCount = acc.permissions?.length || 0;
                    return (
                      <tr key={acc.id} className="border-b border-border/40 last:border-0 hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                              {(acc.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-foreground">{acc.name || 'بدون اسم'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground" dir="ltr">{acc.phone}</td>
                        <td className="px-6 py-4">
                          {permCount === allPermissionKeys.length ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-red-50 text-red-600 font-medium border border-red-100">
                              <Crown className="w-3.5 h-3.5" />
                              مدير بنظام كامل
                            </span>
                          ) : permCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-blue-50 text-blue-600 font-medium border border-blue-100">
                              {permCount} صلاحية
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-gray-50 text-gray-600 font-medium border border-gray-100">
                              بدون صلاحيات
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={acc.isActive !== false} 
                              onCheckedChange={(checked) => {
                                if (canEdit) handleUpdateStatus(acc.id, checked)
                              }}
                              disabled={!canEdit}
                              className={acc.isActive !== false ? 'data-[state=checked]:bg-green-500' : ''}
                            />
                            <span className="text-sm text-muted-foreground">{acc.isActive !== false ? 'نشط' : 'معطل'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {canEdit && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-blue-50/50 hover:bg-blue-100 text-blue-600" onClick={() => { 
                                setEditingItem(acc); 
                                setSelectedPermissions(acc.permissions || []);
                                setIsFormVisible(true) 
                              }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {canDelete && acc.role !== "STORE_OWNER" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-red-50/50 hover:bg-red-100 text-red-600" onClick={() => { setItemToDelete(acc); setDeleteModalOpen(true) }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {localAccounts.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد حسابات مسجلة</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {localAccounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/5 rounded-xl border border-border/40">
                  لا توجد حسابات مسجلة
                </div>
              ) : (
                localAccounts.map(acc => {
                  const permCount = acc.permissions?.length || 0;
                  return (
                    <div key={acc.id} className="bg-card border border-border/40 rounded-xl p-4 flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                            {(acc.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-base">{acc.name || 'بدون اسم'}</div>
                            <div className="text-muted-foreground text-sm mt-0.5" dir="ltr">{acc.phone}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={acc.isActive !== false} 
                            onCheckedChange={(checked) => {
                              if (canEdit) handleUpdateStatus(acc.id, checked)
                            }}
                            disabled={!canEdit}
                            className={acc.isActive !== false ? 'data-[state=checked]:bg-green-500' : ''}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {permCount === allPermissionKeys.length ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-red-50 text-red-600 font-medium border border-red-100">
                            <Crown className="w-3.5 h-3.5" />
                            مدير بنظام كامل
                          </span>
                        ) : permCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-blue-50 text-blue-600 font-medium border border-blue-100">
                            {permCount} صلاحية
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-gray-50 text-gray-600 font-medium border border-gray-100">
                            بدون صلاحيات
                          </span>
                        )}
                      </div>

                      {(canEdit || canDelete) && (
                        <div className="flex items-center gap-2 pt-3 border-t border-border/40">
                          {canEdit && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex-1 bg-blue-50/50 hover:bg-blue-100 text-blue-600 rounded-lg"
                              onClick={() => {
                                setEditingItem(acc); 
                                setSelectedPermissions(acc.permissions || []);
                                setIsFormVisible(true);
                                if (window.innerWidth < 1024) {
                                  setTimeout(() => {
                                    document.getElementById('add-account-form')?.scrollIntoView({ behavior: 'smooth' });
                                  }, 100);
                                }
                              }}
                            >
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل
                            </Button>
                          )}
                          {canDelete && acc.role !== "STORE_OWNER" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex-1 bg-red-50/50 hover:bg-red-100 text-red-600 rounded-lg"
                              onClick={() => { setItemToDelete(acc); setDeleteModalOpen(true) }}
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Form Area (Sidebar) */}
        {(canAdd || editingItem) && (
          <div className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-4 transition-all duration-300">
            <div className="rounded-[16px] border border-border/40 bg-card overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{editingItem ? 'تعديل صلاحيات الحساب' : 'إضافة حساب جديد'}</h2>
              <Button variant="outline" size="icon" onClick={resetForm} className="h-8 w-8 rounded-lg border-border/60 text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="px-6 pb-6 overflow-y-auto flex-1 custom-scrollbar">
              <form onSubmit={handleSubmit} id="add-account-form" className="space-y-6">
                
                {/* Inputs */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">الاسم</label>
                    <div className="relative">
                      <input name="name" type="text" required defaultValue={editingItem?.name || ''} className="w-full h-11 pl-3 pr-10 border border-border/60 rounded-xl bg-transparent focus:outline-none focus:border-primary transition-colors text-sm" />
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">رقم الهاتف</label>
                    <div className="relative">
                      <input name="phone" type="tel" required defaultValue={editingItem?.phone || ''} className="w-full h-11 pl-3 pr-10 border border-border/60 rounded-xl bg-transparent focus:outline-none focus:border-primary transition-colors text-sm" dir="ltr" />
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                      كلمة المرور 
                      {editingItem && <span className="text-muted-foreground text-xs font-normal">(اتركه فارغاً لعدم التغيير)</span>}
                    </label>
                    <div className="relative">
                      <input name="password" type="password" required={!editingItem} className="w-full h-11 pl-3 pr-10 border border-border/60 rounded-xl bg-transparent focus:outline-none focus:border-primary transition-colors text-sm" dir="ltr" placeholder="********" />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-base font-bold text-foreground">الصلاحيات المخصصة</label>
                    <div className="flex items-center gap-2">
                      <label htmlFor="select-all" className="text-sm font-medium text-foreground cursor-pointer select-none">تحديد الكل</label>
                      <Checkbox 
                        id="select-all" 
                        checked={selectedPermissions.length === allPermissionKeys.length && allPermissionKeys.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="rounded-[4px] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {PERMISSIONS_SCHEMA.map(section => {
                      const sectionKeys = section.subPermissions.map(sub => `${section.id}.${sub.id}`)
                      const selectedInSection = sectionKeys.filter(k => selectedPermissions.includes(k)).length
                      const isAllSelected = selectedInSection === sectionKeys.length
                      const isOpen = openSections[section.id]

                      return (
                        <div key={section.id} className="rounded-xl overflow-hidden bg-transparent transition-all border border-border/40">
                          {/* Section Header */}
                          <div className={`flex items-center justify-between p-3.5 cursor-pointer select-none transition-colors hover:bg-muted/30 ${isOpen ? 'bg-muted/30' : ''}`} onClick={() => toggleSection(section.id)}>
                            <div className="flex items-center gap-3">
                              <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center shrink-0">
                                <Checkbox 
                                  id={`section-${section.id}`} 
                                  checked={isAllSelected}
                                  className="w-5 h-5 border-border/60 rounded-[4px] data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white"
                                  onCheckedChange={(checked) => handleSectionSelect(section.id, checked as boolean)}
                                />
                              </div>
                              <label htmlFor={`section-${section.id}`} className="text-sm font-semibold cursor-pointer" onClick={(e) => e.stopPropagation()}>{section.label}</label>
                            </div>
                            <div className="flex items-center gap-3">
                              {selectedInSection > 0 && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                  {selectedInSection}/{sectionKeys.length}
                                </span>
                              )}
                              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground pointer-events-none p-0 shrink-0">
                                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>

                          {/* Sub Permissions */}
                          {isOpen && (
                            <div className="p-4 bg-muted/10 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                              {section.subPermissions.map(sub => {
                                const permKey = `${section.id}.${sub.id}`
                                return (
                                  <div key={sub.id} className="flex items-center gap-2">
                                    <Checkbox 
                                      id={`perm-${permKey}`} 
                                      checked={selectedPermissions.includes(permKey)}
                                      onCheckedChange={(checked) => handleSubPermissionSelect(permKey, checked as boolean)}
                                      className="rounded-[4px] border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <label htmlFor={`perm-${permKey}`} className="text-sm text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">{sub.label}</label>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t border-border/40 bg-card shrink-0">
               <Button type="submit" form="add-account-form" className="w-full h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingItem ? 'تحديث الصلاحيات والحساب' : 'إضافة الحساب')}
                </Button>
            </div>
          </div>
        </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
        isLoading={isDeleting}
      />
    </div>
  )
}
