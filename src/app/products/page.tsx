"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  ChevronDown,
  Search,
  X,
  Grid3x3,
  List,
  ArrowLeft,
  Package,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { ProductCard } from "../../components/products/product-card";
import type { Product, Category, SortOption } from "../../lib/types";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<SortOption>("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFeatured, setShowFeatured] = useState(searchParams.get("featured") === "true");
  const [showBestseller, setShowBestseller] = useState(searchParams.get("bestseller") === "true");
  const [showNew, setShowNew] = useState(searchParams.get("new") === "true");

  useEffect(() => {
    // Load categories
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (searchQuery) params.set("search", searchQuery);
    if (showFeatured) params.set("featured", "true");
    if (showBestseller) params.set("bestseller", "true");
    if (showNew) params.set("new", "true");
    params.set("sort", sort);
    params.set("limit", "100");

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCategory, searchQuery, sort, showFeatured, showBestseller, showNew]);

  const brands = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => s.add(p.brand));
    return Array.from(s).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const price = parseFloat(p.price);
      if (price < priceRange[0] || price > priceRange[1]) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
      return true;
    });
  }, [products, priceRange, selectedBrands]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "featured", label: "المميزة أولاً" },
    { value: "newest", label: "الأحدث" },
    { value: "price-asc", label: "السعر: من الأقل للأعلى" },
    { value: "price-desc", label: "السعر: من الأعلى للأقل" },
    { value: "rating", label: "التقييم" },
  ];

  const currentCategoryName =
    selectedCategory === "all"
      ? "جميع المنتجات"
      : categories.find((c) => c.slug === selectedCategory)?.name || "المنتجات";

  return (
    <div className="bg-slate-50/30 min-h-screen">
      {/* Breadcrumb / Title */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Link href="/" className="hover:text-teal-600 transition-colors">
              الرئيسية
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">المنتجات</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-cairo font-black text-2xl md:text-3xl text-slate-900">
                {currentCategoryName}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {loading ? "جاري التحميل..." : `${filteredProducts.length} منتج متاح`}
              </p>
            </div>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-medium text-sm btn-press"
            >
              <SlidersHorizontal className="w-4 h-4" />
              الفلاتر
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* SIDEBAR FILTERS - Desktop */}
          <aside className="hidden lg:block">
            <FiltersPanel
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              brands={brands}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              showFeatured={showFeatured}
              setShowFeatured={setShowFeatured}
              showBestseller={showBestseller}
              setShowBestseller={setShowBestseller}
              showNew={showNew}
              setShowNew={setShowNew}
              onReset={() => {
                setSelectedCategory("all");
                setPriceRange([0, 30000]);
                setSelectedBrands([]);
                setShowFeatured(false);
                setShowBestseller(false);
                setShowNew(false);
                setSearchQuery("");
              }}
            />
          </aside>

          {/* MOBILE FILTERS */}
          {mobileFiltersOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div
                className="absolute inset-0 bg-slate-900/50"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="relative ml-auto w-full max-w-sm bg-white h-full overflow-y-auto animate-slide-in-left">
                <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                  <h2 className="font-cairo font-bold text-lg">الفلاتر</h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5">
                  <FiltersPanel
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={(c) => {
                      setSelectedCategory(c);
                      setMobileFiltersOpen(false);
                    }}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    brands={brands}
                    selectedBrands={selectedBrands}
                    setSelectedBrands={setSelectedBrands}
                    showFeatured={showFeatured}
                    setShowFeatured={setShowFeatured}
                    showBestseller={showBestseller}
                    setShowBestseller={setShowBestseller}
                    showNew={showNew}
                    setShowNew={setShowNew}
                    onReset={() => {
                      setSelectedCategory("all");
                      setPriceRange([0, 30000]);
                      setSelectedBrands([]);
                      setShowFeatured(false);
                      setShowBestseller(false);
                      setShowNew(false);
                      setSearchQuery("");
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* MAIN CONTENT */}
          <div>
            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 flex flex-wrap items-center gap-3 justify-between">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في المنتجات..."
                  className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-sm transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="appearance-none py-2.5 pr-4 pl-10 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none cursor-pointer"
                  >
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      viewMode === "grid" ? "bg-white shadow text-teal-700" : "text-slate-400"
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      viewMode === "list" ? "bg-white shadow text-teal-700" : "text-slate-400"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filters */}
            {(selectedCategory !== "all" ||
              selectedBrands.length > 0 ||
              showFeatured ||
              showBestseller ||
              showNew ||
              priceRange[0] > 0 ||
              priceRange[1] < 30000) && (
              <div className="flex flex-wrap gap-2 mb-4 items-center">
                <span className="text-xs font-medium text-slate-500">الفلاتر النشطة:</span>
                {selectedCategory !== "all" && (
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 hover:bg-teal-200 transition-colors"
                  >
                    {categories.find((c) => c.slug === selectedCategory)?.name}
                    <X className="w-3 h-3" />
                  </button>
                )}
                {selectedBrands.map((b) => (
                  <button
                    key={b}
                    onClick={() =>
                      setSelectedBrands((prev) => prev.filter((x) => x !== b))
                    }
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    {b}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                {showFeatured && (
                  <button
                    onClick={() => setShowFeatured(false)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200"
                  >
                    المميزة <X className="w-3 h-3" />
                  </button>
                )}
                {showBestseller && (
                  <button
                    onClick={() => setShowBestseller(false)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  >
                    الأكثر مبيعاً <X className="w-3 h-3" />
                  </button>
                )}
                {showNew && (
                  <button
                    onClick={() => setShowNew(false)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 hover:bg-sky-200"
                  >
                    جديد <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Products grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse"
                  >
                    <div className="aspect-square bg-slate-100"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                      <div className="h-5 w-full bg-slate-200 rounded"></div>
                      <div className="h-5 w-3/4 bg-slate-200 rounded"></div>
                      <div className="flex justify-between mt-3 pt-3 border-t border-slate-100">
                        <div className="h-6 w-20 bg-slate-200 rounded"></div>
                        <div className="h-10 w-10 bg-slate-200 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-cairo font-bold text-lg text-slate-900 mb-2">
                  لا توجد منتجات مطابقة
                </h3>
                <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">
                  جرب تغيير الفلاتر أو البحث بكلمات مختلفة
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 btn-press"
                >
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                  عرض جميع المنتجات
                </Link>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                    : "flex flex-col gap-3"
                }
              >
                {filteredProducts.map((p, i) =>
                  viewMode === "grid" ? (
                    <div key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                      <ProductCard product={p} />
                    </div>
                  ) : (
                    <ProductListRow key={p.id} product={p} />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FiltersPanel(props: {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  priceRange: [number, number];
  setPriceRange: (r: [number, number]) => void;
  brands: string[];
  selectedBrands: string[];
  setSelectedBrands: (b: string[] | ((prev: string[]) => string[])) => void;
  showFeatured: boolean;
  setShowFeatured: (v: boolean) => void;
  showBestseller: boolean;
  setShowBestseller: (v: boolean) => void;
  showNew: boolean;
  setShowNew: (v: boolean) => void;
  onReset: () => void;
}) {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    brands,
    selectedBrands,
    setSelectedBrands,
    showFeatured,
    setShowFeatured,
    showBestseller,
    setShowBestseller,
    showNew,
    setShowNew,
    onReset,
  } = props;

  return (
    <div className="space-y-6">
      {/* Quick tags */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
        <h3 className="font-cairo font-bold text-slate-900 flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-teal-600" />
          تصنيف سريع
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setShowFeatured(!showFeatured);
              setShowBestseller(false);
              setShowNew(false);
            }}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              showFeatured
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-white border-slate-200 text-slate-700 hover:border-amber-300"
            }`}
          >
            ⭐ المميزة
          </button>
          <button
            onClick={() => {
              setShowBestseller(!showBestseller);
              setShowFeatured(false);
              setShowNew(false);
            }}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              showBestseller
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-white border-slate-200 text-slate-700 hover:border-emerald-300"
            }`}
          >
            🔥 الأكثر مبيعاً
          </button>
          <button
            onClick={() => {
              setShowNew(!showNew);
              setShowFeatured(false);
              setShowBestseller(false);
            }}
            className="col-span-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors bg-sky-500 text-white border-sky-500 hover:bg-sky-600"
          >
            ✨ المنتجات الجديدة
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="font-cairo font-bold text-slate-900 mb-4 text-sm">التصنيفات</h3>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`w-full text-right px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-teal-50 text-teal-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            جميع التصنيفات
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`w-full text-right px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === c.slug
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="font-cairo font-bold text-slate-900 mb-4 text-sm">نطاق السعر</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">من</label>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
                min={0}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">إلى</label>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 outline-none"
                min={0}
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={30000}
            step={500}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
            className="w-full accent-teal-600"
          />
<div className="flex justify-between text-xs text-slate-500">
            <span>{(priceRange?.[0] ?? 0).toLocaleString()} ر.ي</span>
            <span>{(priceRange?.[1] ?? 30000).toLocaleString()} ر.ي</span>
          </div>
        </div>
      </div>

      {/* Brands */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="font-cairo font-bold text-slate-900 mb-4 text-sm">الشركات</h3>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:text-teal-700">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedBrands((prev) => [...prev, b]);
                  } else {
                    setSelectedBrands((prev) => prev.filter((x) => x !== b));
                  }
                }}
                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>{b}</span>
            </label>
          ))}
          {brands.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-3">
              لا توجد شركات متاحة
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
      >
        إعادة تعيين الفلاتر
      </button>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-slate-200 rounded mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductListRow({ product }: { product: Product }) {
  const formatPrice = (p: string) =>
    new Intl.NumberFormat("ar-YE", { style: "decimal", maximumFractionDigits: 0 }).format(parseFloat(p));
  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex gap-4 bg-white rounded-2xl border border-slate-100 p-4 hover:border-teal-200 hover:shadow-lg transition-all"
    >
      <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl bg-slate-50 shrink-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="w-full h-full object-contain p-2" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded uppercase">
            {product.brand}
          </span>
          {product.rating != null && product.rating > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-slate-600">
              <span className="text-amber-400">★</span> {product.rating.toFixed(1)}
            </span>
          )}
        </div>
        <h3 className="font-cairo font-bold text-base text-slate-900 line-clamp-2 mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 flex-1">{product.description}</p>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <span className="font-cairo font-extrabold text-lg text-teal-700">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-slate-500 mr-1">ر.ي</span>
          </div>
          <span className="text-xs text-slate-500">{product.packaging}</span>
        </div>
      </div>
    </Link>
  );
}
