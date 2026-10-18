import Link from "next/link";
import {
  ArrowLeft,
  Pill,
  Truck,
  ShieldCheck,
  Headphones,
  Award,
  CheckCircle2,
  Star,
  Quote,
  Heart,
  Building2,
  Stethoscope,
  ShoppingBag,
  TrendingUp,
  Sparkles,
  Clock,
  Phone,
  MapPin,
} from "lucide-react";
import { db } from "../db";
import { products as productsTable, categories as categoriesTable } from "../db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getFeaturedProducts() {
  try {
    return await db.select().from(productsTable).where(eq(productsTable.isFeatured, true)).limit(8);
  } catch {
    return [];
  }
}

async function getBestsellerProducts() {
  try {
    return await db.select().from(productsTable).where(eq(productsTable.isBestseller, true)).limit(4);
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    return await db.select().from(categoriesTable).limit(8);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featured, bestsellers, categories] = await Promise.all([
    getFeaturedProducts(),
    getBestsellerProducts(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white text-slate-900" dir="rtl">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-teal-200 text-teal-700 text-sm font-medium mb-6 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              المورد الرائد للأدوية في اليمن
            </div>

            <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl text-slate-900 leading-tight mb-6">
              شريكك الموثوق في <span className="text-teal-600">تجارة الأدوية</span> بالجملة
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              شركة خميس فارما تقدم مجموعة واسعة من الأدوية والمستحضرات الصيدلانية الأصلية للصيدليات والمستشفيات بأسعار منافسة.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 transition shadow-lg shadow-teal-600/20"
              >
                <ShoppingBag className="w-5 h-5" />
                تصفح المنتجات
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-8 text-white shadow-2xl flex flex-col justify-center items-center text-center aspect-[4/3]">
            <Pill className="w-16 h-16 mb-4 opacity-90 animate-bounce" />
            <h2 className="text-3xl font-bold mb-2">خميس فارما</h2>
            <p className="text-teal-100 text-sm">جودة مضمونة • أسعار جملة • توصيل لكل المحافظات</p>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">التصنيفات الرئيسية</h2>
            <p className="text-slate-600">تسوق الأدوية والمستحضرات حسب التخصص</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-300 hover:shadow-lg transition text-center group"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Pill className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-1">منتجات مميزة</h2>
              <p className="text-slate-600">أبرز الأدوية والمنتجات المطلوبة</p>
            </div>
            <Link href="/products" className="text-teal-600 font-bold hover:underline flex items-center gap-1">
              عرض الكل <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="h-40 bg-teal-50 rounded-xl mb-4 flex items-center justify-center text-teal-600 font-bold">
                    {p.name}
                  </div>
                  <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-semibold">{p.brand}</span>
                  <h3 className="font-bold text-slate-900 mt-2 text-lg">{p.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mt-1">{p.description}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-emerald-600 text-lg">{p.price} ر.ي</span>
                  <button className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-700 transition">
                    إضافة للسلة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BESTSELLERS SECTION */}
      {bestsellers.length > 0 && (
        <section className="py-16 bg-teal-900 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">الأكثر مبيعاً</h2>
              <p className="text-teal-200">المنتجات الأكثر طلباً في الصيدليات</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {bestsellers.map((p) => (
                <div key={p.id} className="bg-white text-slate-900 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="h-40 bg-emerald-50 rounded-xl mb-4 flex items-center justify-center text-emerald-700 font-bold">
                      {p.name}
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{p.name}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mt-1">{p.description}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-emerald-600 text-lg">{p.price} ر.ي</span>
                    <button className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-700 transition">
                      طلب
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}