"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, Eye, Check } from "lucide-react";
import type { Product } from "../../lib/types";
 import { useCart } from "../cart/cart-context";
import { useState } from "react";
import { useToast } from "../ui/toaster";

export function ProductCard({ product }: { product: Product }) {
  const { addItem, lastAddedId } = useCart();
  const { toast } = useToast();
  const [imgError, setImgError] = useState(false);

  const hasDiscount = product.oldPrice && parseFloat(product.oldPrice) > parseFloat(product.price);
  const discountPct = hasDiscount
    ? Math.round(
        ((parseFloat(product.oldPrice!) - parseFloat(product.price)) /
          parseFloat(product.oldPrice!)) *
          100
      )
    : 0;

  const formatPrice = (p: string) =>
    new Intl.NumberFormat("ar-YE", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(parseFloat(p));

  const isAdding = lastAddedId === product.id;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-teal-500/5 hover:border-teal-200 transition-all duration-300 flex flex-col">
      {/* Badges */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        {product.isBestseller && (
          <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-sm">
            الأكثر مبيعاً
          </span>
        )}
        {product.isNew && (
          <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full shadow-sm">
            جديد
          </span>
        )}
        {hasDiscount && (
          <span className="px-2.5 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-sm">
            خصم {discountPct}%
          </span>
        )}
      </div>

      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden block"
      >
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-teal-600 font-cairo font-bold text-3xl opacity-50">
            {product.nameEn.substring(0, 3)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <span className="flex items-center gap-1 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 shadow-sm">
            <Eye className="w-3.5 h-3.5 text-teal-600" />
            عرض التفاصيل
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Brand & category */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-md">
            {product.brand}
          </span>
          {product.rating != null && product.rating > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold">{product.rating.toFixed(1)}</span>
              {product.reviewCount != null && product.reviewCount > 0 && (
                <span className="text-slate-400">({product.reviewCount})</span>
              )}
            </span>
          )}
        </div>

        <Link href={`/products/${product.slug}`} className="block group/title">
          <h3 className="font-cairo font-bold text-base text-slate-900 line-clamp-2 group-hover/title:text-teal-700 transition-colors min-h-[3rem] leading-relaxed">
            {product.name}
          </h3>
        </Link>

        {product.dosage && (
          <p className="text-xs text-slate-500 mt-1">{product.dosage} • {product.form}</p>
        )}

        <div className="mt-3 flex items-end justify-between gap-2 pt-3 border-t border-slate-100 mt-auto">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-cairo font-extrabold text-lg text-teal-700">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-slate-500">ر.ي</span>
            </div>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.oldPrice!)} ر.ي
              </span>
            )}
          </div>
          <button
            onClick={() => {
              addItem(product, 1);
              toast(`تمت إضافة ${product.name}`, "success");
            }}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all btn-press ${
              isAdding
                ? "bg-emerald-500 text-white"
                : "bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white"
            }`}
            aria-label="أضف إلى السلة"
          >
            {isAdding ? (
              <Check className="w-5 h-5" />
            ) : (
              <ShoppingCart className="w-4.5 h-4.5" />
            )}
          </button>
        </div>

        {product.stock < 50 && product.stock > 0 && (
          <div className="mt-2 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-md text-center">
            الكمية محدودة - متبقي {product.stock} فقط
          </div>
        )}
      </div>
    </div>
  );
}
