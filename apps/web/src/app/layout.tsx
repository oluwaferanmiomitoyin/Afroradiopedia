import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} min-h-full bg-slate-900 text-slate-100 antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
