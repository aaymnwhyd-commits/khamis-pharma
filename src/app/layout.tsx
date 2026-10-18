import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react"; // تمت إضافة هذا السطر لحل خطأ ReactNode
import "./globals.css";
import { CartProvider } from "../components/cart/cart-context";
import { Header } from "../components/layout/header";
import { CartDrawer } from "../components/cart/cart-drawer";
import { Footer } from "../components/layout/footer";
import { Toaster, ToastProvider } from "../components/ui/toaster";

export const metadata: Metadata = {
  title: "خميس فارما - للتجارة والأدوية",
  description: "المورد الرائد للأدوية والمستحضرات الصيدلانية في اليمن",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-slate-900 antialiased font-tajawal">
        <CartProvider>
          <ToastProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <CartDrawer />
            <Toaster />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}