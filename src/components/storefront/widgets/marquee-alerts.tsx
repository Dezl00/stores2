'use client'

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function MarqueeAlerts({ widget }: { widget: any }) {
  const { items, settings } = widget;
  const {
    scrollDirection = 'right',
    backgroundColor = '#000000',
    textColor = '#ffffff',
  } = settings || {};

  if (!items || items.length === 0) return null;

  const animationClass = scrollDirection === 'right' ? 'animate-marquee-right' : 'animate-marquee-left';
  
  // To ensure no gaps even with 1 item, we duplicate the items array multiple times.
  // 10 times is safe for typical screen widths if it's just 1 item.
  const repeatCount = Math.max(10, Math.ceil(20 / items.length));
  let repeatedItems: any[] = [];
  for (let i = 0; i < repeatCount; i++) {
    repeatedItems = repeatedItems.concat(items);
  }

  const renderItemContent = (item: any, i: number, isDuplicate: boolean) => {
    let href = item.buttonUrl || '#';
    if (item.redirectType === 'Product' || item.redirectType === 'product') href = `/product/${item.redirectId}`;
    else if (item.redirectType === 'Category' || item.redirectType === 'category') href = `/category/${item.redirectId}`;
    else if (item.redirectType === 'Page' || item.redirectType === 'page') href = `/pages/${item.redirectId}`;

    const hasLink = !!(item.buttonUrl || (item.redirectType && item.redirectId));
    const content = (
      <div className="flex items-center gap-8">
        <span className="text-sm font-semibold whitespace-nowrap">{item.title}</span>
        <span className="text-sm opacity-50">|</span>
      </div>
    );

    if (hasLink) {
      return (
        <Link key={`${isDuplicate ? 'dup' : 'orig'}-${i}`} href={href} className="hover:underline hover:opacity-80 transition-opacity flex items-center shrink-0">
          {content}
        </Link>
      );
    }
    return <div key={`${isDuplicate ? 'dup' : 'orig'}-${i}`} className="flex items-center shrink-0">{content}</div>;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-left {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-marquee-left {
          animation: marquee-left 30s linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-right 30s linear infinite;
        }
      `}} />
      <div 
        className="relative w-full overflow-hidden flex items-center h-12"
        style={{ backgroundColor, color: textColor }}
      >
        <div className="flex whitespace-nowrap overflow-hidden w-full relative">
          <div className={cn("flex shrink-0 min-w-full items-center justify-around gap-8 px-4", animationClass)}>
            {repeatedItems.map((item: any, i: number) => renderItemContent(item, i, false))}
          </div>
          <div className={cn("flex shrink-0 min-w-full items-center justify-around gap-8 px-4", animationClass)} aria-hidden="true">
            {repeatedItems.map((item: any, i: number) => renderItemContent(item, i, true))}
          </div>
        </div>
      </div>
    </>
  );
}
