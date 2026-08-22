'use client'

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PromoBanner({ widget }: { widget: any }) {
  const { title, subtitle, settings } = widget;
  const {
    timerEndDate,
    backgroundColor = '#2453E3',
    backgroundImage,
    overlayOpacity = 50,
    buttonText,
    buttonUrl,
    redirectType,
    redirectId
  } = settings || {};

  const [timeLeft, setTimeLeft] = React.useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  React.useEffect(() => {
    if (!timerEndDate) return;
    const targetDate = new Date(timerEndDate).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerEndDate]);

  const hasTimer = !!timerEndDate;
  const targetDate = new Date(timerEndDate).getTime();
  const isTimerActive = hasTimer && (targetDate - new Date().getTime() > 0);

  let href = buttonUrl || '#';
  if (redirectType === 'Product' || redirectType === 'product') href = `/product/${redirectId}`;
  else if (redirectType === 'Category' || redirectType === 'category') href = `/category/${redirectId}`;
  else if (redirectType === 'Page' || redirectType === 'page') href = `/pages/${redirectId}`;
  const hasLink = !!(buttonUrl || (redirectType && redirectId));

  return (
    <div 
      className="relative w-full py-12 px-4 flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor }}
    >
      {backgroundImage && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0,0,0,${(overlayOpacity || 0) / 100})` }}
          />
        </>
      )}
      
      <div className={cn(
        "relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-8 items-center",
        isTimerActive ? "md:flex-row md:justify-between md:items-center text-center md:text-right" : "justify-center text-center"
      )}>
        <div className="space-y-6 max-w-2xl">
          {title && <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">{title}</h2>}
          {subtitle && <p className="text-lg text-white/90 leading-relaxed">{subtitle}</p>}
          
          {buttonText && hasLink && (
            <div className={cn("pt-4", !isTimerActive && "flex justify-center")}>
              <Link href={href}>
                <Button variant="outline" className="bg-white text-slate-900 border-white hover:bg-white/90 transition-colors rounded-full px-8 py-6 text-lg font-bold shadow-xl">
                  {buttonText}
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {isTimerActive && (
          <div className="flex items-center gap-3 sm:gap-4 shrink-0" dir="ltr">
            {[
              { label: 'يوم', value: timeLeft.days },
              { label: 'ساعة', value: timeLeft.hours },
              { label: 'دقيقة', value: timeLeft.minutes },
              { label: 'ثانية', value: timeLeft.seconds }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                  <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tighter">
                    {item.value.toString().padStart(2, '0')}
                  </span>
                </div>
                <span className="text-white/80 text-xs sm:text-sm mt-2 font-bold tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
