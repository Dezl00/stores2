'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';

export function MarqueeAlerts({ widget }: { widget: any }) {
  const { items, settings } = widget;
  const {
    scrollDirection = 'right',
    backgroundColor = '#000000',
    textColor = '#ffffff',
  } = settings || {};

  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(scrollDirection);

  if (!items || items.length === 0) return null;

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
          animation: marquee-left 20s linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-right 20s linear infinite;
        }
      `}} />
      <div 
        className="relative w-full overflow-hidden flex items-center h-12"
        style={{ backgroundColor, color: textColor }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Controls */}
        <div className="absolute right-0 z-20 flex items-center h-full px-2 gap-2 bg-gradient-to-l from-black/20 to-transparent">
          <button onClick={() => setDirection('right')} className="hover:opacity-70 transition-opacity">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => setIsPaused(!isPaused)} className="hover:opacity-70 transition-opacity">
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button onClick={() => setDirection('left')} className="hover:opacity-70 transition-opacity">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute left-0 z-20 w-8 h-full bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />

        {/* Marquee Content */}
        <div className="flex whitespace-nowrap overflow-hidden w-full relative">
          <div 
            className={cn(
              "flex shrink-0 min-w-full items-center justify-around gap-16 px-8", 
              direction === 'right' ? 'animate-marquee-right' : 'animate-marquee-left'
            )}
            style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
          >
            {items.map((item: any, i: number) => {
              const content = <span className="text-sm font-semibold whitespace-nowrap">{item.title}</span>;
              
              if (item.buttonUrl || (item.redirectType && item.redirectId)) {
                 let href = item.buttonUrl || '#';
                 if (item.redirectType === 'Product') href = `/product/${item.redirectId}`;
                 else if (item.redirectType === 'Category') href = `/category/${item.redirectId}`;
                 
                 return (
                   <Link key={item.id || i} href={href} className="hover:underline hover:opacity-80 transition-opacity">
                     {content}
                   </Link>
                 );
              }
              return <div key={item.id || i}>{content}</div>;
            })}
          </div>
          
          <div 
            className={cn(
              "flex shrink-0 min-w-full items-center justify-around gap-16 px-8", 
              direction === 'right' ? 'animate-marquee-right' : 'animate-marquee-left'
            )}
            style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
            aria-hidden="true"
          >
            {items.map((item: any, i: number) => {
              const content = <span className="text-sm font-semibold whitespace-nowrap">{item.title}</span>;
              
              if (item.buttonUrl || (item.redirectType && item.redirectId)) {
                 let href = item.buttonUrl || '#';
                 if (item.redirectType === 'Product') href = `/product/${item.redirectId}`;
                 else if (item.redirectType === 'Category') href = `/category/${item.redirectId}`;
                 
                 return (
                   <Link key={`dup-${item.id || i}`} href={href} className="hover:underline hover:opacity-80 transition-opacity">
                     {content}
                   </Link>
                 );
              }
              return <div key={`dup-${item.id || i}`}>{content}</div>;
            })}
          </div>
        </div>
      </div>
    </>
  );
}
