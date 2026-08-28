'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function PromoBentoGrid({ widget }: { widget: any }) {
  const { items, settings, title: widgetTitle } = widget;
  
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let mql: MediaQueryList | null = null;
    try {
      mql = window.matchMedia('(max-width: 767px)');
      setIsMobile(mql.matches);
      
      const handler = (e: MediaQueryListEvent | MediaQueryListEvent | Event) => {
        setIsMobile((e as MediaQueryListEvent).matches);
      };
      
      if (mql.addEventListener) {
        mql.addEventListener('change', handler);
      } else if (mql.addListener) {
        // Fallback for older Safari
        mql.addListener(handler as any);
      }
      
      setMounted(true);
      
      return () => {
        if (mql) {
          if (mql.removeEventListener) {
            mql.removeEventListener('change', handler);
          } else if (mql.removeListener) {
            mql.removeListener(handler as any);
          }
        }
      };
    } catch (e) {
      console.error(e);
      setMounted(true);
    }
  }, []);

  if (!items || items.length === 0) return null;

  const bentoEffectEnabled = settings?.bentoEffectEnabled !== false;
  const overlayColor = settings?.overlayColor || '#000000';
  const globalOverlayOpacity = settings?.overlayOpacity ?? 40;
  const cardAspectRatio = settings?.cardAspectRatio || '3:4';
  
  const textAlign = settings?.textAlign || 'center';
  const textPosition = settings?.textPosition || 'bottom';

  const getFlexAlign = (pos: string) => {
    if (pos === 'top') return 'justify-start';
    if (pos === 'center') return 'justify-center';
    return 'justify-end';
  }
  const getTextJustify = (align: string) => {
    if (align === 'right') return 'items-end text-right';
    if (align === 'left') return 'items-start text-left';
    return 'items-center text-center';
  }

  const getAspectClass = () => {
    if (bentoEffectEnabled) return '';
    switch (cardAspectRatio) {
      case '1:1': return 'aspect-square';
      case '4:3': return 'aspect-[4/3]';
      case '3:4': 
      default: return 'aspect-[3/4]';
    }
  }

  const getBentoClasses = (index: number, total: number) => {
    if (!bentoEffectEnabled) {
      return `col-span-1 ${getAspectClass()}`;
    }

    const bentoMap = [
      "md:col-span-2 md:row-span-2 md:min-h-[500px]",
      "md:col-span-2 md:row-span-1 md:min-h-[240px]",
      "md:col-span-1 md:row-span-1 md:min-h-[240px]",
      "md:col-span-1 md:row-span-1 md:min-h-[240px]",
      "md:col-span-2 md:row-span-1 md:min-h-[240px]",
      "md:col-span-1 md:row-span-2 md:min-h-[500px]",
      "md:col-span-1 md:row-span-1 md:min-h-[240px]",
    ];

    if (total <= 2) return "md:col-span-2 md:row-span-1 md:min-h-[300px]";
    if (total === 3) {
      if (index === 0) return "md:col-span-2 md:row-span-2 md:min-h-[500px]";
      return "md:col-span-2 md:row-span-1 md:min-h-[240px]";
    }

    return bentoMap[index % bentoMap.length];
  };

  let r = 0, g = 0, b = 0;
  if (overlayColor.startsWith('#')) {
    const hex = overlayColor.replace('#', '');
    if (hex.length === 3) {
      r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  }

  const renderCardInner = (item: any) => {
    const { title, subtitle: description, desktopImage, mobileImage, buttonText } = item;
    const imgUrl = desktopImage || mobileImage;

    return (
      <>
        {imgUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${imgUrl})` }}
          />
        )}
        <div 
          className="absolute inset-0 transition-opacity duration-300"
          style={{ backgroundColor: `rgba(${r},${g},${b},${globalOverlayOpacity / 100})` }}
        />
        <div className={cn("absolute inset-0 p-5 md:p-8 flex flex-col z-10", getFlexAlign(textPosition), getTextJustify(textAlign))}>
          {title && <h3 className="text-xl md:text-3xl font-bold text-white mb-2 leading-tight">{title}</h3>}
          {description && <p className="text-white/90 text-base md:text-lg mb-4 line-clamp-2 leading-relaxed">{description}</p>}
          {buttonText && (
            <div className="mt-2">
              <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-black transition-colors backdrop-blur-sm rounded-full px-6 font-semibold shadow-lg">
                {buttonText}
              </Button>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderCard = (item: any, index: number) => {
    const { buttonUrl, redirectType, redirectId } = item;
    
    let href = buttonUrl || '#';
    if (redirectType === 'Product' || redirectType === 'product') href = `/product/${redirectId}`;
    else if (redirectType === 'Category' || redirectType === 'category') href = `/category/${redirectId}`;
    else if (redirectType === 'Page' || redirectType === 'page') href = `/pages/${redirectId}`;

    const hasLink = !!(buttonUrl || (redirectType && redirectId));

    const cardClasses = cn(
      "relative overflow-hidden rounded-2xl group transition-all duration-500 hover:shadow-2xl bg-slate-100",
      bentoEffectEnabled ? "h-[280px] md:h-full" : "",
      getBentoClasses(index, items.length)
    );

    // Only stagger cards on mobile
    const animationProps = isMobile ? {
      initial: { opacity: 0, y: 30 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "0px" },
      transition: { duration: 0.6, delay: index * 0.1, ease: "easeOut" as const }
    } : {};

    if (hasLink) {
      if (isMobile) {
        return (
          <motion.div key={item.id || index} className={cn("block w-full h-full", cardClasses)} {...animationProps}>
            <Link href={href} className="absolute inset-0 z-20" />
            {renderCardInner(item)}
          </motion.div>
        );
      }
      return (
        <Link key={item.id || index} href={href} className={cn("block w-full h-full", cardClasses)}>
          {renderCardInner(item)}
        </Link>
      );
    }
    
    if (isMobile) {
      return (
        <motion.div key={item.id || index} className={cn("w-full h-full", cardClasses)} {...animationProps}>
          {renderCardInner(item)}
        </motion.div>
      );
    }
    
    return (
      <div key={item.id || index} className={cn("w-full h-full", cardClasses)}>
        {renderCardInner(item)}
      </div>
    );
  };

  if (!mounted) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8 opacity-0">
        <div className={cn("grid gap-6", bentoEffectEnabled ? "grid-cols-4" : "grid-cols-3")} />
      </div>
    );
  }

  // Animation props for the wrapper (only used on desktop)
  const wrapperAnimationProps = !isMobile ? {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "0px" },
    transition: { duration: 0.8, ease: "easeOut" as const }
  } : {};

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 overflow-hidden">
      {widgetTitle && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{widgetTitle}</h2>
        </motion.div>
      )}

      {/* Single Grid Render */}
      <motion.div 
        {...wrapperAnimationProps}
        className={cn(
          "grid gap-4 md:gap-6",
          !bentoEffectEnabled 
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
            : "grid-cols-1 md:grid-cols-4 md:grid-flow-row-dense"
        )}
      >
        {items.map((item: any, index: number) => renderCard(item, index))}
      </motion.div>
    </div>
  );
}
