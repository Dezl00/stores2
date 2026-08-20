"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2, Store, Palette, Globe, MapPin, Share2, Plus, Edit, Trash2, Database, Upload, Download, Settings2, Bell, Send, History } from "lucide-react"
import { updateThemeConfig, updateDomainSettings, createBranch, updateBranch, deleteBranch, resetStoreStats, checkDomainVerification } from "@/features/settings/actions"
import { updateProfile } from "@/features/accounts/actions"
import { toast } from "sonner"
import { ImageUploader } from "@/components/ui/image-uploader"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { User as UserIcon } from "lucide-react"

export function SettingsClient({ config, store, branches: initialBranches = [], backups = [], notificationCampaigns = [], subscribersCount = 0, initialIsAdmin = false, initialPermissions = [] }: { config: any, store?: any, branches?: any[], backups?: any[], notificationCampaigns?: any[], subscribersCount?: number, initialIsAdmin?: boolean, initialPermissions?: string[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [branches, setBranches] = useState(initialBranches)
  const [backupPage, setBackupPage] = useState(1)
  const backupsPerPage = 5
  
  const totalBackupPages = Math.ceil((backups?.length || 0) / backupsPerPage)
  const paginatedBackups = (backups || []).slice((backupPage - 1) * backupsPerPage, backupPage * backupsPerPage)

  const [isBranchFormOpen, setIsBranchFormOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<any>(null)
  const [isBranchSubmitting, setIsBranchSubmitting] = useState(false)

  const [confirmState, setConfirmState] = useState<{isOpen: boolean, action: null | (() => Promise<void>), title: string, desc: string, isDestructive: boolean, isLoading: boolean}>({
    isOpen: false, action: null, title: "", desc: "", isDestructive: true, isLoading: false
  });

  const [logoUrl, setLogoUrl] = useState(config.logoUrl || "")
  const [faviconUrl, setFaviconUrl] = useState(config.faviconUrl || "")
  const [primaryColor, setPrimaryColor] = useState(config.primaryColor || "#D97706")
  const [secondaryColor, setSecondaryColor] = useState(config.secondaryColor || "#FBBF24")

  const [whatsappEnabled, setWhatsappEnabled] = useState(config.whatsappEnabled !== false)
  const [whatsappOrderEnabled, setWhatsappOrderEnabled] = useState(config.whatsappOrderEnabled === true)

  const [adminOrderNotifications, setAdminOrderNotifications] = useState(config.adminOrderNotifications !== false)
  const [adminNewCustomerNotifications, setAdminNewCustomerNotifications] = useState(config.adminNewCustomerNotifications !== false)
  const [campaignTitle, setCampaignTitle] = useState("")
  const [campaignMessage, setCampaignMessage] = useState("")
  const [campaignLink, setCampaignLink] = useState("")
  const [campaignImageUrl, setCampaignImageUrl] = useState("")
  const [isSendingCampaign, setIsSendingCampaign] = useState(false)
  const [storeSlug, setStoreSlug] = useState(store?.slug || "")
  const [storeCustomDomain, setStoreCustomDomain] = useState(store?.customDomain || "")
  const [isDomainSubmitting, setIsDomainSubmitting] = useState(false)
  const [isDomainChecking, setIsDomainChecking] = useState(false)

  async function handleCheckDomain() {
    setIsDomainChecking(true)
    const res = await checkDomainVerification()
    setIsDomainChecking(false)
    if (res.success) {
      if (res.verified) {
        toast.success(res.message)
      } else {
        toast.info(res.message)
      }
      router.refresh()
    } else {
      toast.error(res.error || "حدث خطأ أثناء فحص الدومين")
    }
  }

  async function handleDomainSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsDomainSubmitting(true)
    const res = await updateDomainSettings(storeSlug, storeCustomDomain)
    setIsDomainSubmitting(false)
    if (res.success) {
      toast.success("تم تحديث إعدادات الدومين بنجاح")
      router.refresh()
    } else {
      toast.error(res.error || "حدث خطأ أثناء حفظ الدومين")
    }
  }

  async function handleSendCampaign(e: React.FormEvent) {
    e.preventDefault()
    if (!campaignTitle || !campaignMessage) {
      toast.error("العنوان والرسالة مطلوبان")
      return
    }
    
    setIsSendingCampaign(true)
    try {
      const res = await fetch("/api/admin/notifications/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: campaignTitle,
          message: campaignMessage,
          link: campaignLink,
          imageUrl: campaignImageUrl
        })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`تم إرسال الإشعار لـ ${data.totalSent} مشترك بنجاح`)
        setCampaignTitle("")
        setCampaignMessage("")
        setCampaignLink("")
        setCampaignImageUrl("")
        router.refresh()
      } else {
        toast.error(data.error || "حدث خطأ أثناء الإرسال")
      }
    } catch (error) {
      toast.error("فشل الاتصال بالخادم")
    } finally {
      setIsSendingCampaign(false)
    }
  }

  async function handleConfigSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.set("logoUrl", logoUrl)
    formData.set("faviconUrl", faviconUrl)
    formData.set("primaryColor", primaryColor)
    formData.set("secondaryColor", secondaryColor)
    formData.set("whatsappEnabled", whatsappEnabled.toString())
    formData.set("whatsappOrderEnabled", whatsappOrderEnabled.toString())
    formData.set("adminOrderNotifications", adminOrderNotifications.toString())
    formData.set("adminNewCustomerNotifications", adminNewCustomerNotifications.toString())

    const res = await updateThemeConfig(formData)
    setIsSubmitting(false)

    if (res.success) {
      toast.success("تم تحديث الإعدادات بنجاح")
      router.refresh()
    } else {
      toast.error(res.error || "حدث خطأ أثناء الحفظ")
    }
  }

  async function handleBranchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsBranchSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    let res;
    if (editingBranch) {
      res = await updateBranch(editingBranch.id, formData)
    } else {
      res = await createBranch(formData)
    }

    setIsBranchSubmitting(false)
    if (res.success) {
      toast.success("تم الحفظ بنجاح")
      setEditingBranch(null)
      setIsBranchFormOpen(false)
      window.location.reload()
    } else {
      toast.error(res.error || "فشل الحفظ")
    }
  }

  const handleDeleteBranch = async (id: string) => {
    setConfirmState({
      isOpen: true,
      title: "حذف الفرع",
      desc: "هل أنت متأكد من حذف هذا الفرع؟",
      isDestructive: true,
      isLoading: false,
      action: async () => {
        setConfirmState(p => ({ ...p, isLoading: true }));
        try {
          const res = await deleteBranch(id)
          if (res.success) {
            toast.success("تم حذف الفرع")
            setBranches(branches.filter(b => b.id !== id))
          } else {
            toast.error("فشل الحذف")
          }
        } catch (e) {
          toast.error("حدث خطأ")
        }
        setConfirmState(p => ({ ...p, isOpen: false, isLoading: false }));
      }
    });
  }

  const { data: session, status, update: updateSession } = useSession()
  const currentUser = session?.user
  const permissions = status === "loading" ? initialPermissions : (currentUser?.permissions || initialPermissions)
  const isAdmin = status === "loading" ? initialIsAdmin : (currentUser?.role === "STORE_OWNER")

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateProfile(formData)
    setIsSubmitting(false)
    if (res?.success) {
      toast.success('تم تحديث البيانات بنجاح')
      updateSession()
    } else {
      toast.error(res?.error || 'فشل التحديث')
    }
  }

  const hasPerm = (perm: string) => isAdmin || permissions.includes(perm)
  const allTabs = [
    { id: "general", label: "عام", icon: <Store className="w-4 h-4" />, perm: 'settings.general' },
    { id: "appearance", label: "مظهر المتجر", icon: <Palette className="w-4 h-4" />, perm: 'settings.appearance' },
    { id: "domain", label: "الدومين والنطاق", icon: <Globe className="w-4 h-4" />, perm: 'settings.general' },
    { id: "social", label: "تواصل اجتماعي", icon: <Share2 className="w-4 h-4" />, perm: 'settings.social' },
    { id: "notifications", label: "الإشعارات", icon: <Bell className="w-4 h-4" />, perm: 'settings.general' },
    { id: "advanced", label: "إعدادات متقدمة", icon: <Settings2 className="w-4 h-4" />, perm: 'settings.general' },
    { id: "branches", label: "فروع المتجر", icon: <MapPin className="w-4 h-4" />, perm: 'settings.branches' },
    { id: "backups", label: "النسخ الاحتياطية", icon: <Database className="w-4 h-4" />, perm: 'settings.backups' },
    { id: "profile", label: "الملف الشخصي", icon: <UserIcon className="w-4 h-4" />, perm: 'settings.general' },
  ]

  const tabs = allTabs.filter(t => hasPerm(t.perm))
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "general")

  useEffect(() => {
    if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id)
    }
  }, [permissions, tabs, activeTab])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-w-0">
      <div className="flex flex-col md:flex-row gap-6 w-full min-w-0">
        <div className="w-full md:w-64 shrink-0 flex overflow-x-auto md:flex-col gap-2 md:gap-1 pb-2 md:pb-0 scrollbar-hide max-w-full md:sticky md:top-24 h-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0 bg-card border border-border/50 rounded-xl shadow-sm min-h-[500px]">
          {activeTab !== "branches" && activeTab !== "backups" && activeTab !== "profile" && activeTab !== "advanced" && activeTab !== "notifications" && (
            <form onSubmit={handleConfigSubmit} className="flex flex-col h-full">
              <div className="p-4 sm:p-6 flex-1 space-y-8">
                <div className={activeTab === "general" ? "block space-y-6 animate-in fade-in" : "hidden"}>
                    <h2 className="text-lg font-semibold border-b border-border/50 pb-2">الإعدادات العامة</h2>
                    <div className="space-y-4 max-w-xl">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">اسم المتجر</label>
                        <Input name="storeName" type="text" defaultValue={config.storeName} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">وصف المتجر</label>
                        <textarea name="storeDescription" defaultValue={config.storeDescription || ""} rows={4} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                      </div>
                    </div>
                    

                </div>

                <div className={activeTab === "appearance" ? "block space-y-6 animate-in fade-in" : "hidden"}>
                    <h2 className="text-lg font-semibold border-b border-border/50 pb-2">المظهر والهوية</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">شعار المتجر (Logo)</label>
                        <ImageUploader value={logoUrl} onChange={setLogoUrl} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">أيقونة المتصفح (Favicon)</label>
                        <ImageUploader value={faviconUrl} onChange={setFaviconUrl} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">اللون الرئيسي</label>
                        <div className="flex items-center gap-3">
                          <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded border-0 bg-transparent p-0" />
                          <Input type="text" value={primaryColor.toUpperCase()} onChange={e => setPrimaryColor(e.target.value)} dir="ltr" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">اللون الثانوي</label>
                        <div className="flex items-center gap-3">
                          <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded border-0 bg-transparent p-0" />
                          <Input type="text" value={secondaryColor.toUpperCase()} onChange={e => setSecondaryColor(e.target.value)} dir="ltr" />
                        </div>
                      </div>
                    </div>
                </div>

                <div className={activeTab === "domain" ? "block space-y-6 animate-in fade-in" : "hidden"}>
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <h2 className="text-lg font-semibold">الدومين والنطاق</h2>
                    </div>
                    
                    <div className="space-y-8 max-w-2xl">
                      {/* Subdomain Settings */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg text-primary mt-0.5">
                            <Store className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-800">رابط المتجر الأساسي (Subdomain)</h3>
                            <p className="text-sm text-slate-500 mt-1">
                              هذا هو الرابط المجاني الذي ستحصل عليه مع متجرك. يمكنك تغييره بشرط ألا يكون مستخدماً.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input 
                              type="text" 
                              value={storeSlug} 
                              onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                              dir="ltr" 
                              className="pl-28 text-left bg-white"
                              placeholder="mystore"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                              .matgry.tech
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Custom Domain Settings */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-6">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg text-primary mt-0.5">
                            <Globe className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-800">الدومين المخصص (Custom Domain)</h3>
                            <p className="text-sm text-slate-500 mt-1">
                              اربط متجرك بدومين خاص بك (مثال: www.mystore.com) لتعزيز علامتك التجارية.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-medium text-slate-700">اسم الدومين</label>
                          <Input 
                            type="text" 
                            value={storeCustomDomain}
                            onChange={(e) => setStoreCustomDomain(e.target.value)}
                            dir="ltr" 
                            className="text-left bg-white"
                            placeholder="www.yourdomain.com"
                          />
                        </div>

                        {storeCustomDomain && (
                          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm">
                            <h4 className="font-medium text-slate-800 text-sm flex items-center gap-2">
                              <Settings2 className="w-4 h-4 text-primary" />
                              تعليمات الربط (DNS Settings)
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              لربط دومينك بنجاح، قم بتسجيل الدخول إلى مزود الدومين الخاص بك (مثل Namecheap, GoDaddy) وأضف السجلات التالية:
                            </p>
                            
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left border-collapse" dir="ltr">
                                <thead>
                                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                    <th className="px-3 py-2 font-medium">Type</th>
                                    <th className="px-3 py-2 font-medium">Name/Host</th>
                                    <th className="px-3 py-2 font-medium">Value/Points to</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-slate-100">
                                    <td className="px-3 py-2 font-medium text-slate-700">A Record</td>
                                    <td className="px-3 py-2 font-mono text-slate-600">@</td>
                                    <td className="px-3 py-2 font-mono text-slate-600">76.76.21.21</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3 py-2 font-medium text-slate-700">CNAME</td>
                                    <td className="px-3 py-2 font-mono text-slate-600">www</td>
                                    <td className="px-3 py-2 font-mono text-slate-600">cname.matgry.tech</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            
                            <div className="bg-blue-50/50 text-blue-800 text-xs p-3 rounded border border-blue-100 mt-2">
                              <strong>ملاحظة:</strong> قد يستغرق انتشار إعدادات DNS من بضع دقائق إلى 24 ساعة.
                              {store?.domainVerified ? (
                                <span className="block mt-1 text-emerald-600 font-medium">✓ الدومين الخاص بك متصل ومفعل</span>
                              ) : (
                                <span className="block mt-1 text-amber-600 font-medium">⏳ جاري التحقق من اتصال الدومين...</span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                           {storeCustomDomain && store?.customDomain === storeCustomDomain && !store?.domainVerified && (
                             <Button type="button" variant="outline" onClick={handleCheckDomain} disabled={isDomainChecking} className="w-full sm:w-auto">
                              {isDomainChecking ? <Loader2 className="w-4 h-4 mr-2 animate-spin rtl-flip" /> : null}
                              تحقق من الربط
                             </Button>
                           )}
                           <Button type="button" onClick={handleDomainSubmit} disabled={isDomainSubmitting} className="w-full sm:w-auto">
                            {isDomainSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin rtl-flip" /> : null}
                            حفظ إعدادات الدومين
                           </Button>
                        </div>
                      </div>
                    </div>
                </div>

                <div className={activeTab === "social" ? "block space-y-6 animate-in fade-in" : "hidden"}>
                    <h2 className="text-lg font-semibold border-b border-border/50 pb-2">التواصل الاجتماعي وواتساب</h2>
                    <div className="max-w-xl space-y-5">
                      <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50/50 rounded-lg">
                        <div>
                          <p className="font-medium text-green-800">أيقونة واتساب العائمة</p>
                          <p className="text-sm text-green-700/80">إظهار أيقونة الدردشة عبر واتساب في واجهة المتجر الرئيسية</p>
                        </div>
                        <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">رقم الواتساب (مع رمز الدولة)</label>
                        <Input name="whatsappNumber" type="text" defaultValue={config.whatsappNumber || ""} placeholder="مثال: 201012345678" dir="ltr" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">رابط فيسبوك</label>
                        <Input name="facebookUrl" type="url" defaultValue={config.facebookUrl || ""} dir="ltr" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">رابط انستجرام</label>
                        <Input name="instagramUrl" type="url" defaultValue={config.instagramUrl || ""} dir="ltr" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">رابط تويتر / X</label>
                        <Input name="twitterUrl" type="url" defaultValue={config.twitterUrl || ""} dir="ltr" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">رابط تيك توك</label>
                        <Input name="tiktokUrl" type="url" defaultValue={config.tiktokUrl || ""} dir="ltr" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">رابط سناب شات</label>
                        <Input name="snapchatUrl" type="url" defaultValue={config.snapchatUrl || ""} dir="ltr" />
                      </div>
                    </div>
                  </div>
                </div>

              <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "حفظ الإعدادات"}
                </Button>
              </div>
            </form>
          )}

          {activeTab === "profile" && (
            <div className="flex flex-col h-full">
              <div className="p-4 sm:p-6 flex-1 space-y-8">
                <div className="block space-y-6 animate-in fade-in">
                  <h2 className="text-lg font-semibold border-b border-border/50 pb-2">تعديل بيانات الحساب</h2>
                  <div className="space-y-4 max-w-xl">
                    <p className="text-sm text-muted-foreground">تحديث اسمك أو كلمة المرور الخاصة بك.</p>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">الاسم</label>
                        <Input name="name" type="text" required defaultValue={currentUser?.name || ''} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">كلمة المرور الجديدة <span className="text-muted-foreground text-xs">(اختياري)</span></label>
                        <Input name="password" type="password" />
                      </div>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ التعديلات الشخصية'}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "branches" && (
            <div className="p-4 sm:p-6 h-full flex flex-col animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-4 mb-4 gap-4">
                <div>
                  <h2 className="text-lg font-semibold">الفروع والمواقع</h2>
                  <p className="text-sm text-muted-foreground">تتم إضافة الفروع ليتم عرضها في تذييل الموقع.</p>
                </div>
                <Button onClick={() => { setEditingBranch(null); setIsBranchFormOpen(true); }} className="gap-2">
                  <Plus className="w-4 h-4" /> إضافة فرع
                </Button>
              </div>

              {isBranchFormOpen && (
                <div className="mb-8 p-4 border border-border bg-muted/10 rounded-lg">
                  <h3 className="font-medium mb-4">{editingBranch ? "تعديل فرع" : "إضافة فرع جديد"}</h3>
                  <form onSubmit={handleBranchSubmit} className="space-y-4 max-w-xl">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">اسم الفرع <span className="text-red-500">*</span></label>
                      <Input name="name" type="text" required defaultValue={editingBranch?.name || ""} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">العنوان التفصيلي</label>
                      <Input name="address" type="text" defaultValue={editingBranch?.address || ""} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">رقم الهاتف للفرع</label>
                      <Input name="phone" type="text" defaultValue={editingBranch?.phone || ""} dir="ltr" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">رابط خرائط جوجل (Google Maps URL)</label>
                      <Input name="mapUrl" type="url" defaultValue={editingBranch?.mapUrl || ""} dir="ltr" />
                    </div>
                    {editingBranch && (
                      <div className="flex items-center gap-2 pt-2">
                        <Switch name="isActive" defaultChecked={editingBranch.isActive} />
                        <span className="text-sm">تفعيل الفرع</span>
                      </div>
                    )}
                    <div className="flex gap-3 pt-2">
                      <Button type="submit" disabled={isBranchSubmitting}>
                        {isBranchSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ الفرع"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsBranchFormOpen(false)}>إلغاء</Button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-3">
                {branches.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">لا توجد فروع مسجلة.</div>
                ) : (
                  branches.map(branch => (
                    <div key={branch.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:border-primary/50 transition-colors">
                      <div>
                        <h4 className="font-semibold">{branch.name} {!branch.isActive && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full mr-2">غير مفعل</span>}</h4>
                        <div className="text-sm text-muted-foreground mt-1 flex flex-col gap-1">
                          {branch.address && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {branch.address}</span>}
                          {branch.phone && <span>هاتف: {branch.phone}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingBranch(branch); setIsBranchFormOpen(true); }}><Edit className="w-4 h-4 text-muted-foreground" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBranch(branch.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "backups" && (
            <div className="space-y-8 p-4 sm:p-6 animate-in fade-in">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-4 mb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">النسخ الاحتياطي التلقائي والتصدير</h2>
                    <p className="text-sm text-muted-foreground mt-1">تكوين النسخ التلقائي وتصدير البيانات الحالية.</p>
                  </div>
                  <Button onClick={() => window.location.href='/api/backups/export'} className="gap-2">
                    <Database className="w-4 h-4" /> تصدير نسخة يدوية
                  </Button>
                </div>
                <form onSubmit={handleConfigSubmit} className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">جدولة النسخ التلقائي</label>
                    <select name="backupFrequency" defaultValue={config.backupFrequency || "never"} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary">
                      <option value="never">إيقاف (يدوي فقط)</option>
                      <option value="daily">يومياً</option>
                      <option value="3days">كل 3 أيام</option>
                      <option value="weekly">أسبوعياً</option>
                      <option value="monthly">شهرياً</option>
                    </select>
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "حفظ إعدادات النسخ"}
                  </Button>
                </form>
              </div>

              <div className="pt-6 border-t border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-red-600">استعادة واستيراد نسخة احتياطية</h2>
                    <p className="text-sm text-muted-foreground mt-1">تحذير: استعادة النسخة الاحتياطية ستقوم بحذف البيانات الحالية واستبدالها.</p>
                  </div>
                  <div>
                     <input type="file" id="importFile" accept=".zip,.json" className="hidden" onChange={async (e) => {
                       const file = e.target.files?.[0];
                       if (!file) return;
                       
                       setConfirmState({
                        isOpen: true,
                        title: "استعادة النسخة",
                        desc: "هل أنت متأكد من استعادة هذه النسخة؟ سيتم مسح كافة بيانات المتجر الحالية!",
                        isDestructive: true,
                        isLoading: false,
                        action: async () => {
                          setConfirmState(p => ({ ...p, isLoading: true }));
                          const formData = new FormData();
                          formData.append('file', file);
                          try {
                            const res = await fetch('/api/backups/import', { method: 'POST', body: formData });
                            if (res.ok) {
                              toast.success('تم استعادة النسخة بنجاح');
                              setTimeout(() => router.refresh(), 2000);
                            } else {
                              const data = await res.json();
                              toast.error(data.error || "فشل استعادة النسخة الاحتياطية");
                            }
                          } catch (error) {
                            toast.error("فشل في رفع الملف");
                          }
                          setConfirmState(p => ({ ...p, isOpen: false, isLoading: false }));
                        }
                       });
                       e.target.value = '';
                     }} />
                     <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => document.getElementById('importFile')?.click()}>
                       <Upload className="w-4 h-4" /> رفع واستيراد نسخة يدوياً
                     </Button>
                  </div>
                </div>

                <div className="grid gap-3 mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">النسخ السابقة (التلقائية واليدوية)</h3>
                  {paginatedBackups.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-lg">لا توجد نسخ احتياطية محفوظة.</div>
                  ) : (
                    paginatedBackups.map(backup => (
                      <div key={backup.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/50 rounded-lg bg-card gap-4">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm truncate" title={backup.filename}>{backup.filename}</h4>
                          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                            <span>الحجم: {(backup.size / 1024).toFixed(2)} KB</span>
                            <span>التاريخ: {new Date(backup.createdAt).toLocaleString("ar-EG")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-2 py-1 rounded text-[10px] font-medium ${backup.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {backup.status === 'COMPLETED' ? 'مكتمل' : backup.status}
                          </span>
                          {backup.status === 'COMPLETED' && (
                            <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => {
                              setConfirmState({
                                isOpen: true,
                                title: "استعادة النسخة",
                                desc: "استعادة هذه النسخة ستحذف البيانات الحالية. هل توافق؟",
                                isDestructive: true,
                                isLoading: false,
                                action: async () => {
                                  setConfirmState(p => ({ ...p, isLoading: true }));
                                  toast.info("ميزة استعادة النسخ المحفوظة قيد التطوير.");
                                  setConfirmState(p => ({ ...p, isOpen: false, isLoading: false }));
                                }
                              });
                            }}>
                              استعادة
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {totalBackupPages > 1 && (
                    <div className="flex items-center justify-between mt-4 border-t border-border/50 pt-4">
                      <Button type="button" variant="outline" size="sm" onClick={() => setBackupPage(p => Math.max(1, p - 1))} disabled={backupPage === 1}>السابق</Button>
                      <span className="text-xs font-medium text-muted-foreground">{backupPage} من {totalBackupPages}</span>
                      <Button type="button" variant="outline" size="sm" onClick={() => setBackupPage(p => Math.min(totalBackupPages, p + 1))} disabled={backupPage === totalBackupPages}>التالي</Button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {activeTab === "advanced" && (
            <div className="flex flex-col h-full">
              <form onSubmit={handleConfigSubmit} className="flex flex-col h-full">
                <div className="p-4 sm:p-6 flex-1 space-y-8">
                  <div className="block space-y-6 animate-in fade-in">
                    <h2 className="text-lg font-semibold border-b border-border/50 pb-2">الإعدادات المتقدمة</h2>
                    
                    <div className="max-w-xl space-y-5">
                      {/* WhatsApp Order Toggle */}
                      <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50/50 rounded-lg">
                        <div>
                          <p className="font-medium text-green-800">إرسال الطلبات عبر واتساب</p>
                          <p className="text-sm text-green-700/80">عند التفعيل، يتم توجيه العميل بعد تأكيد الطلب إلى محادثة واتساب تتضمن تفاصيل الطلب الكاملة</p>
                        </div>
                        <Switch checked={whatsappOrderEnabled} onCheckedChange={setWhatsappOrderEnabled} />
                      </div>
                      
                      {whatsappOrderEnabled && !config.whatsappNumber && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                          ⚠️ يجب إضافة رقم واتساب في تبويب &quot;التواصل الاجتماعي&quot; لتعمل هذه الخاصية
                        </div>
                      )}
                    </div>

                    {/* Danger Zone - moved from General tab */}
                    <div className="mt-12 pt-6 border-t border-border/50">
                      <h3 className="text-lg font-semibold text-red-600 mb-2">منطقة الخطر</h3>
                      <p className="text-sm text-muted-foreground mb-4">تصفير المتجر سيقوم بحذف كافة الطلبات والإحصائيات الخاصة بالزيارات والمشاهدات نهائياً. لا يمكن التراجع عن هذا الإجراء.</p>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={() => {
                          setConfirmState({
                            isOpen: true,
                            title: "تصفير المتجر",
                            desc: "هل أنت متأكد من رغبتك في تصفير المتجر؟ هذا الإجراء سيحذف جميع الطلبات والإحصائيات بشكل نهائي ولا يمكن التراجع عنه.",
                            isDestructive: true,
                            isLoading: false,
                            action: async () => {
                              setConfirmState(p => ({ ...p, isLoading: true }));
                              const res = await resetStoreStats();
                              if (res.success) {
                                toast.success('تم تصفير المتجر بنجاح');
                                router.refresh();
                              } else {
                                toast.error(res.error || 'حدث خطأ أثناء التصفير');
                              }
                              setConfirmState(p => ({ ...p, isOpen: false, isLoading: false }));
                            }
                          });
                        }}
                      >
                        تصفير بيانات المتجر
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-end">
                  <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "حفظ الإعدادات"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-4 sm:p-6 flex-1 space-y-8 overflow-y-auto">
                <div className="block space-y-6 animate-in fade-in">
                  <h2 className="text-lg font-semibold border-b border-border/50 pb-2">إدارة الإشعارات</h2>
                  
                  {/* Admin Toggles */}
                  <div className="space-y-4 max-w-2xl bg-muted/30 p-4 rounded-xl border border-border/50">
                    <h3 className="font-semibold text-foreground">إشعارات لوحة التحكم</h3>
                    <form onSubmit={handleConfigSubmit} className="space-y-4">
                      <div className="flex items-center justify-between p-4 border bg-background rounded-lg">
                        <div>
                          <p className="font-medium">الطلبات الجديدة</p>
                          <p className="text-sm text-muted-foreground">استلام إشعار في المتصفح عند وصول طلب جديد</p>
                        </div>
                        <Switch checked={adminOrderNotifications} onCheckedChange={setAdminOrderNotifications} />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border bg-background rounded-lg">
                        <div>
                          <p className="font-medium">العملاء الجدد</p>
                          <p className="text-sm text-muted-foreground">استلام إشعار في المتصفح عند تسجيل عميل جديد</p>
                        </div>
                        <Switch checked={adminNewCustomerNotifications} onCheckedChange={setAdminNewCustomerNotifications} />
                      </div>
                      
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "حفظ الإعدادات"}
                      </Button>
                    </form>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Manual Campaign Form */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-primary/10 text-primary p-4 rounded-xl border border-primary/20">
                        <div className="font-semibold flex items-center gap-2">
                          <Bell className="w-5 h-5" />
                          إجمالي المشتركين
                        </div>
                        <div className="text-2xl font-bold">{subscribersCount}</div>
                      </div>

                      <div className="bg-card border border-border/50 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
                        <h3 className="font-semibold flex items-center gap-2 border-b border-border/50 pb-2">
                          <Send className="w-4 h-4" />
                          إرسال إشعار للعملاء
                        </h3>
                        <form onSubmit={handleSendCampaign} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">عنوان الإشعار *</label>
                            <Input value={campaignTitle} onChange={e => setCampaignTitle(e.target.value)} required placeholder="مثال: خصم 50% اليوم فقط!" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">محتوى الإشعار *</label>
                            <textarea 
                              value={campaignMessage} 
                              onChange={e => setCampaignMessage(e.target.value)} 
                              required 
                              rows={3} 
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              placeholder="اكتب رسالتك للعملاء هنا..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">الرابط (اختياري)</label>
                            <Input value={campaignLink} onChange={e => setCampaignLink(e.target.value)} placeholder="/products" dir="ltr" className="text-left" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">صورة كبيرة للإشعار (اختياري)</label>
                            <ImageUploader
                              value={campaignImageUrl}
                              onChange={setCampaignImageUrl}
                            />
                          </div>
                          <Button type="submit" disabled={isSendingCampaign || subscribersCount === 0} className="w-full">
                            {isSendingCampaign ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            {isSendingCampaign ? "جاري الإرسال..." : "إرسال الإشعار الآن"}
                          </Button>
                        </form>
                      </div>
                    </div>

                    {/* Campaign History */}
                    <div className="bg-card border border-border/50 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
                      <h3 className="font-semibold flex items-center gap-2 border-b border-border/50 pb-2">
                        <History className="w-4 h-4" />
                        سجل الإشعارات المرسلة
                      </h3>
                      <div className="space-y-3">
                        {notificationCampaigns.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            لم يتم إرسال أي إشعارات سابقة
                          </div>
                        ) : (
                          notificationCampaigns.map((camp: any) => (
                            <div key={camp.id} className="p-3 bg-muted/30 rounded-lg border border-border/50 text-sm">
                              <div className="font-semibold">{camp.title}</div>
                              <div className="text-muted-foreground line-clamp-2 mt-1">{camp.message}</div>
                              <div className="flex justify-between items-center mt-3 text-xs">
                                <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">
                                  تم الاستلام: {camp.successCount}
                                </span>
                                <span className="text-muted-foreground" dir="ltr">
                                  {new Date(camp.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
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
