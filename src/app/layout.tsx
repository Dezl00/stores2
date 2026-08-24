import type { Metadata } from "next";
import { FONT_MAP, fontIbm } from "@/app/fonts";
import "./globals.css";
import { Toaster } from "sonner";
import { db } from "@/lib/db";
import NextTopLoader from 'nextjs-toploader';
import { PageTracker } from "@/components/page-tracker";
import { Suspense } from "react";
import { getCurrentStore } from "@/lib/tenant";



export async function generateMetadata(): Promise<Metadata> {
  let theme = null;
  let store = null;
  try {
    store = await getCurrentStore();
    if (store) {
      theme = await db.themeConfig.findUnique({ where: { storeId: store.storeId } });
    }
  } catch (e) {
    // Ignore DB error during build/metadata generation
  }
  
  const isPlatform = !store;
  const platformName = process.env.NEXT_PUBLIC_PLATFORM_NAME || "متجرك";
  
  const storeName = theme?.storeName || (isPlatform ? platformName : "متجر جديد");
  const storeDescription = theme?.storeDescription || (isPlatform ? "منصة متجرك لإنشاء المتاجر الإلكترونية بسهولة" : "أفضل المنتجات وأعلاها جودة");
  const logo = theme?.logoUrl || "/favicon.ico";
  const favicon = theme?.faviconUrl || "/favicon.ico";

  let ogImage = logo;
  if (ogImage.includes("res.cloudinary.com") && ogImage.includes("/upload/")) {
    ogImage = ogImage.replace("/upload/", "/upload/w_1200,h_630,c_pad,b_white,f_jpg,q_auto/");
  }

  // Determine metadata base (custom domain vs platform subdomain vs localhost)
  let baseUrl = "http://localhost:3000";
  if (process.env.NEXT_PUBLIC_PLATFORM_DOMAIN) {
    baseUrl = `https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN}`;
  }
  if (store && store.storeSlug) {
    baseUrl = `https://${store.storeSlug}.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'localhost:3000'}`;
  }

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: storeName,
      template: `%s | ${storeName}`,
    },
    description: storeDescription,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      title: storeName,
      description: storeDescription,
      url: '/',
      siteName: storeName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: storeName,
        },
      ],
      locale: 'ar_EG',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: storeName,
      description: storeDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: storeName,
        }
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let theme = null;
  try {
    const store = await getCurrentStore();
    if (store) {
      theme = await db.themeConfig.findUnique({ where: { storeId: store.storeId } });
    }
  } catch (e) {
    // Ignore DB error
  }

  return (
    <html lang="ar" dir="rtl" className={(theme?.headerSettings as any)?.fontFamily ? (FONT_MAP[(theme?.headerSettings as any)?.fontFamily]?.variable || fontIbm.variable) : fontIbm.variable} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          :root {
            ${theme?.primaryColor ? `--color-primary: ${theme.primaryColor}; --color-ring: ${theme.primaryColor};` : ''}
            ${theme?.secondaryColor ? `--color-secondary: ${theme.secondaryColor};` : ''}
            --color-admin-bg: hsl(var(--primary));
          }
        `}} />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <NextTopLoader 
          color="var(--color-primary, #4f46e5)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px var(--color-primary, #4f46e5),0 0 5px var(--color-primary, #4f46e5)"
        />
        <Suspense fallback={null}>
          <PageTracker />
        </Suspense>
        {children}
        <Toaster 
          position="top-center" 
          richColors 
          dir="rtl"
          toastOptions={{
            className: "font-sans flex justify-center text-center rounded-2xl !shadow-none border border-border/50",
          }}
        />
      </body>
    </html>
  );
}
