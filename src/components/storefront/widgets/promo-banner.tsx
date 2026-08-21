'use client'
import React from 'react';
import Link from 'next/link';

export function PromoBanner({ widget }: { widget: any }) {
  const { title, subtitle, settings } = widget;
  const {
    timerEndDate,
    backgroundColor = '#2453E3',
    backgroundImage,
    overlayOpacity = 50,
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

  return (
    <div 
      className="relative w-full py-12 px-4 flex flex-col items-center justify-center text-center overflow-hidden"
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
      
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {title && <h2 className="text-3xl md:text-5xl font-bold text-white">{title}</h2>}
        {subtitle && <p className="text-lg text-white/90">{subtitle}</p>}
        
        {hasTimer && (
          <div className="flex items-center justify-center gap-4 mt-8" dir="ltr">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Mins', value: timeLeft.minutes },
              { label: 'Secs', value: timeLeft.seconds }
            ].map((unit, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-white text-slate-900 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl text-2xl md:text-3xl font-bold shadow-lg">
                  {unit.value.toString().padStart(2, '0')}
                </div>
                <span className="text-white/80 text-xs md:text-sm mt-2 uppercase tracking-wider">{unit.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

