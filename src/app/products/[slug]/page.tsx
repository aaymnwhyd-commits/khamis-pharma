"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RefreshCcw,
  Phone,
  Heart,
  Share2,
  CheckCircle2,
  Package,
  Award,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { ProductCard } from "@/components/products/product-card";
import { useToast } from "@/components/ui/toaster";
import type { Product, Review } from "@/lib/types";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "info">("description");
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    params.then(({ slug }) => {
      fetch(`/api/products/${slug}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.product) {
            setProduct(d.product);
            setReviews(d.product.reviews || []);
            setRelated(d.product.related || []);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [params]);

  const formatPrice = (p: string) =>
    new Intl.NumberFormat("ar-YE", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(parseFloat(p)) + " ر.ي";

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast(`تمت إضافة ${quantity} × ${product.name} إلى السلة`, "success");
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : product?.rating || 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-slate-200 rounded mb-6"></div>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="aspect-square bg-slate-200 rounded-3xl"></div>
            <div className="space-y-4">
              <div className="h-10 w-3/4 bg-slate-200 rounded"></div>
              <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
              <div className="h-4 w-full bg-slate-200 rounded"></div>
              <div className="h-4 w-full bg-slate-200 rounded"></div>
              <div className="h-20 w-full bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="font-cairo font-black text-3xl text-slate-900 mb-3">
          المنتج غير موجود
        </h1>
        <p className="text-slate-600 mb-6">
          عذراً، لم نتمكن من العثور على المنتج المطلوب
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 btn-press"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          العودة للمنتجات
        </Link>
      </div>
    );
  }

  const gallery = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.image];

  return (
    <div className="bg-slate-50/40">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            الرئيسية
          </Link>
          <ChevronRight className="w-4 h-4 rotate-180" />
          <Link href="/products" className="hover:text-teal-600 transition-colors">
            المنتجات
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4 rotate-180" />
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-teal-600 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span className="text-slate-900 font-medium line-clamp-1">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100">
          {/* GALLERY */}
          <div>
            <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden mb-4 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gallery[activeImage]}
                alt={product.name}
                className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
              />
              {product.isBestseller && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow">
                  الأكثر مبيعاً
                </span>
              )}
              {product.isNew && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow">
                  جديد
                </span>
              )}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImage((i) => (i - 1 + gallery.length) % gallery.length)
                    }
                    className="absolute top-1/2 right-3 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-teal-50 hover:text-teal-600 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <button
                    onClick={() => setActiveImage((i) => (i + 1) % gallery.length)}
                    className="absolute top-1/2 left-3 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-teal-50 hover:text-teal-600 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </button>
                </>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 justify-center">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${
                      activeImage === i
                        ? "border-teal-500 ring-2 ring-teal-500/20"
                        : "border-slate-200 hover:border-teal-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 mt-6">
              {[
                { icon: Truck, label: "توصيل سريع" },
                { icon: ShieldCheck, label: "أصلي 100%" },
                { icon: RefreshCcw, label: "ضمان الجودة" },
              ].map((b, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center"
                >
                  <b.icon className="w-5 h-5 text-teal-600" />
                  <span className="text-[11px] font-medium text-slate-700">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* INFO */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {product.brand}
                  </span>
                  {product.category && (
                    <Link
                      href={`/products?category=${product.category.slug}`}
                      className="text-xs font-medium text-slate-500 hover:text-teal-600 transition-colors"
                    >
                      {product.category.name}
                    </Link>
                  )}
                </div>
                <h1 className="font-cairo font-black text-2xl md:text-3xl text-slate-900 leading-relaxed mb-3">
                  {product.name}
                </h1>
                {product.activeIngredient && (
                  <p className="text-sm text-slate-500 mb-3">
                    المادة الفعالة:{" "}
                    <span className="font-semibold text-slate-700">
                      {product.activeIngredient}
                    </span>
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors" aria-label="مفضل">
                  <Heart className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-colors" aria-label="مشاركة">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rating */}
            {avgRating > 0 && (
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(avgRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-900">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-slate-500">
                  ({reviews.length} تقييم)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="font-cairo font-black text-4xl text-teal-700">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && parseFloat(product.oldPrice) > parseFloat(product.price) && (
                  <>
                    <span className="text-lg text-slate-400 line-through">
                      {formatPrice(product.oldPrice)}
                    </span>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
                      خصم{" "}
                      {Math.round(
                        ((parseFloat(product.oldPrice) - parseFloat(product.price)) /
                          parseFloat(product.oldPrice)) *
                          100
                      )}
                      %
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                سعر الجملة للصيدليات والمستشفيات • السعر شامل الضريبة
              </p>
            </div>

            {/* Short info */}
            <p className="text-slate-600 leading-relaxed text-sm mb-6 line-clamp-4">
              {product.description}
            </p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.dosage && (
                <InfoPill icon={<PillIcon />} label="التركيز" value={product.dosage} />
              )}
              {product.form && (
                <InfoPill icon={<PackageIcon />} label="الشكل" value={product.form} />
              )}
              {product.packaging && (
                <InfoPill icon={<BoxIcon />} label="العبوة" value={product.packaging} />
              )}
              <InfoPill
                icon={<CheckCircle2 className="w-4 h-4" />}
                label="التوفر"
                value={product.stock > 0 ? `متوفر (${product.stock})` : "غير متوفر"}
                valueColor={product.stock > 0 ? "text-emerald-600" : "text-rose-600"}
              />
            </div>

            {/* Quantity + add to cart */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-14 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, +e.target.value || 1))}
                  className="w-14 h-14 text-center font-cairo font-bold text-lg text-slate-900 outline-none"
                  min={1}
                />
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-12 h-14 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-l from-teal-600 to-emerald-600 text-white font-cairo font-bold rounded-2xl hover:shadow-xl hover:shadow-teal-600/30 transition-all btn-press disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock > 0 ? "أضف إلى السلة" : "غير متوفر حالياً"}
              </button>
            </div>

            {/* Contact / bulk */}
            <div className="p-4 bg-gradient-to-l from-teal-50 to-emerald-50 rounded-2xl border border-teal-100 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-teal-600 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-cairo font-bold text-sm text-slate-900">
                  لطلبيات الجملة الكبيرة
                </div>
                <div className="text-xs text-slate-600">
                  تواصل مع المبيعات مباشرة:{" "}
                  <a href="tel:+9674252627" dir="ltr" className="text-teal-700 font-bold">
                    +967 4 252 627
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10">
          <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
            {[
              { id: "description", label: "الوصف التفصيلي" },
              { id: "info", label: "معلومات إضافية" },
              { id: "reviews", label: `التقييمات (${reviews.length})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-5 py-3 font-cairo font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === t.id
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8">
            {activeTab === "description" && (
              <div className="animate-fade-in">
                <h3 className="font-cairo font-bold text-xl text-slate-900 mb-4">
                  وصف المنتج
                </h3>
                <div className="prose prose-slate max-w-none text-slate-700 leading-loose text-sm md:text-base">
                  <p>{product.description}</p>
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="font-cairo font-bold text-slate-900 mb-2 text-sm flex items-center gap-2">
                        <Award className="w-4 h-4 text-teal-600" />
                        فوائد المنتج
                      </h4>
                      <ul className="text-sm text-slate-600 space-y-1.5 list-disc pr-4">
                        <li>منتج أصلي من شركة {product.brand} العالمية</li>
                        <li>جودة مضمونة ومطابق للمواصفات الصيدلانية</li>
                        <li>تخزين وفق أعلى معايير السلامة الدوائية</li>
                        <li>متوفر بكميات مناسبة للصيدليات والمستشفيات</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="font-cairo font-bold text-slate-900 mb-2 text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600" />
                        تعليمات الاستخدام
                      </h4>
                      <ul className="text-sm text-slate-600 space-y-1.5 list-disc pr-4">
                        <li>يُصرف بوصفة طبية أو حسب توجيه الصيدلي</li>
                        <li>يُحفظ في مكان بارد وجاف بعيداً عن متناول الأطفال</li>
                        <li>لا يُستخدم بعد انتهاء تاريخ الصلاحية</li>
                        <li>اتبع الجرعة المحددة من قبل الطبيب</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "info" && (
              <div className="animate-fade-in">
                <h3 className="font-cairo font-bold text-xl text-slate-900 mb-4">
                  المعلومات الإضافية
                </h3>
                <div className="divide-y divide-slate-100">
                  {[
                    { l: "اسم المنتج", v: product.name },
                    { l: "الاسم العلمي", v: product.activeIngredient || "—" },
                    { l: "الشركة المصنعة", v: product.brand },
                    { l: "التركيز", v: product.dosage || "—" },
                    { l: "الشكل الصيدلاني", v: product.form || "—" },
                    { l: "التعبئة", v: product.packaging || "—" },
                    { l: "التصنيف", v: product.category?.name || "—" },
                    { l: "حالة التوفر", v: product.stock > 0 ? `متوفر (${product.stock})` : "غير متوفر" },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-3 gap-4 py-3">
                      <div className="text-sm font-semibold text-slate-500">{row.l}</div>
                      <div className="col-span-2 text-sm text-slate-900 font-medium">{row.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div>
                    <h3 className="font-cairo font-bold text-xl text-slate-900">
                      آراء العملاء
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(avgRating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-cairo font-bold text-lg text-slate-900">
                        {avgRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-slate-500">
                        بناءً على {reviews.length} تقييم
                      </span>
                    </div>
                  </div>
                  <button className="px-5 py-2.5 bg-teal-600 text-white font-cairo font-semibold rounded-xl hover:bg-teal-700 btn-press text-sm">
                    كتابة تقييم
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-500">لا توجد تقييمات بعد لهذا المنتج.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-cairo font-bold flex items-center justify-center text-lg">
                              {r.author.charAt(r.author.indexOf(" ") + 1) || r.author[0]}
                            </div>
                            <div>
                              <div className="font-cairo font-bold text-slate-900 text-sm">
                                {r.author}
                              </div>
                              {r.pharmacy && (
                                <div className="text-xs text-slate-500">{r.pharmacy}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < r.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {r.title && (
                          <h4 className="font-cairo font-bold text-slate-900 text-sm mb-1">
                            {r.title}
                          </h4>
                        )}
                        <p className="text-sm text-slate-700 leading-relaxed">{r.comment}</p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                          {r.verified && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              عميل موثوق
                            </span>
                          )}
                          <span>•</span>
                          <span>
                            {r.createdAt
                              ? new Date(r.createdAt).toLocaleDateString("ar-YE", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="font-cairo font-black text-2xl text-slate-900 mb-6">
              منتجات ذات صلة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoPill({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="w-9 h-9 rounded-lg bg-white text-teal-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">
          {label}
        </div>
        <div className={`text-sm font-cairo font-bold truncate ${valueColor || "text-slate-900"}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

function PillIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
  );
}
function PackageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
  );
}
function BoxIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
  );
}