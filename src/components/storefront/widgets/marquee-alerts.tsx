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
    speed = 25,
    textSize = 'text-sm'
  } = settings || {};

  if (!items || items.length === 0) return null;

  const pyClass = textSize === 'text-2xl' ? 'py-4' : textSize === 'text-xl' ? 'py-3' : textSize === 'text-lg' ? 'py-2.5' : 'py-2';

  const renderItems = (prefix: string) =>
    items.map((item: any, i: number) => {
      let href = item.buttonUrl || '#';
      if (item.redirectType === 'Product' || item.redirectType === 'product') href = `/product/${item.redirectId}`;
      else if (item.redirectType === 'Category' || item.redirectType === 'category') href = `/category/${item.redirectId}`;
      else if (item.redirectType === 'Page' || item.redirectType === 'page') href = `/pages/${item.redirectId}`;

      const hasLink = !!(item.buttonUrl || (item.redirectType && item.redirectId));
      const content = (
        <span className={cn('font-semibold whitespace-nowrap leading-none', textSize)}>{item.title}</span>
      );

      return (
        <React.Fragment key={`${prefix}-${i}`}>
          {hasLink ? (
            <Link href={href} className="hover:underline hover:opacity-80 transition-opacity shrink-0 flex items-center">
              {content}
            </Link>
          ) : (
            <span className="shrink-0 flex items-center">{content}</span>
          )}
          <span className={cn('opacity-40 shrink-0 mx-6 leading-none flex items-center', textSize)}>|</span>
        </React.Fragment>
      );
    });

  // Calculate duration based on speed setting. 25 is normal. 
  // If speed is lower, it should be faster. So speed is actually the duration in seconds.
  const animationDuration = `${speed}s`;
  const animationDirection = scrollDirection === 'right' ? 'reverse' : 'normal';

  return (
    <div 
      className={cn("relative w-full overflow-hidden flex items-center z-[101]", pyClass)}
      style={{ backgroundColor, color: textColor }}
      dir="ltr"
    >
      <div 
        className="flex items-center w-max"
        style={{
          animation: `marquee ${animationDuration} linear infinite ${animationDirection}`
        }}
      >
        <div className="flex items-center shrink-0 pr-6">
          {Array.from({ length: 60 }).map((_, rep) => renderItems(`part1-r${rep}`))}
        </div>
        <div className="flex items-center shrink-0 pr-6">
          {Array.from({ length: 60 }).map((_, rep) => renderItems(`part2-r${rep}`))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
}
