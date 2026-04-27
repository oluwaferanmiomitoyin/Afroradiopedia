"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/analyze", label: "Analyze Scan" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const initials = session?.user?.name
    ?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "U";

  // Close user menu on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/6 bg-[#060d17]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-2 h-2 rounded-full bg-teal-400 group-hover:bg-teal-300 transition-colors" />
          <span className="text-[15px] font-semibold tracking-tight text-white">
            AfroRadiopedia
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm transition-colors",
                pathname === link.href
                  ? "text-white bg-white/7"
                  : "text-slate-400 hover:text-white hover:bg-white/4"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-xs font-bold text-teal-400">
                  {initials}
                </div>
                <span className="text-sm text-slate-300 max-w-28 truncate">
                  {session.user?.name?.split(" ")[0]}
                </span>
                <svg className={cn("w-3.5 h-3.5 text-slate-500 transition-transform", userMenuOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#0d1829] shadow-2xl p-1.5 z-50">
                  <div className="px-3 py-2.5 border-b border-white/6 mb-1.5">
                    <p className="text-xs font-semibold text-white truncate">{session.user?.name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{session.user?.email}</p>
                  </div>
                  <Link
                    href="/doctor/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>
                  <Link
                    href="/analyze"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Analyze a Scan
                  </Link>
                  <div className="border-t border-white/6 mt-1.5 pt-1.5">
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">
                Sign in
              </Link>
              <a
                href="mailto:oluwaferanmiomitoyin@gmail.com?subject=Doctor%20Access%20Request"
                className="text-sm bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold py-1.5 px-4 rounded-lg transition-colors"
              >
                Request Access
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/6 bg-[#060d17] px-5 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className={cn("block px-3 py-2 rounded-md text-sm transition-colors",
                pathname === link.href ? "text-white bg-white/7" : "text-slate-400 hover:text-white"
              )}>
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/6 space-y-2">
            {session ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-xs font-bold text-teal-400 shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{session.user?.name}</p>
                    <p className="text-xs text-slate-500">{session.user?.email}</p>
                  </div>
                </div>
                <Link href="/doctor/dashboard" onClick={() => setMobileOpen(false)}
                  className="block text-center py-2 text-sm text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                  Dashboard
                </Link>
                <button onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="w-full text-center py-2 text-sm text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/5 transition-colors">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="block text-center py-2 text-sm text-slate-400 border border-white/10 rounded-lg hover:text-white hover:border-white/20 transition-colors">
                  Sign in
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}
                  className="block text-center py-2 text-sm bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg transition-colors">
                  Join as Doctor
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
