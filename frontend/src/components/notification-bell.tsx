"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Notification } from "@/types";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [notifs, count] = await Promise.all([
        api.get<Notification[]>("/api/notifications"),
        api.get<{ count: number }>("/api/notifications/unread-count"),
      ]);
      setNotifications(notifs);
      setUnread(count.count);
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const markRead = async (id: number) => {
    await api.patch(`/api/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnread((c) => Math.max(0, c - 1));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm text-gray-900">
              Notifications
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-gray-50 text-sm cursor-pointer hover:bg-gray-50 ${!n.read ? "bg-emerald-50/50" : ""}`}
                    onClick={() => {
                      if (!n.read) markRead(n.id);
                      setOpen(false);
                    }}
                  >
                    {n.link ? (
                      <Link href={n.link} className="block">
                        <p className="text-gray-700">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
                      </Link>
                    ) : (
                      <>
                        <p className="text-gray-700">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
