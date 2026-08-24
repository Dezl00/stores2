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
    speed,
    textSize = 'text-sm'
  } = settings || {};

  // Default speed to 100 (normal), map to actual seconds
  const speedValue = typeof speed === 'number' ? speed : 100;

  if (!items || items.length === 0) return null;

  const pyClass = textSize === 'text-2xl' ? 'py-3.5' : textSize === 'text-xl' ? 'py-3' : textSize === 'text-lg' ? 'py-2.5' : textSize === 'text-base' ? 'py-2' : 'py-1.5';

  const renderItems = (prefix: string) =>
    items.map((item: any, i: number) => {
      let href = item.buttonUrl || '#';
      if (item.redirectType === 'Product' || item.redirectType === 'product') href = `/product/${item.redirectId}`;
      else if (item.redirectType === 'Category' || item.redirectType === 'category') href = `/category/${item.redirectId}`;
      else if (item.redirectType === 'Page' || item.redirectType === 'page') href = `/pages/${item.redirectId}`;

      const hasLink = !!(item.buttonUrl || (item.redirectType && item.redirectId));
      const content = (
        <span className={cn('font-semibold whitespace-nowrap', textSize)}>{item.title}</span>
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
          <span className={cn('opacity-40 shrink-0 mx-6', textSize)}>|</span>
        </React.Fragment>
      );
    });

  // Speed value is directly the animation duration in seconds
  const animationDuration = `${speedValue}s`;
  const animationDirection = scrollDirection === 'right' ? 'reverse' : 'normal';

  // We only need enough repetitions to fill the screen. 
  // With 2 copies of the same set, translateX(-50%) creates a seamless loop.
  const repeatCount = Math.max(Math.ceil(30 / Math.max(items.length, 1)), 3);

  return (
    <div 
      className={cn("relative w-full overflow-hidden", pyClass)}
      style={{ backgroundColor, color: textColor }}
      dir="ltr"
    >
      <div 
        className="flex items-center w-max"
        style={{
          animation: `marquee-scroll ${animationDuration} linear infinite ${animationDirection}`
        }}
      >
        {/* First half */}
        <div className="flex items-center shrink-0">
          {Array.from({ length: repeatCount }).map((_, rep) => renderItems(`a${rep}`))}
        </div>
        {/* Second half (identical copy for seamless loop) */}
        <div className="flex items-center shrink-0">
          {Array.from({ length: repeatCount }).map((_, rep) => renderItems(`b${rep}`))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
}
