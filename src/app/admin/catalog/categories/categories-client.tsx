"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2, Folder, PlusCircle, X, Loader2, ChevronDown, ChevronLeft } from "lucide-react"
import { createCategory, deleteCategory, updateCategory, bulkUpdateCategories } from "@/features/categories/actions"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { ImageUploader } from "@/components/ui/image-uploader"
import { usePermissions } from "@/hooks/use-permissions"

export function CategoriesClient({ categories }: { categories: any[] }) {
  const { hasPermission } = usePermissions()
  const canAdd = hasPermission("categories.add")
  const canEdit = hasPermission("categories.edit")
  const canDelete = hasPermission("categories.delete")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [categoryType, setCategoryType] = useState<"main" | "sub">("main")
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  
  // Local state for optimistic updates
  const [localCategories, setLocalCategories] = useState(categories)

  const [parentSearch, setParentSearch] = useState("")
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false)
  const [selectedParentId, setSelectedParentId] = useState("")

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    if (editingCategory) {
      setTimeout(() => {
        const form: any = document.getElementById("add-category-form")
        if (form) {
          if (form.name) form.name.value = editingCategory.name || ""
          if (form.slug) form.slug.value = editingCategory.slug || ""
          if (form.description) form.description.value = editingCategory.description || ""
          setImageUrl(editingCategory.imageUrl || "")
          
          // Handle radio buttons and parent selection
          const isSub = !!editingCategory.parentId
          if (form.categoryType) form.categoryType.value = isSub ? "sub" : "main"
          
          const pId = editingCategory.parentId || ""
          setSelectedParentId(pId)
          setParentSearch(categories.find((c: any) => c.id === pId)?.name || "")


        }
      }, 0);
      setIsFormVisible(true)
      setCategoryType(editingCategory.parentId ? "sub" : "main")
    }
  }, [editingCategory])

  function resetForm() {
    setEditingCategory(null)
    setImageUrl("")
    const form: any = document.getElementById("add-category-form")
    if (form) {
      form.reset()
      form.categoryType.value = "main"
      setSelectedParentId("")
      setParentSearch("")

    }
  }

  function handleAddCategoryClick() {
    if (isFormVisible && !editingCategory) {
      setIsFormVisible(false)
    } else {
      resetForm()
      setIsFormVisible(true)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.set("imageUrl", imageUrl)
    if (categoryType === "main") {
      formData.delete("parentId")
    }
    
    let res;
    if (editingCategory) {
      res = await updateCategory(editingCategory.id, formData)
    } else {
      res = await createCategory(formData)
    }
    setIsSubmitting(false)
    
    if (res.success) {
      toast.success(editingCategory ? "تم تعديل القسم بنجاح" : "تم إنشاء القسم بنجاح")
      resetForm()
    } else {
      toast.error(res.error || "حدث خطأ ما")
    }
  }

  async function confirmDelete() {
    if (!categoryToDelete) return
    const res = await deleteCategory(categoryToDelete)
    if (res.success) {
      toast.success("تم الحذف بنجاح")
      setLocalCategories(prev => prev.filter(c => c.id !== categoryToDelete))
    } else {
      toast.error(res.error || "حدث خطأ أثناء الحذف")
    }
    setDeleteModalOpen(false)
    setCategoryToDelete(null)
  }

  async function toggleStatus(category: any) {
    if (!canEdit) return
    const newStatus = !category.isActive
    // Optimistic update
    setLocalCategories(prev => prev.map(c => c.id === category.id ? { ...c, isActive: newStatus } : c))
    
    const formData = new FormData()
    formData.append("isActive", newStatus.toString())
    const res = await updateCategory(category.id, formData)
    
    if (!res.success) {
      toast.error("حدث خطأ أثناء التحديث")
      // Revert
      setLocalCategories(prev => prev.map(c => c.id === category.id ? { ...c, isActive: !newStatus } : c))
    }
  }

  function handleSelect(id: string, isParent: boolean) {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id))
      return
    }

    if (selectedIds.length > 0) {
      const firstSelectedId = selectedIds[0]
      const firstSelected = localCategories.find(c => c.id === firstSelectedId)
      const firstIsParent = !firstSelected?.parentId

      if (isParent !== firstIsParent) {
        toast.error("لا يمكن تحديد أقسام رئيسية وفرعية معاً في نفس الوقت")
        return
      }
    }
    setSelectedIds(prev => [...prev, id])
  }

  function handleSelectAll() {
    if (selectedIds.length === filteredCategories.length && filteredCategories.length > 0) {
      setSelectedIds([])
      return
    }
    
    if (filteredCategories.length === 0) return

    // We can only select all if they are all of the same type, or we just select the type of the first one
    const firstIsParent = !filteredCategories[0].parentId
    const selectableIds = filteredCategories
      .filter(c => (!c.parentId) === firstIsParent)
      .map(c => c.id)

    setSelectedIds(selectableIds)
    if (selectableIds.length < filteredCategories.length) {
      toast.info("تم تحديد الأقسام من نفس النوع فقط")
    }
  }

  async function executeBulkUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedIds.length) return

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data: any = {}
    
    if (formData.has("parentId")) {
      data.parentId = formData.get("parentId") as string
    }

    const res = await bulkUpdateCategories(selectedIds, data)
    setIsSubmitting(false)
    
    if (res.success) {
      toast.success("تم التحديث بنجاح")
      setIsBulkModalOpen(false)
      setSelectedIds([])
      // Optimistic update
      setLocalCategories(prev => prev.map(c => {
        if (selectedIds.includes(c.id)) {
          return { ...c, ...data }
        }
        return c
      }))
    } else {
      toast.error(res.error || "حدث خطأ ما")
    }
  }



  const truncateText = (text: string, maxWords: number = 3) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(" ") + "...";
    }
    return text;
  };

  const getProductCount = (category: any) => {
    let count = category._count?.products || 0;
    if (!category.parentId) {
      const subs = localCategories.filter(c => c.parentId === category.id);
      subs.forEach(sub => { count += (sub._count?.products || 0); });
    }
    return count;
  };

  // First apply filters
  let filteredCategories = localCategories.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false



    return true
  })

  // Hierarchical sorting: Group main categories and their subs
  if (!searchQuery) {
    const mainCategories = filteredCategories.filter(c => !c.parentId)
    const sorted: any[] = []
    
    mainCategories.forEach(main => {
      sorted.push(main)
      const subs = filteredCategories.filter(c => c.parentId === main.id)
      sorted.push(...subs)
    })
    
    // Add any orphans just in case
    const handledIds = new Set(sorted.map(c => c.id))
    filteredCategories.forEach(c => {
      if (!handledIds.has(c.id)) sorted.push(c)
    })
    
    filteredCategories = sorted
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>الرئيسية</span>
          <span>/</span>
          <span className="text-foreground">الأقسام</span>
        </nav>
        <div className="flex items-center gap-3 lg:hidden">
           {canAdd && (
             <Button onClick={handleAddCategoryClick} className="gap-2">
               <PlusCircle className="h-4 w-4" />
               {isFormVisible ? "إخفاء النموذج" : "إضافة قسم"}
             </Button>
           )}
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-8 relative">
        
        {/* Main Table Column (Left in RTL) */}
        <div className="flex-1 w-full">
          <div className="rounded-xl border border-border/50 bg-background shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-border/50 p-4">
              <div className="relative flex-1 w-full sm:max-w-xs">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="ابحث عن قسم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-transparent pr-10 pl-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

            </div>
            
            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
              <div className="bg-primary/5 border-b border-border/50 p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">{selectedIds.length}</span>
                  عنصر محدد
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-primary/20 text-primary hover:bg-primary/10"
                    onClick={() => setIsBulkModalOpen(true)}
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    تغيير القسم الرئيسي
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedIds([])}
                  >
                    إلغاء التحديد
                  </Button>
                </div>
              </div>
            )}

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="border-b border-border/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 w-12">
                      <input 
                        type="checkbox" 
                        className="rounded border-input text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                        checked={selectedIds.length > 0 && selectedIds.length === filteredCategories.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-4 font-medium">اسم القسم</th>
                    <th className="px-6 py-4 font-medium">القسم الرئيسي</th>
                    <th className="px-6 py-4 font-medium">المنتجات</th>
                    <th className="px-6 py-4 font-medium text-center">الحالة</th>
                    <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        {searchQuery ? "لا توجد نتائج بحث مطابقة." : "لا توجد أقسام مسجلة. قم بالإضافة من القائمة الجانبية."}
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((category) => {
                      const isParent = !category.parentId;
                      if (category.parentId && !expandedCategories.has(category.parentId) && !searchQuery) {
                        return null;
                      }
                      const disabledCheck = selectedIds.length > 0 && isParent !== (!localCategories.find(c => c.id === selectedIds[0])?.parentId)

                      return (
                      <tr key={category.id} className={`transition-colors hover:bg-muted/50 ${selectedIds.includes(category.id) ? 'bg-primary/5' : ''} ${!category.parentId && !selectedIds.includes(category.id) ? 'bg-muted/30' : ''}`}>
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox" 
                            className="rounded border-input text-primary focus:ring-primary w-4 h-4 cursor-pointer disabled:opacity-50"
                            checked={selectedIds.includes(category.id)}
                            onChange={() => handleSelect(category.id, isParent)}
                            disabled={disabledCheck}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-3 ${category.parentId ? 'mr-6' : ''}`}>
                            {category.parentId && (
                              <div className="w-4 h-4 border-b-2 border-r-2 border-muted-foreground/30 rounded-br-sm -mt-4 ml-1"></div>
                            )}
                            {category.imageUrl ? (
                              <img src={category.imageUrl} alt={category.name} className="h-8 w-8 rounded object-cover border border-border" />
                            ) : (
                              <Folder className={`h-5 w-5 ${category.parentId ? 'text-muted-foreground/60' : 'text-primary/60'}`} />
                            )}
                            <span className={`font-medium ${category.parentId ? 'text-muted-foreground' : 'text-foreground'}`}>{category.name}</span>
                            {!category.parentId && localCategories.some(c => c.parentId === category.id) && (
                              <button onClick={(e) => toggleExpand(category.id, e)} className="p-1 hover:bg-muted rounded-full transition-colors mr-1">
                                {expandedCategories.has(category.id) ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {category.parent ? (
                            <span className="text-muted-foreground">{category.parent.name}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {getProductCount(category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center flex justify-center items-center">
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={category.isActive}
                              disabled={!canEdit}
                              onChange={() => toggleStatus(category)}
                            />
                            <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2453E3] disabled:opacity-50"></div>
                          </label>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {canEdit && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => setEditingCategory(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                  setCategoryToDelete(category.id)
                                  setDeleteModalOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/5 rounded-lg border border-border/50">
                  {searchQuery ? "لا توجد نتائج بحث مطابقة." : "لا توجد أقسام مسجلة. قم بالإضافة من القائمة الجانبية."}
                </div>
              ) : (
                filteredCategories.map((category) => {
                  const isParent = !category.parentId;
                  if (category.parentId && !expandedCategories.has(category.parentId) && !searchQuery) {
                    return null;
                  }
                  const disabledCheck = selectedIds.length > 0 && isParent !== (!localCategories.find(c => c.id === selectedIds[0])?.parentId)

                  return (
                  <div key={category.id} className={`bg-card border border-border/50 rounded-lg p-4 shadow-sm flex flex-col gap-4 ${category.parentId ? 'mr-4 relative' : ''} ${selectedIds.includes(category.id) ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : ''}`}>
                    {category.parentId && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-full border-r-2 border-muted-foreground/20 rounded-r-lg"></div>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="rounded border-input text-primary focus:ring-primary w-5 h-5 cursor-pointer shrink-0 disabled:opacity-50"
                          checked={selectedIds.includes(category.id)}
                          onChange={() => handleSelect(category.id, isParent)}
                          disabled={disabledCheck}
                        />
                        {category.imageUrl ? (
                          <img src={category.imageUrl} alt={category.name} className="h-12 w-12 rounded-lg object-cover border border-border" />
                        ) : (
                          <div className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center ${category.parentId ? 'opacity-70' : ''}`}>
                            <Folder className={`h-6 w-6 ${category.parentId ? 'text-muted-foreground/60' : 'text-primary/60'}`} />
                          </div>
                        )}
                        <div>
                          <h3 className={`font-semibold text-base ${category.parentId ? 'text-muted-foreground' : 'text-foreground'}`}>{category.name}</h3>
                          {!category.parentId && localCategories.some(c => c.parentId === category.id) && (
                            <button onClick={(e) => toggleExpand(category.id, e)} className="flex items-center gap-1 mt-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                              {expandedCategories.has(category.id) ? (
                                <>
                                  <span>إخفاء الأقسام الفرعية</span>
                                  <ChevronDown className="h-3 w-3" />
                                </>
                              ) : (
                                <>
                                  <span>عرض الأقسام الفرعية</span>
                                  <ChevronLeft className="h-3 w-3" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={category.isActive}
                            disabled={!canEdit}
                            onChange={() => toggleStatus(category)}
                          />
                          <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2453E3] disabled:opacity-50"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-sm">
                      <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                        <span className="text-muted-foreground text-xs">الرئيسي:</span>
                        <span className="font-medium text-xs">
                          {category.parent ? category.parent.name : "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                        <span className="text-muted-foreground text-xs">المنتجات:</span>
                        <span className="font-medium text-xs text-primary">{getProductCount(category)}</span>
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
                              setEditingCategory(category);
                              if (window.innerWidth < 1024) {
                                document.getElementById('add-category-form')?.scrollIntoView({ behavior: 'smooth' });
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
                              setCategoryToDelete(category.id)
                              setDeleteModalOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )})
              )}
            </div>
          </div>
        </div>

        {/* Sticky Form Column (Right in RTL) */}
        {(canAdd || editingCategory) && (
          <div className={`w-full lg:w-[400px] shrink-0 lg:sticky lg:top-24 order-first transition-all duration-300 ${!isFormVisible ? 'hidden lg:block' : 'block'}`}>
            <div className="rounded-xl border border-border/50 bg-background shadow-sm overflow-hidden">
            <div className="border-b border-border/50 px-6 py-4 bg-muted/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{editingCategory ? "تعديل القسم" : "إضافة قسم جديد"}</h2>
                <p className="text-xs text-muted-foreground mt-1">{editingCategory ? "تعديل بيانات القسم المحدد" : "تعبئة البيانات للإضافة السريعة."}</p>
              </div>
              {editingCategory && (
                <Button variant="ghost" size="icon" onClick={resetForm} className="h-8 w-8 shrink-0 text-muted-foreground">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6" id="add-category-form">
                
                <div className="flex justify-center mb-4">
                  <div className="w-32">
                    <ImageUploader 
                      label="صورة القسم" 
                      value={imageUrl} 
                      onChange={setImageUrl} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم القسم <span className="text-red-500">*</span></label>
                  <input 
                    name="name"
                    type="text" 
                    required
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="مثال: العسل الجبلي"
                    onBlur={async (e) => {
                      if (!editingCategory && e.target.value) {
                        const form = document.getElementById("add-category-form") as any;
                        if (form && form.slug && !form.slug.value) {
                          try {
                            const res = await fetch("/api/translate", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ text: e.target.value })
                            });
                            const data = await res.json();
                            if (data.translated && form.slug) {
                              form.slug.value = data.translated;
                            }
                          } catch (err) {}
                        }
                      }
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">نوع القسم <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="categoryType" 
                        value="main" 
                        checked={categoryType === "main"}
                        className="text-primary focus:ring-primary"
                        onChange={() => setCategoryType("main")}
                      />
                      <span className="text-sm">قسم رئيسي</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="categoryType" 
                        value="sub"
                        checked={categoryType === "sub"} 
                        className="text-primary focus:ring-primary"
                        onChange={() => setCategoryType("sub")}
                      />
                      <span className="text-sm">قسم فرعي</span>
                    </label>
                  </div>
                </div>

                {categoryType === "sub" && (
                  <div className="space-y-2 relative">
                    <label className="text-sm font-medium">اختر القسم الرئيسي</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={parentSearch}
                        onChange={(e) => {
                          setParentSearch(e.target.value)
                          setIsParentDropdownOpen(true)
                          if (e.target.value === "") setSelectedParentId("")
                        }}
                        onFocus={() => setIsParentDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsParentDropdownOpen(false), 200)}
                        placeholder="ابحث أو اختر القسم..."
                        required={!selectedParentId}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      {isParentDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-card border border-border/50 rounded-md shadow-lg z-50 py-1">
                          {categories
                            .filter((c: any) => !c.parentId && c.id !== editingCategory?.id && c.name.toLowerCase().includes(parentSearch.toLowerCase()))
                            .map((cat: any) => (
                              <div key={cat.id} className="px-3 py-2 text-sm cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedParentId(cat.id); setParentSearch(cat.name); setIsParentDropdownOpen(false); }}>
                                {cat.name}
                              </div>
                            ))
                          }
                          {categories.filter((c: any) => !c.parentId && c.id !== editingCategory?.id && c.name.toLowerCase().includes(parentSearch.toLowerCase())).length === 0 && (
                            <div className="px-3 py-2 text-sm text-muted-foreground">لا يوجد قسم مطابق</div>
                          )}
                        </div>
                      )}
                    </div>
                    <input type="hidden" name="parentId" value={selectedParentId} />
                  </div>
                )}



                <div className="space-y-2 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
                    <span className="text-sm font-medium text-muted-foreground">إعدادات متقدمة</span>
                    <svg className={`w-4 h-4 text-muted-foreground transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className={showAdvanced ? "pt-2" : "hidden"}>
                    <label className="text-sm font-medium">الرابط الدائم (Slug)</label>
                    <input 
                      name="slug"
                      type="text" 
                      dir="ltr"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-left mt-2"
                      placeholder="يترك فارغاً للتوليد التلقائي"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-10 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingCategory ? "تحديث القسم" : "حفظ القسم")}
                </Button>
              </form>
            </div>
          </div>
        </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="حذف القسم"
        description="هل أنت متأكد من حذف هذا القسم؟ إذا كان يحتوي على منتجات قد تتأثر بذلك."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* Bulk Update Modal */}
      {isBulkModalOpen && selectedIds.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl border border-border shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                تغيير القسم الرئيسي
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsBulkModalOpen(false)} className="h-8 w-8 text-muted-foreground">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={executeBulkUpdate} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  اختر القسم الأب الجديد
                </label>
                  <select 
                    name="parentId"
                    required
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                  >
                    <option value="">اختر القسم الأب...</option>
                    {categories.filter(c => !c.parentId && !selectedIds.includes(c.id)).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
              </div>
              
              <div className="flex items-center gap-3 justify-end pt-4 border-t border-border/50">
                <Button type="button" variant="outline" onClick={() => setIsBulkModalOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-[100px]">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ التغييرات"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
