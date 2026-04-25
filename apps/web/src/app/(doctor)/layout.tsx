import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ConvexUserSync } from "@/components/ConvexUserSync";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col border-r border-slate-800 bg-slate-900/50 p-6">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-white mb-8">
          AfroRadiopedia
        </Link>
        <nav className="flex flex-col gap-1">
          {[
            { href: "/doctor/dashboard", label: "Dashboard" },
            { href: "/doctor/contribute", label: "Contribute Case" },
            { href: "/doctor/my-cases", label: "My Cases" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Link
            href="/api/auth/signout"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <ConvexUserSync />
        {children}
      </main>
    </div>
  );
}
