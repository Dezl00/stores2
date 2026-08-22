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

  const direction = scrollDirection === 'left' ? 'normal' : 'reverse';
  // Use a stable string for keyframes if ID isn't available, but isolate them anyway
  const animationId = 'marquee-' + (widget.id || Math.random().toString(36).substring(7));
  const animationDuration = speed + 's';

  // Map text size to proper padding so height increases automatically
  const pyClass = textSize === 'text-2xl' ? 'py-4' : textSize === 'text-xl' ? 'py-3' : textSize === 'text-lg' ? 'py-2.5' : 'py-2';

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

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll-${animationId} {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .${animationId}-track {
          animation: scroll-${animationId} ${animationDuration} linear infinite;
          display: flex;
          align-items: center;
          width: max-content;
        }
      `}} />
      <div 
        className={cn("relative w-full overflow-hidden flex items-center", pyClass)}
        style={{ backgroundColor, color: textColor }}
      >
        <div 
          className={`${animationId}-track`}
          style={{ animationDirection: direction }}
        >
          {/* We must render EXACTLY 2 identical halves for the -50% trick to work flawlessly. */}
          <div className="flex items-center shrink-0">
            {Array.from({ length: 8 }).map((_, rep) => renderItems(`part1-r${rep}`))}
          </div>
          <div className="flex items-center shrink-0">
            {Array.from({ length: 8 }).map((_, rep) => renderItems(`part2-r${rep}`))}
          </div>
        </div>
      </div>
    </>
  );
}
