"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield, Menu, X, Heart, LayoutDashboard, FolderOpen, LogOut } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:bg-gray-900/80 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">
              Veri<span className="text-emerald-600">Fund</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                {user.role === "donor" && (
                  <Link href="/cases" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50">
                    Browse Cases
                  </Link>
                )}
                {user.role === "seeker" && (
                  <Link href="/cases/create" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50">
                    Create Case
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link href="/admin" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50">
                    Admin Panel
                  </Link>
                )}
                <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50">
                  Dashboard
                </Link>
                <NotificationBell />
                <div className="ml-2 flex items-center gap-2 pl-2 border-l border-gray-200">
                  <span className="text-sm text-gray-500">{user.name}</span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
                <ThemeToggle />
              </>
            ) : (
              <>
                <Link href="/cases" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50">
                  Browse Cases
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="sm">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
                <ThemeToggle />
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <button
              className="p-2 text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-50">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              {user.role === "donor" && (
                <Link href="/cases" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-50">
                  <Heart className="h-4 w-4" /> Browse Cases
                </Link>
              )}
              {user.role === "seeker" && (
                <Link href="/cases/create" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-50">
                  <FolderOpen className="h-4 w-4" /> Create Case
                </Link>
              )}
              {user.role === "admin" && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-50">
                  <Shield className="h-4 w-4" /> Admin Panel
                </Link>
              )}
              <div className="px-3 py-2">
                <NotificationBell />
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 w-full text-left">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/cases" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-50">Browse Cases</Link>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-50">Log in</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-50">Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
