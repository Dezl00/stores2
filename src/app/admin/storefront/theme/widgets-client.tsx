"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, GripVertical, Settings2, Trash2, Eye, EyeOff, LayoutTemplate, Image as ImageIcon, ShoppingBag, ShoppingCart, AlignLeft, ChevronRight, X, ImagePlus, Loader2, ShieldCheck, BookOpen, Award } from "lucide-react"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { createWidget, deleteWidget, updateWidgetOrder, updateWidget, createWidgetContentItem, deleteWidgetContentItem, updateWidgetContentItem, updateWidgetContentItemOrder } from "@/features/widget-builder/actions"
import { ImageUploader } from "@/components/ui/image-uploader"
import { ProductPickerModal } from "@/components/admin/product-picker-modal"
import { getCollectionProducts, getCategories, getCollections, getProducts } from "@/features/widget-builder/actions"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/use-permissions"

const WIDGET_TYPES = [
  { id: "HeroSlider", name: "شريط صور", icon: ImageIcon, desc: "شريط صور متحرك أعلى الصفحة" },
  { id: "PromoBanner", name: "شريط إعلاني (مؤقت)", icon: LayoutTemplate, desc: "شريط إعلاني مع عداد تنازلي وخلفية" },
  { id: "MarqueeAlerts", name: "شريط تنبيهات متحرك", icon: AlignLeft, desc: "شريط نصوص متحركة للإعلانات" },
  { id: "PromoBentoGrid", name: "صور إعلانية (Bento)", icon: ImagePlus, desc: "شبكة صور إعلانية بأحجام متنوعة" },
  { id: "ProductList", name: "قائمة منتجات", icon: ShoppingCart, desc: "عرض مجموعة من المنتجات في قائمة" },
  { id: "BrandSlider", name: "سلايدر شعارات", icon: ImagePlus, desc: "شريط متحرك لعرض الشعارات أو الشركاء" },
  { id: "CategoryGrid", name: "شبكة الأقسام", icon: LayoutTemplate, desc: "عرض الأقسام الرئيسية كشبكة صور" },
  { id: "TextBlock", name: "نص مخصص", icon: AlignLeft, desc: "مساحة لكتابة نص ترحيبي أو معلومات" },
  { id: "AboutUs", name: "من نحن", icon: AlignLeft, desc: "نبذة تعريفية عن الشركة وتاريخها" },
  { id: "ValuesSlider", name: "قيمنا (سلايدر)", icon: ImageIcon, desc: "سلايدر متحرك لعرض قيم ومميزات الشركة" },
  { id: "StoreFeatures", name: "مميزات المتجر", icon: ShieldCheck, desc: "عرض مميزات المتجر مثل الشحن السريع وضمان الجودة" },
  { id: "FeaturedProduct", name: "منتج مميز", icon: ShoppingBag, desc: "عرض منتج واحد بتصميم بارز" },
  { id: "LatestArticles", name: "أحدث المقالات", icon: BookOpen, desc: "عرض أحدث المقالات من المدونة" },]

export function WidgetsClient({ initialWidgets, categories }: { initialWidgets: any[], categories: any[] }) {
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission("widgets.edit")

  const [widgets, setWidgets] = useState(initialWidgets)
  
  const [activeTab, setActiveTab] = useState<"add" | "edit">("add")
  const [editingWidget, setEditingWidget] = useState<any | null>(null)
  const [widgetToDelete, setWidgetToDelete] = useState<string | null>(null)
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null)
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [newItemImage, setNewItemImage] = useState("")
  const [newItemMobileImage, setNewItemMobileImage] = useState("")
  const [aboutUsImage, setAboutUsImage] = useState("")
  const [featuredProductId, setFeaturedProductId] = useState("")

  const [productPickerOpen, setProductPickerOpen] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

  const [isDeleting, setIsDeleting] = useState(false)

  const [collections, setCollections] = useState<any[]>([])
  
  // BannerGrid routing states
  const [linkType, setLinkType] = useState("custom")
  const [linkValue, setLinkValue] = useState("")
  
  // HeroSlider states
  const [btnBgColor, setBtnBgColor] = useState("primary")
  const [btnTextColor, setBtnTextColor] = useState("white")

  React.useEffect(() => {
    getCollections().then(setCollections)
  }, [])

  React.useEffect(() => {
    if (editingWidget?.type === "AboutUs") {
      setAboutUsImage(editingWidget.settings?.image || "")
    } else if (editingWidget?.type === "FeaturedProduct") {
      setFeaturedProductId(editingWidget.settings?.productId || "")
    }
  }, [editingWidget?.id])

  // Drag and Drop handlers
  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedWidgetId(id)
    e.dataTransfer.effectAllowed = "move"
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    if (draggedWidgetId === id || !draggedWidgetId) return

    const draggedIndex = widgets.findIndex(w => w.id === draggedWidgetId)
    const hoverIndex = widgets.findIndex(w => w.id === id)

    const newWidgets = [...widgets]
    const [draggedWidget] = newWidgets.splice(draggedIndex, 1)
    newWidgets.splice(hoverIndex, 0, draggedWidget)

    setWidgets(newWidgets)
  }

  async function handleDrop() {
    setDraggedWidgetId(null)
    const updates = widgets.map((w, index) => ({ id: w.id, sortOrder: index }))
    const res = await updateWidgetOrder(updates)
    if (!res.success) {
      toast.error("فشل في حفظ ترتيب الواجهات")
    } else {
      toast.success("تم تحديث ترتيب الواجهات")
    }
  }

  // Actions
  async function handleAddWidget(type: string) {
    setIsSubmitting(true)
    const res = await createWidget({ type, sortOrder: widgets.length, status: true, showDesktop: true, showTablet: true, showMobile: true, title: WIDGET_TYPES.find(w => w.id === type)?.name })
    setIsSubmitting(false)
    
    if (res.success) {
      const newWidget = { ...res.widget, items: [] }
      setWidgets([...widgets, newWidget])
      toast.success("تمت إضافة الواجهة بنجاح")
      setEditingWidget(newWidget)
      setActiveTab("edit")
    } else {
      toast.error("حدث خطأ أثناء الإضافة")
    }
  }

  async function confirmDelete() {
    if (!widgetToDelete) return
    setIsDeleting(true)
    const res = await deleteWidget(widgetToDelete)
    if (res.success) {
      setWidgets(widgets.filter(w => w.id !== widgetToDelete))
      toast.success("تم الحذف بنجاح")
      if (editingWidget?.id === widgetToDelete) {
        setEditingWidget(null)
        setActiveTab("add")
      }
    } else {
      toast.error("فشل في الحذف")
    }
    setIsDeleting(false)
    setWidgetToDelete(null)
  }

  async function saveWidgetSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingWidget) return
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    const data: any = {
      title: formData.get("title") as string,
      status: formData.get("status") === "on",
      showDesktop: formData.get("showDesktop") === "on",
      showMobile: formData.get("showMobile") === "on",
    }

    
    if (editingWidget.type === "PromoBanner") {
      data.settings = {
        timerEndDate: formData.get("timerEndDate") as string,
        backgroundColor: formData.get("backgroundColor") as string || "#2453E3",
        overlayOpacity: parseInt(formData.get("overlayOpacity") as string || "50"),
        backgroundImage: formData.get("backgroundImage") as string
      }
    }
    if (editingWidget.type === "MarqueeAlerts") {
      data.settings = {
        scrollDirection: formData.get("scrollDirection") as string || "right",
        backgroundColor: formData.get("backgroundColor") as string || "#000000",
        textColor: formData.get("textColor") as string || "#ffffff"
      }
    }
    if (editingWidget.type === "AboutUs") {
      data.settings = {
        content: formData.get("content") as string,
        visionTitle: formData.get("visionTitle") as string,
        visionContent: formData.get("visionContent") as string,
        missionTitle: formData.get("missionTitle") as string,
        missionContent: formData.get("missionContent") as string,
        image: formData.get("image") as string,
      }
    }
    
    if (editingWidget.type === "BrandSlider") {
      data.settings = {
        disableRouting: formData.get("disableRouting") === "on",
      }
    }
    
    if (editingWidget.type === "BannerGrid") {
      const opacityRaw = formData.get("overlayOpacity") as string;
      const parsedOpacity = parseInt(opacityRaw);
      
      data.settings = {
        textPosition: formData.get("textPosition") as string || "bottom",
        textAlign: formData.get("textAlign") as string || "center",
        overlayEnabled: formData.get("overlayEnabled") === "on",
        overlayOpacity: isNaN(parsedOpacity) ? 40 : parsedOpacity,
      }
    }

    if (editingWidget.type === "ProductList") {
      data.settings = {
        displayMode: formData.get("displayMode") as string || "grid",
      }
    }

    if (editingWidget.type === "FeaturedProduct") {
      data.settings = {
        productId: featuredProductId
      }
    }

    const res = await updateWidget(editingWidget.id, data)
    setIsSubmitting(false)
    
    if (res.success) {
      setWidgets(widgets.map(w => w.id === editingWidget.id ? { ...w, ...data } : w))
      toast.success("تم حفظ الإعدادات")
    }
  }

  async function handleToggleWidget(widget: any) {
    const newStatus = !widget.status;
    setWidgets(widgets.map(w => w.id === widget.id ? { ...w, status: newStatus } : w));
    if (editingWidget?.id === widget.id) {
      setEditingWidget({ ...editingWidget, status: newStatus });
    }
    
    const res = await updateWidget(widget.id, { status: newStatus });
    if (res.success) {
      toast.success(newStatus ? "تم تفعيل الواجهة" : "تم إلغاء تفعيل الواجهة");
    } else {
      setWidgets(widgets.map(w => w.id === widget.id ? { ...w, status: !newStatus } : w));
      if (editingWidget?.id === widget.id) {
        setEditingWidget({ ...editingWidget, status: !newStatus });
      }
      toast.error("حدث خطأ أثناء تغيير حالة الواجهة");
    }
  }

  // Item Drag and Drop handlers
  function handleItemDragStart(e: React.DragEvent, id: string) {
    setDraggedItemId(id)
    e.dataTransfer.effectAllowed = "move"
  }

  function handleItemDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    if (draggedItemId === id || !draggedItemId || !editingWidget) return

    const items = [...(editingWidget.items || [])]
    const draggedIndex = items.findIndex(i => i.id === draggedItemId)
    const hoverIndex = items.findIndex(i => i.id === id)

    const [draggedItem] = items.splice(draggedIndex, 1)
    items.splice(hoverIndex, 0, draggedItem)

    setEditingWidget({ ...editingWidget, items })
  }

  async function handleItemDrop() {
    setDraggedItemId(null)
    if (!editingWidget || !editingWidget.items) return

    const updates = editingWidget.items.map((i: any, index: number) => ({ id: i.id, sortOrder: index }))
    const res = await updateWidgetContentItemOrder(updates)
    if (!res.success) {
      toast.error("فشل في حفظ ترتيب العناصر")
    } else {
      toast.success("تم تحديث الترتيب")
      setWidgets(widgets.map(w => w.id === editingWidget.id ? editingWidget : w))
    }
  }

  async function handleAddContentItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingWidget) return
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.set("desktopImage", newItemImage)
    formData.set("mobileImage", newItemMobileImage)
    
    if (selectedProductIds.length > 0) {
      formData.append("productIds", JSON.stringify(selectedProductIds))
    }

    if (editingWidget.type === "BannerGrid" || editingWidget.type === "HeroSlider" || editingWidget.type === "PromoBentoGrid" || editingWidget.type === "MarqueeAlerts") {
      let finalUrl = linkValue;
      if (linkType === "category") finalUrl = `/category/${linkValue}`;
      else if (linkType === "product") finalUrl = `/product/${linkValue}`;
      else if (linkType === "collection") finalUrl = `/collection/${linkValue}`;
      formData.set("buttonUrl", finalUrl);
    }
    
    if (editingItemId) {
      const res = await updateWidgetContentItem(editingItemId, formData)
      setIsSubmitting(false)
      if (res.success) {
        const updatedItems = editingWidget.items.map((i: any) => i.id === editingItemId ? { ...i, ...res.item } : i)
        const updatedWidget = { ...editingWidget, items: updatedItems }
        setEditingWidget(updatedWidget)
        setWidgets(widgets.map(w => w.id === editingWidget.id ? updatedWidget : w))
        toast.success("تم حفظ التعديلات")
        cancelEditItem()
      } else {
        toast.error("فشل الحفظ")
      }
    } else {
      const res = await createWidgetContentItem(editingWidget.id, formData)
      setIsSubmitting(false)
      if (res.success) {
        const updatedWidget = { ...editingWidget, items: [...(editingWidget.items || []), res.item] }
        setEditingWidget(updatedWidget)
        setWidgets(widgets.map(w => w.id === editingWidget.id ? updatedWidget : w))
        toast.success("تم إضافة العنصر")
        cancelEditItem()
      } else {
        toast.error("فشل الإضافة")
      }
    }
  }

  function startEditItem(item: any) {
    setEditingItemId(item.id)
    setNewItemImage(item.desktopImage || "")
    setNewItemMobileImage(item.mobileImage || "")
    if (editingWidget?.type === "ProductList" && item.title) {
      const collectionIdOrSlug = item.buttonUrl ? item.buttonUrl.replace('/collection/', '') : null;
      if (collectionIdOrSlug) {
        getCollectionProducts(collectionIdOrSlug).then(ids => {
          setSelectedProductIds(ids)
        }).catch(e => {
          getCollectionProducts(collectionIdOrSlug).then(setSelectedProductIds)
        })
      }
    } else {
      setSelectedProductIds([])
    }

    let type = "custom";
    let val = item.buttonUrl || "";
    if (val.startsWith("/category/")) { type = "category"; val = val.replace("/category/", ""); }
    else if (val.startsWith("/product/")) { type = "product"; val = val.replace("/product/", ""); }
    else if (val.startsWith("/collection/")) { type = "collection"; val = val.replace("/collection/", ""); }
    
    setLinkType(type);
    setLinkValue(val);
    setBtnBgColor(item.settings?.buttonBgColor || "primary");
    setBtnTextColor(item.settings?.buttonTextColor || "white");
  }

  function startEditWidget(widget: any) {
    setEditingWidget(widget)
    setActiveTab("edit")
    setEditingItemId(null)
    setNewItemImage("")
    setNewItemMobileImage("")
    setSelectedProductIds([])
    if (widget.type === "FeaturedProduct" && widget.settings?.productId) {
      setFeaturedProductId(widget.settings.productId)
    } else {
      setFeaturedProductId("")
    }
    // Auto scroll to sidebar on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById("widget-sidebar")?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  function cancelEditItem() {
    setEditingItemId(null)
    setNewItemImage("")
    setNewItemMobileImage("")
    setSelectedProductIds([])
    setLinkType("custom")
    setLinkValue("")
    setBtnBgColor("primary")
    setBtnTextColor("white")
    const form: any = document.getElementById("add-item-form")
    if (form) form.reset()
  }

  async function handleDeleteItem(itemId: string) {
    const res = await deleteWidgetContentItem(itemId)
    if (res.success && editingWidget) {
      const updatedWidget = { ...editingWidget, items: editingWidget.items.filter((i: any) => i.id !== itemId) }
      setEditingWidget(updatedWidget)
      setWidgets(widgets.map(w => w.id === editingWidget.id ? updatedWidget : w))
      toast.success("تم الحذف")
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500 relative">
      
      {/* Mobile Form Toggle Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/10 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Floating Action Button for Mobile */}
      {canEdit && (
        <button 
          className="fixed bottom-20 left-6 z-40 lg:hidden h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-transform active:scale-95"
          onClick={() => {
            if (!editingWidget) setActiveTab("add")
            setIsMobileSidebarOpen(true)
          }}
        >
          {editingWidget ? <Settings2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      )}

      {/* Sidebar (Right) */}
      <div id="widget-sidebar" className={cn(
        "w-full lg:w-[420px] shrink-0 flex flex-col border border-border/50 bg-card lg:rounded-xl shadow-xl lg:shadow-sm lg:h-[calc(100vh-8rem)]",
        "fixed inset-y-0 right-0 z-50 lg:static transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-hidden",
        isMobileSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/10 lg:hidden">
          <h3 className="font-bold text-lg">أدوات الواجهات</h3>
          <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 -mr-2 rounded-md hover:bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Sidebar Header Tabs */}
        <div className="flex items-center border-b border-border/50 bg-muted/20 shrink-0">
          <button 
            onClick={() => setActiveTab("add")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === "add" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            إضافة واجهة
          </button>
          <button 
            onClick={() => setActiveTab("edit")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === "edit" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            تعديل الواجهة
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          
          {/* ADD TAB */}
          {activeTab === "add" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground mb-4">انقر على أي واجهة لإضافتها لصفحتك الرئيسية فوراً.</p>
              {WIDGET_TYPES.map(type => (
                <button 
                  key={type.id}
                  onClick={() => handleAddWidget(type.id)}
                  disabled={isSubmitting}
                  className="w-full flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-background hover:border-primary/50 hover:bg-primary/5 transition-all text-right disabled:opacity-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <type.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-foreground">{type.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* EDIT TAB */}
          {activeTab === "edit" && (
            <div>
              {!editingWidget ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 text-muted-foreground">
                  <Settings2 className="w-12 h-12 opacity-20 mb-4" />
                  <p className="text-sm">يرجى تحديد واجهة من منطقة العرض لتعديل إعداداتها.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveTab("add")}>
                    الذهاب لإضافة واجهة
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      {(() => {
                        const Icon = WIDGET_TYPES.find(t => t.id === editingWidget.type)?.icon || LayoutTemplate
                        return <Icon className="h-5 w-5" />
                      })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{editingWidget.title || editingWidget.type}</h3>
                      <p className="text-[10px] text-muted-foreground">{WIDGET_TYPES.find(t => t.id === editingWidget.type)?.name}</p>
                    </div>
                  </div>

                  <form key={`widget-${editingWidget.id}`} onSubmit={saveWidgetSettings} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">العنوان (يظهر فوق الواجهة)</label>
                      <input 
                        name="title"
                        defaultValue={editingWidget.title || ""}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    
                    <div className="space-y-3 pt-2 bg-muted/20 p-4 rounded-xl border border-border/50">
                      <h4 className="text-xs font-semibold mb-2">إعدادات العرض:</h4>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium cursor-pointer">مفعل (يظهر للزوار)</label>
                        <Switch name="status" defaultChecked={editingWidget.status} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium cursor-pointer">عرض على أجهزة الحاسوب</label>
                        <Switch name="showDesktop" defaultChecked={editingWidget.showDesktop} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium cursor-pointer">عرض على أجهزة الجوال</label>
                        <Switch name="showMobile" defaultChecked={editingWidget.showMobile} />
                      </div>

                      {editingWidget.type === "BrandSlider" && (
                        <div className="flex items-center justify-between border-t border-border/50 pt-2 mt-2">
                          <div className="space-y-0.5">
                            <label className="text-xs font-medium cursor-pointer block">قفل التوجيه (الروابط)</label>
                            <span className="text-[10px] text-muted-foreground">عند التفعيل، سيتم عرض الصور فقط بدون روابط</span>
                          </div>
                          <Switch name="disableRouting" defaultChecked={editingWidget.settings?.disableRouting} />
                        </div>
                      )}
                    </div>

                    {editingWidget.type === "BannerGrid" && (
                      <div className="pt-4 mt-4 border-t border-border/50 space-y-4">
                        <h4 className="font-semibold text-sm">إعدادات تصميم البنرات</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold">موضع النص</label>
                            <select name="textPosition" defaultValue={editingWidget.settings?.textPosition || "bottom"} className="h-9 w-full rounded border border-input bg-background px-2 text-xs">
                              <option value="top">أعلى</option>
                              <option value="center">وسط</option>
                              <option value="bottom">أسفل</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold">محاذاة النص</label>
                            <select name="textAlign" defaultValue={editingWidget.settings?.textAlign || "center"} className="h-9 w-full rounded border border-input bg-background px-2 text-xs">
                              <option value="right">يمين</option>
                              <option value="center">وسط</option>
                              <option value="left">يسار</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-semibold">تفعيل التظليل (Overlay)</label>
                            <Switch name="overlayEnabled" defaultChecked={editingWidget.settings?.overlayEnabled ?? true} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold">درجة التظليل (%)</label>
                            <input 
                              type="range" 
                              name="overlayOpacity" 
                              min="0" 
                              max="100" 
                              step="5"
                              defaultValue={editingWidget.settings?.overlayOpacity ?? 40} 
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {editingWidget.type === "FeaturedProduct" && (
                      <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">المنتج المميز</label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full h-9 text-xs justify-between"
                            onClick={() => {
                              setLinkType("featured_product");
                              setProductPickerOpen(true);
                            }}
                          >
                            <span className="truncate">
                              {featuredProductId ? `تم تحديد منتج` : "اختر منتجاً..."}
                            </span>
                          </Button>
                        </div>
                        {productPickerOpen && editingWidget.type === "FeaturedProduct" && (
                          <ProductPickerModal 
                            open={productPickerOpen}
                            onOpenChange={setProductPickerOpen}
                            initialSelectedIds={featuredProductId ? [featuredProductId] : []}
                            single={true}
                            returnSlug={true}
                            onSave={(ids) => setFeaturedProductId(ids[0] || "")}
                          />
                        )}
                      </div>
                    )}

                    {editingWidget.type === "ProductList" && (
                      <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold">طريقة العرض</label>
                          <select 
                            name="displayMode" 
                            defaultValue={editingWidget.settings?.displayMode || "grid"}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
                          >
                            <option value="grid">شبكة (Grid)</option>
                            <option value="carousel">شريط تمرير (Carousel)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    
                    {editingWidget.type === "PromoBanner" && (
                      <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold">صورة الخلفية (اختياري)</label>
                          <input type="hidden" name="backgroundImage" value={aboutUsImage} />
                          <ImageUploader 
                            value={aboutUsImage} 
                            onChange={setAboutUsImage} 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold">لون الخلفية</label>
                            <input type="color" name="backgroundColor" defaultValue={editingWidget.settings?.backgroundColor || "#2453E3"} className="w-full h-9 rounded cursor-pointer border border-input" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold">تعتيم الصورة (0-100)</label>
                            <input type="range" name="overlayOpacity" min="0" max="100" defaultValue={editingWidget.settings?.overlayOpacity ?? 50} className="w-full h-9" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold">تاريخ ووقت انتهاء العرض (اختياري)</label>
                          <input type="datetime-local" name="timerEndDate" defaultValue={editingWidget.settings?.timerEndDate || ""} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" />
                        </div>
                      </div>
                    )}

                    {editingWidget.type === "MarqueeAlerts" && (
                      <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold">لون الخلفية</label>
                            <input type="color" name="backgroundColor" defaultValue={editingWidget.settings?.backgroundColor || "#000000"} className="w-full h-9 rounded cursor-pointer border border-input" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold">لون النص</label>
                            <input type="color" name="textColor" defaultValue={editingWidget.settings?.textColor || "#ffffff"} className="w-full h-9 rounded cursor-pointer border border-input" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold">اتجاه الحركة</label>
                          <select name="scrollDirection" defaultValue={editingWidget.settings?.scrollDirection || "right"} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="right">من اليسار لليمين</option>
                            <option value="left">من اليمين لليسار</option>
                          </select>
                        </div>
                      </div>
                    )}
{editingWidget.type === "AboutUs" && (
                      <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="space-y-1.5">
                          <input type="hidden" name="image" value={aboutUsImage} />
                          <ImageUploader 
                            label="صورة قسم من نحن" 
                            value={aboutUsImage} 
                            onChange={setAboutUsImage} 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold">نص من نحن</label>
                          <textarea 
                            name="content"
                            defaultValue={editingWidget.settings?.content || ""}
                            className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[100px]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold">عنوان الرؤية</label>
                          <input 
                            name="visionTitle"
                            defaultValue={editingWidget.settings?.visionTitle || ""}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold">نص الرؤية</label>
                          <textarea 
                            name="visionContent"
                            defaultValue={editingWidget.settings?.visionContent || ""}
                            className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold">عنوان الرسالة</label>
                          <input 
                            name="missionTitle"
                            defaultValue={editingWidget.settings?.missionTitle || ""}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold">نص الرسالة</label>
                          <textarea 
                            name="missionContent"
                            defaultValue={editingWidget.settings?.missionContent || ""}
                            className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px]"
                          />
                        </div>
                      </div>
                    )}
                    
                    <Button type="submit" disabled={isSubmitting} size="sm" className="w-full flex items-center justify-center gap-2">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ إعدادات الواجهة"}
                    </Button>
                  </form>

                  {(editingWidget.type === "HeroSlider" || editingWidget.type === "BannerGrid" || editingWidget.type === "PromoBentoGrid" || editingWidget.type === "MarqueeAlerts" || editingWidget.type === "BrandSlider" || editingWidget.type === "ProductList") && (
                    <div className="pt-6 border-t border-border/50 space-y-4">
                      <h4 className="font-semibold text-sm">محتوى الواجهة</h4>
                      
                      <div className="space-y-2">
                        {editingWidget.items?.map((item: any) => (
                          <div 
                            key={item.id} 
                            draggable
                            onDragStart={(e) => handleItemDragStart(e, item.id)}
                            onDragOver={(e) => handleItemDragOver(e, item.id)}
                            onDrop={handleItemDrop}
                            onDragEnd={() => setDraggedItemId(null)}
                            onClick={() => startEditItem(item)}
                            className={`flex items-center justify-between p-2 rounded-md border transition-all cursor-pointer ${
                              draggedItemId === item.id 
                                ? 'opacity-50 border-dashed border-border'
                                : editingItemId === item.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border/50 bg-background hover:border-primary/30'
                            } text-xs`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className="cursor-grab text-muted-foreground hover:text-foreground">
                                <GripVertical className="h-4 w-4" />
                              </div>
                              {item.desktopImage ? (
                                <img src={item.desktopImage} className="w-8 h-8 object-cover rounded bg-muted shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                                  <ImageIcon className="w-3 h-3 text-muted-foreground" />
                                </div>
                              )}
                              <span className="truncate max-w-[120px] font-medium">{item.title || "بدون عنوان"}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {(() => {
                        const currentItemData = editingItemId ? (editingWidget.items?.find((i: any) => i.id === editingItemId) || {}) : {};
                        return (
                          <form key={`item-${editingItemId || "new"}`} onSubmit={handleAddContentItem} id="add-item-form" className={`p-4 rounded-xl border ${editingItemId ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-dashed border-border bg-muted/10'} space-y-4 transition-colors`}>
                            <div className="flex items-center justify-between">
                              <h5 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                {editingItemId ? "تعديل العنصر" : "إضافة عنصر جديد"}
                              </h5>
                              {editingItemId && (
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEditItem}>
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            
                            <ImageUploader 
                              label="صورة العنصر" 
                              value={newItemImage} 
                              onChange={setNewItemImage} 
                            />
                            
                            <div className="space-y-2">
                              <input 
                                name="title" 
                                defaultValue={currentItemData.title || ""}
                                placeholder={editingWidget.type === "BrandSlider" ? "اسم الماركة (مطلوب لإنشاء الماركة)" : editingWidget.type === "ProductList" ? "اسم القائمة (مطلوب لإنشاء الرابط)" : "العنوان النصي (اختياري)"} 
                                required={editingWidget.type === "BrandSlider" || editingWidget.type === "ProductList"}
                                className="h-9 w-full rounded border border-input bg-background px-2 text-xs" 
                              />
                          
                          {(editingWidget.type === "HeroSlider" || editingWidget.type === "PromoBentoGrid") && (
                            <div className="space-y-2 mt-2 border-t border-border/50 pt-2 pb-2">
                              <input name="subtitle" defaultValue={currentItemData.subtitle || ""} placeholder="الوصف النصي (اختياري)" className="h-9 w-full rounded border border-input bg-background px-2 text-xs" />
                              <input name="buttonText" defaultValue={currentItemData.buttonText || ""} placeholder="نص الزر (اختياري - افتراضي: تسوق الآن)" className="h-9 w-full rounded border border-input bg-background px-2 text-xs" />
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-muted-foreground block mb-1">المحاذاة</label>
                                  <select name="alignment" defaultValue={currentItemData.settings?.alignment || "center"} className="h-9 w-full rounded border border-input bg-background px-2 text-xs">
                                    <option value="center">في المنتصف</option>
                                    <option value="right">لليمين</option>
                                    <option value="left">لليسار</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground block mb-1">شكل الزر</label>
                                  <select name="buttonStyle" defaultValue={currentItemData.settings?.buttonStyle || "solid"} className="h-9 w-full rounded border border-input bg-background px-2 text-xs">
                                    <option value="solid">ممتلئ (Solid)</option>
                                    <option value="outline">مفرغ (Outline)</option>
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <label className="text-[10px] text-muted-foreground block mb-1">تعتيم الشريحة (الشفافية %)</label>
                                  <input type="range" name="overlayOpacity" min="0" max="100" defaultValue={currentItemData.settings?.overlayOpacity ?? 40} className="w-full h-9" />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <label className="text-[10px] text-muted-foreground block mb-1">لون خلفية الزر</label>
                                  <select name="buttonBgColor" value={btnBgColor} onChange={e => setBtnBgColor(e.target.value)} className="h-9 w-full rounded border border-input bg-background px-2 text-xs">
                                    <option value="primary">اللون الأساسي</option>
                                    <option value="secondary">اللون الثانوي</option>
                                    <option value="white">أبيض</option>
                                    <option value="custom">مخصص...</option>
                                  </select>
                                  {btnBgColor === "custom" && (
                                    <input type="color" name="buttonCustomBgColor" className="w-full h-9 mt-1 rounded border border-input p-1 cursor-pointer" />
                                  )}
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground block mb-1">لون نص الزر</label>
                                  <select name="buttonTextColor" value={btnTextColor} onChange={e => setBtnTextColor(e.target.value)} className="h-9 w-full rounded border border-input bg-background px-2 text-xs">
                                    <option value="white">أبيض</option>
                                    <option value="primary">اللون الأساسي</option>
                                    <option value="secondary">اللون الثانوي</option>
                                    <option value="custom">مخصص...</option>
                                  </select>
                                  {btnTextColor === "custom" && (
                                    <input type="color" name="buttonCustomTextColor" className="w-full h-9 mt-1 rounded border border-input p-1 cursor-pointer" />
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {editingWidget.type === "BannerGrid" || editingWidget.type === "HeroSlider" || editingWidget.type === "PromoBentoGrid" || editingWidget.type === "MarqueeAlerts" ? (
                            <div className="flex gap-2">
                              <select 
                                name="redirectType" 
                                className="h-9 w-1/3 rounded border border-input bg-background px-2 text-xs"
                                value={linkType}
                                onChange={(e) => {
                                  setLinkType(e.target.value)
                                  setLinkValue("")
                                }}
                              >
                                <option value="custom">رابط مخصص</option>
                                <option value="category">قسم (Category)</option>
                                <option value="product">منتج (Product)</option>
                                <option value="collection">قائمة منتجات (Collection)</option>
                              </select>
                              
                              {linkType === "category" ? (
                                <>
                                  <select
                                    value={linkValue}
                                    onChange={(e) => setLinkValue(e.target.value)}
                                    className="h-9 w-2/3 rounded border border-input bg-background px-2 text-xs"
                                    required
                                  >
                                    <option value="">اختر القسم</option>
                                    {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                                  </select>
                                  <input type="hidden" name="buttonUrl" value={linkValue ? `/category/${linkValue}` : ""} required />
                                </>
                              ) : linkType === "collection" ? (
                                <>
                                  <select
                                    value={linkValue}
                                    onChange={(e) => setLinkValue(e.target.value)}
                                    className="h-9 w-2/3 rounded border border-input bg-background px-2 text-xs"
                                    required
                                  >
                                    <option value="">اختر قائمة المنتجات</option>
                                    {collections.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                                  </select>
                                  <input type="hidden" name="buttonUrl" value={linkValue ? `/collection/${linkValue}` : ""} required />
                                </>
                              ) : linkType === "product" ? (
                                <div className="w-2/3">
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="w-full h-9 text-xs justify-between"
                                    onClick={() => setProductPickerOpen(true)}
                                  >
                                    <span className="truncate">
                                      {linkValue ? `تم تحديد منتج (${linkValue})` : "اختر منتجاً..."}
                                    </span>
                                  </Button>
                                  <input type="hidden" name="buttonUrl" value={linkValue} required />
                                </div>
                              ) : (
                                <input 
                                  name="buttonUrl" 
                                  value={linkValue}
                                  onChange={(e) => setLinkValue(e.target.value)}
                                  placeholder="الرابط المخصص" 
                                  dir="ltr" 
                                  className="h-9 w-2/3 rounded border border-input bg-background px-2 text-xs text-left" 
                                />
                              )}
                            </div>
                          ) : editingWidget.type !== "ProductList" ? (
                            <input 
                              name="buttonUrl" 
                              placeholder={editingWidget.type === "BrandSlider" ? "رابط التوجيه (يتم تلقائياً التوجيه لمنتجات الماركة)" : "رابط التوجيه عند الضغط"} 
                              dir="ltr" 
                              className="h-9 w-full rounded border border-input bg-background px-2 text-xs text-left" 
                            />
                          ) : (
                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground p-2 bg-secondary/20 rounded mb-2">
                                سيتم إنشاء مسار تلقائي لهذه القائمة بمجرد الحفظ.
                              </div>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setProductPickerOpen(true)}
                              >
                                تحديد المنتجات المخصصة ({selectedProductIds.length})
                              </Button>
                            </div>
                          )}
                          </div>
                          
                          <Button type="submit" variant={editingItemId ? "default" : "secondary"} size="sm" className="w-full text-xs h-9 flex items-center justify-center gap-2" disabled={isSubmitting || (editingWidget.type !== "ProductList" && !newItemImage)}>
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingItemId ? "تحديث التعديل" : "إضافة العنصر")}
                          </Button>
                        </form>
                        );
                      })()}
                      </div>
                    )}
                      
                      {productPickerOpen && (editingWidget.type === "BannerGrid" || editingWidget.type === "HeroSlider" || editingWidget.type === "PromoBentoGrid" || editingWidget.type === "MarqueeAlerts") && linkType === "product" ? (
                        <ProductPickerModal 
                          open={productPickerOpen}
                          onOpenChange={setProductPickerOpen}
                          initialSelectedIds={linkValue ? [linkValue] : []}
                          single={true}
                          returnSlug={true}
                          onSave={(ids) => setLinkValue(ids[0] || "")}
                        />
                      ) : productPickerOpen && editingWidget.type === "ProductList" ? (
                        <ProductPickerModal 
                          open={productPickerOpen}
                          onOpenChange={setProductPickerOpen}
                          initialSelectedIds={selectedProductIds}
                          onSave={setSelectedProductIds}
                        />
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
        </div>

      {/* Main Preview Area (Left) */}
      <div className="flex-1 flex flex-col border border-border/50 bg-card rounded-xl md:h-[calc(100vh-8rem)] min-h-[500px] overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/10 shrink-0">
          <h2 className="font-semibold">ترتيب واجهات الصفحة الرئيسية</h2>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">العدد: {widgets.length}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/5 scrollbar-thin">
          {widgets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto p-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <LayoutTemplate className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">منطقة العرض فارغة</h3>
              <p className="text-muted-foreground text-sm mb-6">استخدم القائمة لإضافة واجهات جديدة مثل سلايدر الصور أو شبكة المنتجات.</p>
              <Button onClick={() => { setActiveTab("add"); setIsMobileSidebarOpen(true) }}>
                إضافة واجهة جديدة
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {widgets.map((widget) => (
                <div 
                  key={widget.id} 
                  draggable={canEdit}
                  onDragStart={(e) => canEdit && handleDragStart(e, widget.id)}
                  onDragOver={(e) => canEdit && handleDragOver(e, widget.id)}
                  onDrop={canEdit ? handleDrop : undefined}
                  onDragEnd={() => canEdit && setDraggedWidgetId(null)}
                  onClick={() => {
                    if (canEdit) {
                      setEditingWidget(widget)
                      setActiveTab("edit")
                      setIsMobileSidebarOpen(true)
                    }
                  }}
                  className={`group flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all cursor-pointer ${
                    draggedWidgetId === widget.id 
                      ? 'opacity-50 bg-muted/50 border-dashed border-border' 
                      : editingWidget?.id === widget.id
                        ? 'border-primary ring-1 ring-primary/20 bg-primary/5'
                        : 'border-border/50 bg-card hover:border-primary/30 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="cursor-grab p-1.5 rounded hover:bg-muted text-muted-foreground active:cursor-grabbing transition-colors" onClick={(e) => e.stopPropagation()}>
                      <GripVertical className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                      {(() => {
                        const Icon = WIDGET_TYPES.find(t => t.id === widget.type)?.icon || LayoutTemplate
                        return <Icon className="h-5 w-5" />
                      })()}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-sm md:text-base flex items-center gap-2">
                        {widget.title || widget.type}
                        {!widget.status && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">معطل</span>}
                      </h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                        {WIDGET_TYPES.find(t => t.id === widget.type)?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center me-4" onClick={(e) => e.stopPropagation()}>
                      <Switch 
                        checked={widget.status} 
                        onCheckedChange={() => handleToggleWidget(widget)}
                        disabled={!canEdit}
                      />
                    </div>

                    {canEdit && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                        onClick={(e) => {
                          e.stopPropagation()
                          setWidgetToDelete(widget.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-30 rtl-flip group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!widgetToDelete}
        title="حذف الواجهة"
        description="هل أنت متأكد من حذف هذه الواجهة نهائياً من الصفحة الرئيسية؟"
        onConfirm={confirmDelete}
        onCancel={() => setWidgetToDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}
