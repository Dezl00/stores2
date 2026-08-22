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

  const direction = scrollDirection === 'left' ? 'normal' : 'reverse';

  // Build a single set of items with separators
  const renderItems = (prefix: string) =>
    items.map((item: any, i: number) => {
      let href = item.buttonUrl || '#';
      if (item.redirectType === 'Product' || item.redirectType === 'product') href = `/product/${item.redirectId}`;
      else if (item.redirectType === 'Category' || item.redirectType === 'category') href = `/category/${item.redirectId}`;
      else if (item.redirectType === 'Page' || item.redirectType === 'page') href = `/pages/${item.redirectId}`;

      const hasLink = !!(item.buttonUrl || (item.redirectType && item.redirectId));
      const content = (
        <span className="text-sm font-semibold whitespace-nowrap">{item.title}</span>
      );

      return (
        <React.Fragment key={`${prefix}-${i}`}>
          {hasLink ? (
            <Link href={href} className="hover:underline hover:opacity-80 transition-opacity shrink-0">
              {content}
            </Link>
          ) : (
            <span className="shrink-0">{content}</span>
          )}
          <span className="text-sm opacity-40 shrink-0 mx-6">|</span>
        </React.Fragment>
      );
    });

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll 25s linear infinite;
          display: flex;
          align-items: center;
          width: max-content;
        }
      `}} />
      <div 
        className="relative w-full overflow-hidden flex items-center h-10"
        style={{ backgroundColor, color: textColor }}
      >
        <div 
          className="marquee-track"
          style={{ animationDirection: direction }}
        >
          {/* Repeat items enough times to fill the screen and then some */}
          {Array.from({ length: 8 }).map((_, rep) => renderItems(`r${rep}`))}
        </div>
      </div>
    </>
  );
}
