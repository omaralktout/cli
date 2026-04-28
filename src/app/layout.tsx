import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "عيادة د. حنان بروق | أمراض النساء والتوليد",
  description: "عيادة متخصصة في أمراض النساء والتوليد - حجز المواعيد الإلكتروني. نقدم أفضل خدمات الرعاية الصحية للنساء بأحدث التقنيات والأساليب الطبية.",
  keywords: ["عيادة", "نساء", "توليد", "طبيبة", "حنان بروق", "حجز موعد", "رعاية صحية"],
  authors: [{ name: "عيادة د. حنان بروق" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "عيادة د. حنان بروق | أمراض النساء والتوليد",
    description: "عيادة متخصصة في أمراض النساء والتوليد - حجز المواعيد الإلكتروني",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: 'var(--font-cairo), system-ui, sans-serif' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
