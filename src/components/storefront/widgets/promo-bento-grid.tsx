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
  
  const textAlign = settings?.textAlign || 'center'; // 'right', 'center', 'left'
  const textPosition = settings?.textPosition || 'bottom'; // 'top', 'center', 'bottom'

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

  // A more professional Bento Grid logic
  // We use grid-cols-4 and grid-auto-rows.
  const getBentoClasses = (index: number, total: number) => {
    if (!bentoEffectEnabled) {
      // Normal grid if bento is disabled
      return "col-span-1 md:col-span-2 row-span-1 h-[250px] md:h-[350px]";
    }

    // Professional Bento mapping
    const bentoMap = [
      "col-span-1 md:col-span-2 row-span-2 min-h-[300px] md:min-h-[500px]", // Large primary
      "col-span-1 md:col-span-2 row-span-1 min-h-[150px] md:min-h-[240px]", // Wide secondary
      "col-span-1 md:col-span-1 row-span-1 min-h-[150px] md:min-h-[240px]", // Small square
      "col-span-1 md:col-span-1 row-span-1 min-h-[150px] md:min-h-[240px]", // Small square
      "col-span-1 md:col-span-2 row-span-1 min-h-[150px] md:min-h-[240px]", // Wide secondary
      "col-span-1 md:col-span-1 row-span-2 min-h-[300px] md:min-h-[500px]", // Tall vertical
      "col-span-1 md:col-span-1 row-span-1 min-h-[150px] md:min-h-[240px]", // Small square
    ];

    if (total === 3) {
      if (index === 0) return "col-span-1 md:col-span-2 row-span-2 min-h-[300px] md:min-h-[500px]";
      return "col-span-1 md:col-span-2 row-span-1 min-h-[150px] md:min-h-[240px]";
    }

    return bentoMap[index % bentoMap.length];
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6",
        bentoEffectEnabled ? "grid-flow-row-dense" : ""
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

          // Convert hex color to rgba for overlay
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

          const CardContent = (
            <div className={cn(
              "relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 bg-slate-100",
            )}>
              {/* Background Image */}
              {imgUrl && (
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${imgUrl})` }}
                />
              )}
              
              {/* Overlay */}
              <div 
                className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ backgroundColor: `rgba(${r},${g},${b},${globalOverlayOpacity / 100})` }}
              />

              {/* Content */}
              <div className={cn("absolute inset-0 p-6 md:p-8 flex flex-col z-10", getFlexAlign(textPosition), getTextJustify(textAlign))}>
                {title && <h3 className="text-xl md:text-3xl font-bold text-white mb-2 leading-tight">{title}</h3>}
                {description && <p className="text-white/80 text-sm md:text-base mb-4 line-clamp-2 md:line-clamp-3 leading-relaxed">{description}</p>}
                
                {buttonText && hasLink && (
                  <div className="mt-4">
                    <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-black transition-colors backdrop-blur-sm rounded-full px-6">
                      {buttonText}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );

          if (hasLink && !buttonText) {
             return (
               <Link key={item.id || index} href={href} className={cn("block", getBentoClasses(index, items.length))}>
                 {CardContent}
               </Link>
             );
          }

          return (
            <div key={item.id || index} className={getBentoClasses(index, items.length)}>
               {CardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
