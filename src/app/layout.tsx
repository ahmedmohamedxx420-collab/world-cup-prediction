import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

// Arabic-first UI font (also covers Latin). Exposed as --font-sans so the
// Tailwind `font-sans` utility and the shadcn theme resolve to it.
const tajawal = Tajawal({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "كأس العالم — توقعات",
  description: "توقّع نتائج مباريات كأس العالم ونافس عائلتك على لوحة واحدة.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Arabic / RTL is the default. Item 0.3 moves locale + dir into a [locale]
  // layout driven by next-intl; this keeps the base shell RTL until then.
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
