import React from "react"
import Link from "next/link"
import { MapPin, Phone, MessageCircle, Globe } from "lucide-react"
import { FaFacebookF, FaInstagram, FaXTwitter, FaWhatsapp, FaTiktok, FaSnapchat } from "react-icons/fa6"

export function StorefrontFooter({ menuItems, themeConfig, branches = [] }: { menuItems: any[], themeConfig?: any, branches?: any[] }) {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8 border-t border-border/10">
      <div className="container mx-auto px-3 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link prefetch={false} href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold tracking-tight text-white">{themeConfig?.storeName || "العسال"}</span>
            </Link>
            <p className="text-sm text-secondary-foreground/70 leading-relaxed">
              {themeConfig?.storeDescription || "متجرك الأول للحصول على أرقى المنتجات بأعلى جودة. نسعى دائماً لتقديم الأفضل لعملائنا."}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6">روابط سريعة</h4>
            <ul className="space-y-3">
              {menuItems.map(item => (
                <li key={item.id}>
                  <Link prefetch={false} href={item.url} className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6">الفروع والتواصل</h4>
            <ul className="space-y-4">
              {branches.length > 0 ? branches.map(branch => (
                <li key={branch.id} className="text-sm text-secondary-foreground/70">
                  <div className="font-medium text-white/90 mb-1">{branch.name}</div>
                  {branch.address && (
                    <div className="flex items-start gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
                      <span>{branch.address}</span>
                    </div>
                  )}
                  {branch.phone && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Phone className="w-4 h-4 shrink-0 text-primary/70" />
                      <span dir="ltr">{branch.phone}</span>
                    </div>
                  )}
                </li>
              )) : (
                <>
                  <li><Link prefetch={false} href="/faq" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">الأسئلة الشائعة</Link></li>
                  <li><Link prefetch={false} href="/contact" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">تواصل معنا</Link></li>
                </>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6">النشرة البريدية</h4>
            <p className="text-sm text-secondary-foreground/70 mb-4">اشترك ليصلك كل جديد وعروضنا الحصرية.</p>
            <div className="flex items-center">
              <input 
                type="email" 
                placeholder="البريد الإلكتروني" 
                className="h-10 w-full rounded-r-md bg-white/10 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="h-10 px-4 rounded-l-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                اشترك
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary-foreground/50">
            © {new Date().getFullYear()} {themeConfig?.storeName || "العسال"}. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4">
            {themeConfig?.facebookUrl && (
              <Link prefetch={false} href={themeConfig.facebookUrl} target="_blank" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary transition-colors flex items-center justify-center text-white/80 hover:text-white shadow-sm">
                <FaFacebookF className="w-4 h-4" />
              </Link>
            )}
            {themeConfig?.instagramUrl && (
              <Link prefetch={false} href={themeConfig.instagramUrl} target="_blank" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary transition-colors flex items-center justify-center text-white/80 hover:text-white shadow-sm">
                <FaInstagram className="w-4 h-4" />
              </Link>
            )}
            {themeConfig?.twitterUrl && (
              <Link prefetch={false} href={themeConfig.twitterUrl} target="_blank" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary transition-colors flex items-center justify-center text-white/80 hover:text-white shadow-sm">
                <FaXTwitter className="w-4 h-4" />
              </Link>
            )}
            {themeConfig?.whatsappNumber && (
              <Link prefetch={false} href={`https://wa.me/${themeConfig.whatsappNumber}`} target="_blank" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary transition-colors flex items-center justify-center text-white/80 hover:text-white shadow-sm">
                <FaWhatsapp className="w-4 h-4" />
              </Link>
            )}
            {themeConfig?.tiktokUrl && (
              <Link prefetch={false} href={themeConfig.tiktokUrl} target="_blank" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary transition-colors flex items-center justify-center text-white/80 hover:text-white shadow-sm">
                <FaTiktok className="w-4 h-4" />
              </Link>
            )}
            {themeConfig?.snapchatUrl && (
              <Link prefetch={false} href={themeConfig.snapchatUrl} target="_blank" className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary transition-colors flex items-center justify-center text-white/80 hover:text-white shadow-sm">
                <FaSnapchat className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
