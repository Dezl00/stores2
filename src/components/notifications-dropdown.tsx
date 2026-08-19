"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Bell, Check, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function NotificationsDropdown({ isAdmin = false, buttonClassName }: { isAdmin?: boolean, buttonClassName?: string }) {
  const { data, mutate } = useSWR("/api/notifications", fetcher, {
    refreshInterval: 10000, // Poll every 10 seconds
  });

  const prevUnreadRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element for playing notification sound
    audioRef.current = new Audio("/sounds/bell.ogg");
  }, []);

  useEffect(() => {
    if (data?.unreadCount !== undefined) {
      // If unread count increased, play sound
      if (data.unreadCount > prevUnreadRef.current && isAdmin) {
        audioRef.current?.play().catch(() => {
          // Browser blocked auto-play because user hasn't interacted with the page yet.
          // This is normal and expected, no need to log an error.
        });
      }
      prevUnreadRef.current = data.unreadCount;
    }
  }, [data?.unreadCount, isAdmin]);

  const markAllAsRead = async () => {
    if (!data?.notifications) return;
    const unreadIds = data.notifications.filter((n: any) => !n.isRead).map((n: any) => n.id);
    if (unreadIds.length === 0) return;

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: unreadIds }),
    });
    mutate();
  };

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    mutate();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={buttonClassName || "relative text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full w-10 h-10 transition-colors"}>
          <Bell className="w-5 h-5" />
          {data?.unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-black text-white border-[3px] border-background shadow-md animate-in zoom-in">
              {data.unreadCount > 9 ? '9+' : data.unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0 rounded-2xl border-border/40 shadow-xl overflow-hidden" align="end" sideOffset={8}>
        <div className="flex items-center justify-between p-4 bg-muted/20 border-b border-border/40">
          <h3 className="font-bold text-sm">الإشعارات</h3>
          {data?.unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-1.5 text-xs text-primary hover:text-primary hover:bg-primary/10 rounded-md transition-colors font-medium">
              <Check className="w-3.5 h-3.5 ml-1.5" />
              تحديد كـ مقروء
            </Button>
          )}
        </div>
        <div className="max-h-[350px] overflow-y-auto scrollbar-thin">
          {!data?.notifications || data.notifications.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">لا توجد إشعارات جديدة</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {data.notifications.map((notif: any) => (
                <Link prefetch={false}
                  key={notif.id}
                  href={notif.link || "#"}
                  onClick={() => { if (!notif.isRead) markAsRead(notif.id) }}
                  className={`p-4 text-sm border-b border-border/40 hover:bg-muted/30 transition-all duration-200 group relative ${!notif.isRead ? 'bg-primary/[0.03]' : ''}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className={`font-semibold text-[13px] ${!notif.isRead ? 'text-foreground' : 'text-foreground/80'}`}>{notif.title}</div>
                      <div className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">{notif.message}</div>
                      <div className="text-[11px] text-muted-foreground/60 mt-2.5 font-sans" dir="ltr">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ar })}
                      </div>
                    </div>
                    {!notif.isRead && <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1 shadow-sm ring-2 ring-primary/20" />}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
