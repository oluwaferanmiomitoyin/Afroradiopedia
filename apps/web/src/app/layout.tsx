import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AfroRadiopedia — AI Diagnostic Platform for Africa",
  description:
    "The first African AI platform empowering doctors in remote areas with AI-powered diagnostic assistance and a community-built knowledge base.",
  openGraph: {
    title: "AfroRadiopedia",
    description: "AI diagnostic assistance for every doctor in Africa.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${dmSans.className} min-h-full bg-[#060d17] text-slate-100`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
