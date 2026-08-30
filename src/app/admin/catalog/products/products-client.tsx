"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2, PlusCircle, X, Loader2, Download, Upload, CheckSquare, Square, Filter, Eye, EyeOff, Check, Settings } from "lucide-react"
import { createProduct, deleteProduct, updateProduct, toggleProductStatus, bulkDeleteProducts, bulkToggleProductsStatus, bulkUpdateProducts, updateProductVariant } from "@/features/products/actions"
import { syncProductGlobalOptions } from "@/features/products/options-actions"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { MultiImageUploader } from "@/components/ui/multi-image-uploader"
import { ProductOptionsManager } from "@/components/admin/product-options-manager"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/use-permissions"
import { ImportProductsModal } from "@/components/admin/import-products-modal"

import { useRouter, useSearchParams, usePathname } from "next/navigation"

export function ProductsClient({ products, categories, brands = [], globalOptions = [], currentPage = 1, totalPages = 1, initialSearch = "", initialBrand = "", initialCats = [], initialStatus = "all" }: { products: any[], categories: any[], brands?: any[], globalOptions?: any[], currentPage?: number, totalPages?: number, initialSearch?: string, initialBrand?: string, initialCats?: string[], initialStatus?: string }) {
  const { hasPermission } = usePermissions()
  const canAdd = hasPermission("products.add")
  const canEdit = hasPermission("products.edit")
  const canDelete = hasPermission("products.delete")

  const [localProducts, setLocalProducts] = useState<any[]>(products)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)

  useEffect(() => { 
    setLocalProducts(products) 
    if (editingProduct) {
      const updated = products.find(p => p.id === editingProduct.id)
      if (updated && JSON.stringify(updated.variants) !== JSON.stringify(editingProduct.variants)) {
        setEditingProduct(updated)
      }
    }
  }, [products])

  // Form States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)
  
  // Image Upload State
  const [imageUrls, setImageUrls] = useState<string[]>([])
  
  // Brand selection
  const [selectedBrandId, setSelectedBrandId] = useState("")
  const [brandSearch, setBrandSearch] = useState("")
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false)
  
  // Category selection
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [categorySearch, setCategorySearch] = useState("")
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)

  // Global Options selection
  const [selectedGlobalOptions, setSelectedGlobalOptions] = useState<Record<string, string[]>>({})
  
  // Single Action States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  const [showAdvanced, setShowAdvanced] = useState(false)

  // Filter States (synced with URL)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [filterCats, setFilterCats] = useState<string[]>(initialCats)
  const [isFilterCatDropdownOpen, setIsFilterCatDropdownOpen] = useState(false)
  const [filterBrand, setFilterBrand] = useState(initialBrand)
  const [filterStatus, setFilterStatus] = useState(initialStatus)
  const [showFilters, setShowFilters] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  // Apply filters to URL
  const applyFilters = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (filterBrand) params.set("brandId", filterBrand)
    if (filterCats.length > 0) params.set("categoryIds", filterCats.join(","))
    if (filterStatus !== "all") params.set("status", filterStatus)
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }

  // Debounced search & filter sync
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, filterBrand, filterCats, filterStatus])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (filterBrand) params.set("brandId", filterBrand)
    if (filterCats.length > 0) params.set("categoryIds", filterCats.join(","))
    if (filterStatus !== "all") params.set("status", filterStatus)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  // Bulk Selection States
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, action: null | (() => Promise<void>), title: string, desc: string, isDestructive: boolean, isLoading: boolean}>({
    isOpen: false, action: null, title: "", desc: "", isDestructive: true, isLoading: false
  });
  
  // Bulk Edit Modal
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [bulkEditData, setBulkEditData] = useState<any[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const filteredBrands = brands.filter((b: any) => b.name.toLowerCase().includes(brandSearch.toLowerCase()))

  const filteredCategoriesForDropdown = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categories, categorySearch])

  // Products are already filtered by the server
  const filteredProducts = localProducts

  // Form Effects
  useEffect(() => {
    if (editingProduct) {
      const form: any = document.getElementById("add-product-form")
      if (form) {
        form.name.value = editingProduct.name || ""
        form.slug.value = editingProduct.slug || ""
        form.sku.value = editingProduct.sku || ""
        form.price.value = editingProduct.price || ""
        form.discountPrice.value = editingProduct.discountPrice || ""
        form.stock.value = editingProduct.stock || 0
        form.description.value = editingProduct.description || ""
      }
      setTimeout(() => {
        if (form && form.categoryId) {
          form.categoryId.value = editingProduct.categoryId || ""
        }
      }, 50)
      
      setSelectedCategoryId(editingProduct.categoryId || "")
      setCategorySearch(categories.find((c: any) => c.id === editingProduct.categoryId)?.name || "")
      
      setSelectedBrandId(editingProduct.brandId || "")
      setBrandSearch(brands.find((b: any) => b.id === editingProduct.brandId)?.name || "")
      setImageUrls(editingProduct.images?.length > 0 ? editingProduct.images.map((img: any) => img.url) : [])
      setIsFormVisible(true)

      // Populate selectedGlobalOptions
      const preselected: Record<string, string[]> = {}
      if (editingProduct.options) {
        editingProduct.options.forEach((opt: any) => {
          if (opt.systemOptionId) {
            const matchedGlobalOpt = globalOptions.find((g: any) => g.id === opt.systemOptionId || g.name === opt.name)
            if (matchedGlobalOpt) {
              preselected[matchedGlobalOpt.id] = (opt.values || []).map((v: any) => {
                const matchedGVal = matchedGlobalOpt.values.find((gv: any) => gv.label === v.label)
                return matchedGVal ? matchedGVal.id : null
              }).filter(Boolean)
            }
          }
        })
      }
      setSelectedGlobalOptions(preselected)
    }
  }, [editingProduct, brands, categories, globalOptions])

  function resetForm(keepSelections: boolean = false) {
    setEditingProduct(null)
    setImageUrls([])
    setSelectedGlobalOptions({})
    if (!keepSelections) {
      setSelectedBrandId("")
      setBrandSearch("")
      setSelectedCategoryId("")
      setCategorySearch("")
    }
    const form: any = document.getElementById("add-product-form")
    if (form) form.reset()
  }

  // Single Handlers
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.set("brandId", selectedBrandId)
    formData.set("categoryId", selectedCategoryId)
    
    let res;
    if (editingProduct) {
      res = await updateProduct(editingProduct.id, formData)
    } else {
      res = await createProduct(formData)
    }
    
    if (res.success && res.product) {
      // Sync global options selections
      await syncProductGlobalOptions(res.product.id, selectedGlobalOptions)
    }

    setIsSubmitting(false)
    if (res.success) {
      toast.success(editingProduct ? "تم تعديل المنتج بنجاح" : "تمت إضافة المنتج بنجاح")
      resetForm(!editingProduct) // Keep selections if it's a new product
      if (!editingProduct && res.product) {
        setLocalProducts(prev => [res.product, ...prev])
      } else if (editingProduct && res.product) {
        setLocalProducts(prev => prev.map(p => p.id === editingProduct.id ? res.product : p))
      }
    } else {
      toast.error(res.error || "حدث خطأ ما")
    }
  }

  async function confirmDelete() {
    if (!productToDelete) return
    const res = await deleteProduct(productToDelete)
    if (res.success) {
      toast.success("تم الحذف بنجاح")
      setLocalProducts(prev => prev.filter(p => p.id !== productToDelete))
    } else {
      toast.error(res.error || "حدث خطأ أثناء الحذف")
    }
    setDeleteModalOpen(false)
    setProductToDelete(null)
  }

  async function toggleStatus(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    // Optimistic UI update
    setLocalProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: newStatus } : p));
    
    const res = await toggleProductStatus(id, newStatus)
    if (res.success) {
      toast.success(currentStatus ? "تم إخفاء المنتج" : "تم تفعيل المنتج")
    } else {
      // Revert on failure
      setLocalProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: currentStatus } : p));
      toast.error("حدث خطأ أثناء التحديث")
    }
  }

  // Bulk Handlers
  function handleSelectAll() {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredProducts.map(p => p.id))
    }
  }

  function handleSelect(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    setConfirmState({
      isOpen: true,
      title: "حذف المنتجات",
      desc: `هل أنت متأكد من حذف ${selectedIds.length} منتج؟`,
      isDestructive: true,
      isLoading: false,
      action: async () => {
        setConfirmState(p => ({ ...p, isLoading: true }));
        const res = await bulkDeleteProducts(selectedIds)
        if (res.success) {
          toast.success(`تم حذف ${selectedIds.length} منتج بنجاح`)
          setLocalProducts(prev => prev.filter(p => !selectedIds.includes(p.id)))
          setSelectedIds([])
        } else {
          toast.error("فشل في الحذف الجماعي")
        }
        setConfirmState(p => ({ ...p, isOpen: false, isLoading: false }));
      }
    });
  }

  async function handleBulkToggleStatus(isActive: boolean) {
    const idsToUpdate = [...selectedIds];
    
    // Optimistic UI update
    setLocalProducts(prev => prev.map(p => idsToUpdate.includes(p.id) ? { ...p, isActive } : p))
    setSelectedIds([])
    
    const res = await bulkToggleProductsStatus(idsToUpdate, isActive)
    if (res.success) {
      toast.success(`تم ${isActive ? 'تفعيل' : 'إخفاء'} المنتجات المحددة`)
    } else {
      toast.error("فشل التحديث الجماعي")
    }
  }

  function openBulkEdit() {
    const toEdit = localProducts.filter(p => selectedIds.includes(p.id)).map(p => ({ ...p }))
    setBulkEditData(toEdit)
    setBulkEditOpen(true)
  }

  async function saveBulkEdit() {
    setIsBulkSubmitting(true)
    const res = await bulkUpdateProducts(bulkEditData)
    if (res.success) {
      toast.success("تم الحفظ الجماعي بنجاح")
      setLocalProducts(prev => prev.map(p => {
        const updated = bulkEditData.find(b => b.id === p.id)
        return updated ? { ...p, ...updated } : p
      }))
      setBulkEditOpen(false)
      setSelectedIds([])
    } else {
      toast.error("حدث خطأ أثناء الحفظ")
    }
    setIsBulkSubmitting(false)
  }

  // Excel Handlers
  async function handleExportExcel() {
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)

    if (filterBrand) params.set("brandId", filterBrand)
    if (filterCats.length > 0) params.set("categoryIds", filterCats.join(","))
    if (filterStatus !== "all") params.set("status", filterStatus)
    
    window.location.href = `/api/admin/export/products?${params.toString()}`
  }

  const [isImportModalOpen, setIsImportModalOpen] = useState(false)



  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-2">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>الرئيسية</span>
          <span>/</span>
          <span className="text-foreground">المنتجات</span>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportExcel}>
            <Download className="h-4 w-4" /> <span className="hidden sm:inline">تصدير</span>
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="h-4 w-4" /> <span className="hidden sm:inline">استيراد</span>
          </Button>
          
          {canEdit && (
            <Button onClick={() => {
              setBulkEditData(filteredProducts.map(p => ({ ...p })))
              setBulkEditOpen(true)
            }} variant="outline" className="gap-2">
              <Edit className="w-4 h-4" /> <span className="hidden sm:inline">تعديل سريع</span>
            </Button>
          )}
          {canAdd && (
            <Button onClick={() => setIsFormVisible(!isFormVisible)} className="gap-2 bg-[#2453E3] hover:opacity-90 text-white border-none">
              {isFormVisible ? <><X className="w-4 h-4" /> إلغاء</> : <><PlusCircle className="w-4 h-4" /> إضافة منتج</>}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث عن منتج بالاسم أو الرمز..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-transparent pr-10 pl-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="h-4 w-4" /> الفلاتر {showFilters ? '▲' : '▼'}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-2">
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-muted-foreground">الأقسام</label>
              <div
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm flex items-center justify-between cursor-pointer"
                onClick={() => setIsFilterCatDropdownOpen(!isFilterCatDropdownOpen)}
              >
                <span className="truncate">
                  {filterCats.length > 0 ? `تم تحديد ${filterCats.length}` : "الكل"}
                </span>
                <span className="text-muted-foreground text-xs">▼</span>
              </div>
              {isFilterCatDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-card border border-border/50 rounded-md shadow-lg z-50 p-2 space-y-1">
                  <label className="flex items-center gap-2 p-1.5 hover:bg-muted/50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterCats.length === 0}
                      onChange={() => { setFilterCats([]); setIsFilterCatDropdownOpen(false); }}
                      className="rounded border-input text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm">الكل</span>
                  </label>
                  {categories.map((c: any) => (
                    <label key={c.id} className={`flex items-center gap-2 p-1.5 hover:bg-muted/50 rounded cursor-pointer ${c.parentId ? 'mr-4' : ''}`}>
                      <input
                        type="checkbox"
                        checked={filterCats.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) setFilterCats([...filterCats, c.id]);
                          else setFilterCats(filterCats.filter((id: string) => id !== c.id));
                        }}
                        className="rounded border-input text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm">{c.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">الماركة</label>
              <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">الكل</option>
                {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">الحالة</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">الكل</option>
                <option value="active">مفعل</option>
                <option value="inactive">مخفي</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-muted/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 animate-in fade-in mb-4">
          <div className="text-sm font-medium text-foreground">تم تحديد {selectedIds.length} منتج</div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={openBulkEdit} className="h-8 gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border-none shadow-none">
                <Edit className="h-3.5 w-3.5" /> تعديل جماعي
              </Button>
            )}
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={() => handleBulkToggleStatus(true)} className="h-8 gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 border-none shadow-none">
                <Eye className="h-3.5 w-3.5" /> تفعيل
              </Button>
            )}
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={() => handleBulkToggleStatus(false)} className="h-8 gap-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 hover:text-yellow-800 border-none shadow-none">
                <EyeOff className="h-3.5 w-3.5" /> إخفاء
              </Button>
            )}
            {canDelete && (
              <Button variant="ghost" size="sm" onClick={handleBulkDelete} className="h-8 gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border-none shadow-none">
                <Trash2 className="h-3.5 w-3.5" /> حذف
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-start gap-8 relative">
        <div className="flex-1 w-full min-w-0">
          <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-muted/30 border-b border-border/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 w-10 text-center">
                      <button onClick={handleSelectAll} className="p-1 hover:text-foreground">
                        {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium">المنتج</th>
                    <th className="px-4 py-3 font-medium">القسم</th>
                    <th className="px-4 py-3 font-medium">السعر</th>
                    <th className="px-4 py-3 font-medium text-center">الحالة</th>
                    <th className="px-4 py-3 font-medium text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        لا توجد منتجات مسجلة مطابقة للبحث.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className={`transition-colors hover:bg-muted/10 ${selectedIds.includes(product.id) ? 'bg-primary/5' : ''}`}>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => handleSelect(product.id)} className="p-1 text-muted-foreground hover:text-foreground">
                            {selectedIds.includes(product.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 w-64 max-w-xs">
                          <div className="flex items-center gap-3">
                            {product.images && product.images.length > 0 ? (
                               <img src={product.images[0].url} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-border/50 shrink-0" />
                            ) : (
                               <div className="w-10 h-10 rounded-md bg-muted/20 flex items-center justify-center border border-border/50 shrink-0">
                                 <span className="text-muted-foreground text-[10px]">لا صورة</span>
                               </div>
                            )}
                            <div>
                              <div className="font-medium text-foreground line-clamp-1">{product.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5" dir="ltr">{product.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-blue-100 text-blue-700 font-medium">
                            {categories.find(c => c.id === product.categoryId)?.name || "بدون قسم"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {product.discountPrice ? (
                            <div className="flex flex-col">
                              <span className="text-red-500">{product.discountPrice} ج.م</span>
                              <span className="text-[10px] text-muted-foreground line-through">{product.price} ج.م</span>
                            </div>
                          ) : (
                            <span>{product.price} ج.م</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                           <Switch 
                             checked={product.isActive} 
                             onCheckedChange={() => toggleStatus(product.id, product.isActive)}
                             title="تفعيل / إخفاء المنتج"
                             disabled={!canEdit}
                           />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {canEdit && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setEditingProduct(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setProductToDelete(product.id); setDeleteModalOpen(true); }}>
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

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                <button onClick={handleSelectAll} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  <span>تحديد الكل</span>
                </button>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/5 rounded-lg border border-border/50">
                  لا توجد منتجات مسجلة مطابقة للبحث.
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className={`bg-card border border-border/50 rounded-lg p-4 shadow-sm flex flex-col gap-4 ${selectedIds.includes(product.id) ? 'ring-1 ring-primary border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-start gap-3">
                      <button onClick={() => handleSelect(product.id)} className="mt-1 p-1 text-muted-foreground hover:text-foreground shrink-0">
                        {selectedIds.includes(product.id) ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5" />}
                      </button>
                      
                      <div className="flex-1 flex gap-3 min-w-0">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0].url} alt={product.name} className="w-16 h-16 object-cover rounded-md border border-border/50 shrink-0" />
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center border border-border/50 shrink-0">
                            <span className="text-muted-foreground text-[10px]">لا صورة</span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-foreground text-sm line-clamp-2">{product.name}</div>
                          <div className="text-xs text-muted-foreground mt-1" dir="ltr">{product.sku}</div>
                          <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-medium">
                            {categories.find(c => c.id === product.categoryId)?.name || "بدون قسم"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="font-bold text-base">
                        {product.discountPrice ? (
                          <div className="flex flex-col">
                            <span className="text-red-500">{product.discountPrice} ج.م</span>
                            <span className="text-[10px] text-muted-foreground line-through font-normal">{product.price} ج.م</span>
                          </div>
                        ) : (
                          <span>{product.price} ج.م</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">الحالة:</span>
                        <Switch 
                          checked={product.isActive} 
                          onCheckedChange={() => toggleStatus(product.id, product.isActive)}
                          title="تفعيل / إخفاء المنتج"
                          disabled={!canEdit}
                        />
                      </div>
                    </div>

                    {(canEdit || canDelete) && (
                      <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                        {canEdit && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-muted-foreground hover:text-primary"
                            onClick={() => {
                              setEditingProduct(product);
                              if (window.innerWidth < 1024) {
                                document.getElementById('add-product-form')?.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                          >
                            <Edit className="h-4 w-4 ml-2" />
                            تعديل
                          </Button>
                        )}
                        {canDelete && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
                            onClick={() => {
                              setProductToDelete(product.id);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={`w-full lg:w-[420px] shrink-0 lg:sticky lg:top-4 order-first transition-all duration-300 ${!isFormVisible ? 'hidden lg:block' : 'block'}`}>
          <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]">
            <div className="border-b border-border/50 px-6 py-4 bg-muted/5 shrink-0 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</h2>
                <p className="text-xs text-muted-foreground mt-1">{editingProduct ? "تعديل بيانات المنتج المحدد" : "إضافة منتج سريعاً للمتجر."}</p>
              </div>
              <div className="flex items-center gap-2">

                {editingProduct && (
                  <Button variant="ghost" size="icon" onClick={() => resetForm(false)} className="h-8 w-8 shrink-0 text-muted-foreground">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4" id="add-product-form">
                <div className="space-y-2">
                  <MultiImageUploader value={imageUrls} onChange={setImageUrls} />
                  <input type="hidden" name="images" value={JSON.stringify(imageUrls)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">اسم المنتج <span className="text-red-500">*</span></label>
                    <input name="name" type="text" required className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-medium">القسم <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => {
                          setCategorySearch(e.target.value)
                          setIsCategoryDropdownOpen(true)
                          if (e.target.value === "") setSelectedCategoryId("")
                        }}
                        onFocus={() => setIsCategoryDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsCategoryDropdownOpen(false), 200)}
                        placeholder="ابحث أو اختر القسم..."
                        required={!selectedCategoryId}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      {isCategoryDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-card border border-border/50 rounded-md shadow-lg z-50 py-1">
                          {categories.filter(c => !c.parentId).map(mainCat => {
                            const subCats = categories.filter(c => c.parentId === mainCat.id)
                            const matchesMain = mainCat.name.toLowerCase().includes(categorySearch.toLowerCase())
                            const matchingSubs = subCats.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                            
                            if (!categorySearch) {
                              return (
                                <div key={mainCat.id}>
                                  <div className="px-3 py-1.5 text-sm font-semibold bg-muted/10 cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedCategoryId(mainCat.id); setCategorySearch(mainCat.name); setIsCategoryDropdownOpen(false); }}>
                                    {mainCat.name}
                                  </div>
                                  {subCats.map(subCat => (
                                    <div key={subCat.id} className="px-5 py-1.5 text-sm cursor-pointer hover:bg-muted/50 text-muted-foreground flex items-center gap-2" onClick={() => { setSelectedCategoryId(subCat.id); setCategorySearch(`${mainCat.name} > ${subCat.name}`); setIsCategoryDropdownOpen(false); }}>
                                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                                      {subCat.name}
                                    </div>
                                  ))}
                                </div>
                              )
                            }
                            
                            if (!matchesMain && matchingSubs.length === 0) return null;

                            return (
                              <div key={mainCat.id}>
                                {matchesMain && (
                                  <div className="px-3 py-1.5 text-sm font-semibold bg-muted/10 cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedCategoryId(mainCat.id); setCategorySearch(mainCat.name); setIsCategoryDropdownOpen(false); }}>
                                    {mainCat.name}
                                  </div>
                                )}
                                {matchingSubs.map(subCat => (
                                  <div key={subCat.id} className="px-5 py-1.5 text-sm cursor-pointer hover:bg-muted/50 text-muted-foreground flex items-center gap-2" onClick={() => { setSelectedCategoryId(subCat.id); setCategorySearch(`${mainCat.name} > ${subCat.name}`); setIsCategoryDropdownOpen(false); }}>
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                                    {subCat.name}
                                  </div>
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    <input type="hidden" name="categoryId" value={selectedCategoryId} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">السعر <span className="text-red-500">*</span></label>
                    <input name="price" type="number" step="0.01" required dir="ltr" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">سعر التخفيض <span className="text-muted-foreground text-[10px] font-normal">(اختياري)</span></label>
                    <input name="discountPrice" type="number" step="0.01" dir="ltr" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left" />
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-medium">الماركة <span className="text-muted-foreground text-[10px] font-normal">(اختياري)</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        value={brandSearch}
                        onChange={(e) => {
                          setBrandSearch(e.target.value)
                          setIsBrandDropdownOpen(true)
                          if (e.target.value === "") setSelectedBrandId("")
                        }}
                        onFocus={() => setIsBrandDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsBrandDropdownOpen(false), 200)}
                        placeholder="ابحث عن ماركة..."
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      {isBrandDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-card border border-border/50 rounded-md shadow-lg z-50">
                          <div className="px-3 py-2 text-sm cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedBrandId(""); setBrandSearch(""); setIsBrandDropdownOpen(false); }}>
                            بدون ماركة
                          </div>
                          {filteredBrands.map((brand: any) => (
                            <div key={brand.id} className="px-3 py-2 text-sm cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedBrandId(brand.id); setBrandSearch(brand.name); setIsBrandDropdownOpen(false); }}>
                              {brand.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <input type="hidden" name="brandId" value={selectedBrandId} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">المخزون</label>
                    <input name="stock" type="number" defaultValue={0} dir="ltr" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">الوصف</label>
                  <textarea name="description" rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                </div>

                {/* Global Options */}
                {globalOptions && globalOptions.length > 0 && (
                  <div className="pt-4 border-t border-border/50 space-y-4">
                    <h3 className="text-sm font-semibold tracking-tight">خيارات المتجر (اختياري)</h3>
                    {globalOptions.map((gOpt: any) => {
                      const translatedName = gOpt.name === 'Color' ? 'اللون' : 
                                            gOpt.name === 'Size' ? 'المقاس' : 
                                            gOpt.name === 'Material' ? 'الخامة' : 
                                            gOpt.name === 'Weight' ? 'الوزن' : 
                                            gOpt.name === 'Volume' ? 'الحجم' : 
                                            gOpt.name === 'Style' ? 'التصميم' : 
                                            gOpt.name === 'Capacity' ? 'السعة' :
                                            gOpt.name === 'Flavor' ? 'النكهة' :
                                            gOpt.name === 'Scent' ? 'الرائحة' :
                                            gOpt.name === 'Shape' ? 'الشكل' :
                                            gOpt.name;
                      return (
                        <div key={gOpt.id} className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">{translatedName}</label>
                          <div className="flex flex-wrap gap-2">
                            {gOpt.values.map((val: any) => {
                              const isSelected = selectedGlobalOptions[gOpt.id]?.includes(val.id)
                              return (
                                <button
                                  key={val.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedGlobalOptions(prev => {
                                      const current = prev[gOpt.id] || []
                                      const updated = isSelected ? current.filter(id => id !== val.id) : [...current, val.id]
                                      return { ...prev, [gOpt.id]: updated }
                                    })
                                  }}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${isSelected ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background text-muted-foreground border-border/50 hover:bg-muted'}`}
                                >
                                  {gOpt.dataType === 'COLOR' && (
                                    <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: val.value }} />
                                  )}
                                  {val.label}
                                </button>
                              )
                            })}
                            {gOpt.values.length === 0 && (
                              <span className="text-[10px] text-muted-foreground">لا يوجد قيم مسجلة</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Advanced Settings */}
                <div className="pt-2 border-t border-border/50">
                  <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <span className="font-medium">إعدادات إضافية</span>
                    <svg className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className={`grid grid-cols-2 gap-3 mt-4 animate-in fade-in slide-in-from-top-2 ${!showAdvanced ? 'hidden' : ''}`}>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">الرابط (Slug)</label>
                      <input name="slug" type="text" dir="ltr" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">الرمز (SKU)</label>
                      <input name="sku" type="text" dir="ltr" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base shadow-sm flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (editingProduct ? "تحديث المنتج" : "حفظ المنتج")}
                  </Button>
                </div>
              </form>

              {editingProduct && editingProduct.variants && editingProduct.variants.length > 0 && (
                <div className="mt-8 border-t border-border/50 pt-8 space-y-4">
                  <h3 className="text-sm font-semibold">متغيرات المنتج الحالية</h3>
                  <div className="border border-border/50 rounded-xl overflow-hidden bg-card">
                    <table className="w-full text-sm text-right">
                      <thead className="bg-muted/50 border-b border-border/50">
                        <tr>
                          <th className="px-4 py-2.5 font-medium">المتغير</th>
                          <th className="px-4 py-2.5 font-medium w-32">السعر</th>
                          <th className="px-4 py-2.5 font-medium w-32">المخزون</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {editingProduct.variants.map((variant: any) => (
                          <tr key={variant.id} className="hover:bg-muted/30">
                            <td className="px-4 py-2">
                              <div className="flex gap-1.5 flex-wrap">
                                {variant.selections.map((s: any) => (
                                  <Badge key={s.id} variant="secondary" className="text-[10px] h-5 px-1.5">{s.optionValue.label}</Badge>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <input 
                                type="number" 
                                defaultValue={variant.price || editingProduct.price} 
                                className="h-8 w-full rounded border border-input bg-background px-2 text-left" 
                                dir="ltr" 
                                onBlur={async (e) => {
                                  const val = parseFloat(e.target.value)
                                  if (!isNaN(val)) {
                                    const res = await updateProductVariant(variant.id, { price: val })
                                    if (res.success) toast.success("تم تحديث السعر للمتغير")
                                    else toast.error(res.error || "فشل التحديث")
                                  }
                                }}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input 
                                type="number" 
                                defaultValue={variant.stock} 
                                className="h-8 w-full rounded border border-input bg-background px-2 text-left" 
                                dir="ltr" 
                                onBlur={async (e) => {
                                  const val = parseInt(e.target.value)
                                  if (!isNaN(val)) {
                                    const res = await updateProductVariant(variant.id, { stock: val })
                                    if (res.success) toast.success("تم تحديث المخزون للمتغير")
                                    else toast.error(res.error || "فشل التحديث")
                                  }
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="حذف المنتج"
        description="هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      <ImportProductsModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSuccess={() => {
          setIsImportModalOpen(false);
          router.refresh();
        }} 
        categories={categories} 
        brands={brands} 
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-card border-t border-border/50 rounded-b-xl">
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

      {/* Bulk Edit Modal */}
      {bulkEditOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-5xl rounded-xl shadow-lg border border-border/50 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold">تعديل جماعي سريع ({bulkEditData.length} منتجات)</h2>
              <Button variant="ghost" size="icon" onClick={() => setBulkEditOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            
            <div className="p-4 overflow-auto flex-1 bg-muted/10">
              <div className="min-w-[800px]">
                <table className="w-full text-sm text-right">
                  <thead className="bg-muted/50 border-b border-border/50 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium w-[25%]">اسم المنتج</th>
                      <th className="px-3 py-2 font-medium w-[15%]">السعر (ج.م)</th>
                      <th className="px-3 py-2 font-medium w-[15%]">المخزون</th>
                      <th className="px-3 py-2 font-medium w-[20%]">القسم</th>
                      <th className="px-3 py-2 font-medium w-[15%]">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {bulkEditData.map((item, index) => (
                      <tr key={item.id} className="bg-background">
                        <td className="px-3 py-2">
                          <input 
                            value={item.name} 
                            onChange={e => {
                              const newData = [...bulkEditData]
                              newData[index].name = e.target.value
                              setBulkEditData(newData)
                            }}
                            className="w-full h-8 px-2 border border-input rounded text-sm focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input 
                            type="number" step="0.01" dir="ltr"
                            value={item.price} 
                            onChange={e => {
                              const newData = [...bulkEditData]
                              newData[index].price = parseFloat(e.target.value) || 0
                              setBulkEditData(newData)
                            }}
                            className="w-full h-8 px-2 border border-input rounded text-sm focus:ring-1 focus:ring-primary text-left"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input 
                            type="number" dir="ltr"
                            value={item.stock} 
                            onChange={e => {
                              const newData = [...bulkEditData]
                              newData[index].stock = parseInt(e.target.value) || 0
                              setBulkEditData(newData)
                            }}
                            className="w-full h-8 px-2 border border-input rounded text-sm focus:ring-1 focus:ring-primary text-left"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select 
                            value={item.categoryId}
                            onChange={e => {
                              const newData = [...bulkEditData]
                              newData[index].categoryId = e.target.value
                              setBulkEditData(newData)
                            }}
                            className="w-full h-8 px-2 border border-input rounded text-sm focus:ring-1 focus:ring-primary"
                          >
                            <option value="">اختر القسم...</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Switch 
                            checked={item.isActive} 
                            onCheckedChange={val => {
                              const newData = [...bulkEditData]
                              newData[index].isActive = val
                              setBulkEditData(newData)
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-4 border-t border-border/50 flex justify-end gap-3 bg-background">
              <Button variant="outline" onClick={() => setBulkEditOpen(false)}>إلغاء</Button>
              <Button onClick={saveBulkEdit} disabled={isBulkSubmitting} className="min-w-[120px] gap-2">
                {isBulkSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> حفظ التعديلات</>}
              </Button>
            </div>
          </div>
        </div>, document.body
      )}

      <ConfirmModal 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        description={confirmState.desc}
        isDestructive={confirmState.isDestructive}
        isLoading={confirmState.isLoading}
        onConfirm={() => confirmState.action && confirmState.action()}
        onCancel={() => setConfirmState(p => ({ ...p, isOpen: false }))}
      />

    </div>
  )
}
