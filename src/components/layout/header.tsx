"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Phone,
  MapPin,
  Truck,
  ShieldCheck,
  Pill,
  ChevronDown,
  User,
} from "lucide-react";
import { useCart } from "../cart/cart-context";
export function Header() {
  const { itemCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/products", label: "المنتجات" },
    { href: "/products?featured=true", label: "المميزة" },
    { href: "/products?bestseller=true", label: "الأكثر مبيعاً" },
    { href: "/#about", label: "عن الشركة" },
    { href: "/#contact", label: "تواصل معنا" },
  ];

  return (
    <>
      {/* Top bar */}
      <div className="hidden md:block bg-teal-900 text-teal-50 text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              توصيل مجاني للطلبات الكبيرة
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              منتجات أصلية 100%
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:+9674252627" className="flex items-center gap-1.5 hover:text-amber-300 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              <span dir="ltr">+967 4 252 627</span>
            </a>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              تعز - طريق وادي القاضي
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur shadow-sm"
            : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
                  <Pill className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-cairo font-extrabold text-xl text-slate-900 leading-tight">
                  خميس فارما
                </span>
                <span className="text-xs text-teal-600 font-medium tracking-wide">
                  KHAMIS PHARMA
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-slate-700 hover:text-teal-700 font-medium text-sm transition-colors rounded-lg hover:bg-teal-50"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="بحث"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={openCart}
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                aria-label="سلة التسوق"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center px-1 shadow-sm">
                    {itemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="القائمة"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="pb-4 animate-fade-in">
              <form action="/products" method="get" className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن دواء، شركة، مادة فعالة..."
                  className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all text-sm"
                  autoFocus
                />
              </form>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white animate-fade-in">
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-slate-700 hover:bg-teal-50 hover:text-teal-700 font-medium rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm text-slate-600">
                <a href="tel:+9674252627" className="flex items-center gap-2 px-4 py-2">
                  <Phone className="w-4 h-4 text-teal-600" />
                  <span dir="ltr">+967 4 252 627</span>
                </a>
                <div className="flex items-center gap-2 px-4 py-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  تعز - طريق وادي القاضي
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
