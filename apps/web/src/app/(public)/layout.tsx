import { PublicHeader } from "@/components/PublicHeader";
import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <div className="pt-16 min-h-screen">{children}</div>
      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-extrabold tracking-tight text-white">AfroRadiopedia</p>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/analyze" className="hover:text-white transition-colors">Analyze Scan</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
            </nav>
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} AfroRadiopedia. For informational use only.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
