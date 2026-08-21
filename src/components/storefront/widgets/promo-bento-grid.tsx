'use client'

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function PromoBentoGrid({ widget }: { widget: any }) {
  const { items } = widget;
  if (!items || items.length === 0) return null;

  // We limit to 7 items max to keep the grid sane, but map them all if we want.
  // The user asked for "unlimited or up to 7". We will render all, but apply special bento classes to the first 7.
  
  const getBentoClasses = (index: number, total: number) => {
    if (total === 1) return "col-span-1 md:col-span-4 row-span-1 md:row-span-2 h-[400px] md:h-[600px]";
    if (total === 2) return "col-span-1 md:col-span-2 row-span-1 md:row-span-2 h-[300px] md:h-[500px]";
    if (total === 3) {
      if (index === 0) return "col-span-1 md:col-span-2 row-span-1 md:row-span-2 h-[300px] md:h-[500px]";
      return "col-span-1 md:col-span-2 row-span-1 h-[200px] md:h-[240px]";
    }
    
    // For 4 to 7 items, a complex bento layout
    const classes = [
      "col-span-1 md:col-span-2 row-span-1 md:row-span-2 h-[300px] md:h-[500px]", // 0: Large square
      "col-span-1 md:col-span-2 row-span-1 h-[200px] md:h-[240px]", // 1: Horizontal rectangle
      "col-span-1 md:col-span-1 row-span-1 h-[200px] md:h-[240px]", // 2: Small square
      "col-span-1 md:col-span-1 row-span-1 h-[200px] md:h-[240px]", // 3: Small square
      "col-span-1 md:col-span-2 row-span-1 h-[200px] md:h-[240px]", // 4: Horizontal rectangle
      "col-span-1 md:col-span-1 row-span-1 h-[200px] md:h-[240px]", // 5: Small square
      "col-span-1 md:col-span-1 row-span-1 h-[200px] md:h-[240px]", // 6: Small square
    ];
    
    return classes[index] || "col-span-1 md:col-span-1 row-span-1 h-[200px] md:h-[240px]"; // Fallback
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-min">
        {items.map((item: any, index: number) => {
          const {
             title, 
             subtitle: description, 
             desktopImage, 
             mobileImage, 
             buttonText, 
             buttonUrl, 
             redirectType, 
             redirectId,
             settings
          } = item;
          
          const overlayOpacity = settings?.overlayOpacity ?? 40;
          
          let href = buttonUrl || '#';
          if (redirectType === 'Product' || redirectType === 'product') href = `/product/${redirectId}`;
   else if (redirectType === 'Category' || redirectType === 'category') href = `/category/${redirectId}`;
   else if (redirectType === 'Page' || redirectType === 'page') href = `/pages/${redirectId}`;

          const hasLink = !!(buttonUrl || (redirectType && redirectId));
          const imgUrl = desktopImage || mobileImage;

          const CardContent = (
            <div className={cn(
              "relative w-full h-full rounded-2xl overflow-hidden group transition-all duration-300 hover:shadow-xl",
              getBentoClasses(index, items.length)
            )}>
              {/* Background Image */}
              {imgUrl && (
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${imgUrl})` }}
                />
              )}
              
              {/* Overlay */}
              <div 
                className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
                style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }}
              />

              {/* Content */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                {title && <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h3>}
                {description && <p className="text-white/80 text-sm md:text-base mb-4 line-clamp-2">{description}</p>}
                
                {buttonText && hasLink && (
                  <div className="mt-2">
                    <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-black transition-colors backdrop-blur-sm">
                      {buttonText}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );

          if (hasLink && !buttonText) {
             // If there's a link but no button, make the whole card clickable
             return (
               <Link key={item.id || index} href={href} className={getBentoClasses(index, items.length)}>
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
