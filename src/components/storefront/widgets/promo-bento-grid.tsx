'use client'

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function PromoBentoGrid({ widget }: { widget: any }) {
  const { items, settings } = widget;
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

  // Aspect ratio CSS
  const getAspectClass = () => {
    if (bentoEffectEnabled) return '';
    switch (cardAspectRatio) {
      case '1:1': return 'aspect-square';
      case '4:3': return 'aspect-[4/3]';
      case '3:4': 
      default: return 'aspect-[3/4]';
    }
  }

  // Bento layout classes (desktop only)
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

  // Convert hex to rgba
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className={cn(
        "grid gap-4 md:gap-6",
        bentoEffectEnabled
          ? "grid-cols-1 md:grid-cols-4 md:grid-flow-row-dense"
          : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      )}>
        {items.map((item: any, index: number) => {
          const {
             title, 
             subtitle: description, 
             desktopImage, 
             mobileImage, 
             buttonText, 
             buttonUrl, 
             redirectType, 
             redirectId
          } = item;
          
          let href = buttonUrl || '#';
          if (redirectType === 'Product' || redirectType === 'product') href = `/product/${redirectId}`;
          else if (redirectType === 'Category' || redirectType === 'category') href = `/category/${redirectId}`;
          else if (redirectType === 'Page' || redirectType === 'page') href = `/pages/${redirectId}`;

          const hasLink = !!(buttonUrl || (redirectType && redirectId));
          const imgUrl = desktopImage || mobileImage;

          const cardClasses = cn(
            "relative overflow-hidden rounded-2xl group transition-all duration-500 hover:shadow-2xl bg-slate-100",
            // On mobile: always single column full width with fixed height
            bentoEffectEnabled ? "h-[280px] md:h-full" : "",
            // Desktop bento classes
            getBentoClasses(index, items.length)
          );

          const cardInner = (
            <>
              {/* Background Image */}
              {imgUrl && (
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${imgUrl})` }}
                />
              )}
              
              {/* Overlay */}
              <div 
                className="absolute inset-0 transition-opacity duration-300"
                style={{ backgroundColor: `rgba(${r},${g},${b},${globalOverlayOpacity / 100})` }}
              />

              {/* Content */}
              <div className={cn("absolute inset-0 p-5 md:p-8 flex flex-col z-10", getFlexAlign(textPosition), getTextJustify(textAlign))}>
                {title && <h3 className="text-lg md:text-2xl font-bold text-white mb-1 leading-tight">{title}</h3>}
                {description && <p className="text-white/80 text-sm mb-3 line-clamp-2 leading-relaxed">{description}</p>}
                
                {buttonText && (
                  <div className="mt-2">
                    <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-black transition-colors backdrop-blur-sm rounded-full px-5">
                      {buttonText}
                    </Button>
                  </div>
                )}
              </div>
            </>
          );

          if (hasLink) {
            return (
              <Link key={item.id || index} href={href} className={cn("block", cardClasses)}>
                {cardInner}
              </Link>
            );
          }

          return (
            <div key={item.id || index} className={cardClasses}>
              {cardInner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
