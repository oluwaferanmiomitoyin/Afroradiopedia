import Link from "next/link";
import { auth } from "@/auth";
import { ConvexUserSync } from "@/components/ConvexUserSync";
import { DoctorSidebarNav } from "@/components/DoctorSidebarNav";
import { DoctorVerificationGate } from "@/components/DoctorVerificationGate";

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen flex bg-[#060d17]">

      {/* Sidebar */}
      <aside className="w-60 hidden md:flex flex-col border-r border-white/6 shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 group-hover:bg-teal-300 transition-colors" />
            <span className="text-sm font-semibold tracking-tight text-white">AfroRadiopedia</span>
          </Link>
        </div>

        <DoctorSidebarNav
          name={session?.user?.name}
          email={session?.user?.email}
        />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 border-b border-white/6 bg-[#060d17]/95 backdrop-blur-md flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          <span className="text-sm font-semibold text-white">AfroRadiopedia</span>
        </Link>
        <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">← Home</Link>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <ConvexUserSync />
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 pt-20 md:pt-10">
          <DoctorVerificationGate>
            {children}
          </DoctorVerificationGate>
        </div>
      </main>
    </div>
  );
}
