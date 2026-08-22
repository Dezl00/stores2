'use client'

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

  // For framer motion, to go left-to-right (right direction), we go from -50% to 0%
  // To go right-to-left (left direction), we go from 0% to -50%
  const xStart = scrollDirection === 'left' ? "0%" : "-50%";
  const xEnd = scrollDirection === 'left' ? "-50%" : "0%";

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
    <div 
      className={cn("relative w-full overflow-hidden flex items-center", pyClass)}
      style={{ backgroundColor, color: textColor }}
    >
      <motion.div 
        className="flex items-center w-max"
        initial={{ x: xStart }}
        animate={{ x: xEnd }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
      >
        <div className="flex items-center shrink-0">
          {Array.from({ length: 8 }).map((_, rep) => renderItems(`part1-r${rep}`))}
        </div>
        <div className="flex items-center shrink-0">
          {Array.from({ length: 8 }).map((_, rep) => renderItems(`part2-r${rep}`))}
        </div>
      </motion.div>
    </div>
  );
}
