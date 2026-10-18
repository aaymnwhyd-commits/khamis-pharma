import Link from "next/link";
import {
  Pill,
  Phone,
  MapPin,
  Mail,
  Truck,
  ShieldCheck,
  Headphones,
  Clock,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      {/* Features strip */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: "توصيل سريع", desc: "لكل المحافظات" },
            { icon: ShieldCheck, title: "منتجات أصلية", desc: "ضمان الجودة 100%" },
            { icon: Headphones, title: "دعم 24/7", desc: "خدمة عملاء متميزة" },
            { icon: Clock, title: "خبرة طويلة", desc: "أكثر من 20 عاماً" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <div className="font-cairo font-bold text-white text-sm">{f.title}</div>
                <div className="text-xs text-slate-400">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Company */}
        <div>
          <Link href="/" className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-cairo font-extrabold text-lg text-white leading-tight">
                خميس فارما
              </div>
              <div className="text-xs text-teal-400 font-medium">KHAMIS PHARMA</div>
            </div>
          </Link>
          <p className="text-sm leading-relaxed text-slate-400 mb-4">
            شركة خميس لتجارة الأدوية، المورد الموثوق للأدوية والمستحضرات الصيدلانية
            للصيدليات والمستشفيات والمراكز الطبية في اليمن منذ أكثر من عقدين.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-cairo font-bold text-white mb-4">روابط سريعة</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { href: "/", label: "الرئيسية" },
              { href: "/products", label: "جميع المنتجات" },
              { href: "/products?bestseller=true", label: "الأكثر مبيعاً" },
              { href: "/products?featured=true", label: "منتجات مميزة" },
              { href: "/#about", label: "عن الشركة" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="hover:text-teal-400 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors"></span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-cairo font-bold text-white mb-4">التصنيفات</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { href: "/products?category=antibiotics", label: "المضادات الحيوية" },
              { href: "/products?category=pain-relief", label: "المسكنات" },
              { href: "/products?category=cardiovascular", label: "أدوية القلب" },
              { href: "/products?category=diabetes", label: "السكري" },
              { href: "/products?category=vitamins", label: "الفيتامينات" },
              { href: "/products", label: "جميع التصنيفات" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="hover:text-teal-400 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors"></span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-cairo font-bold text-white mb-4">تواصل معنا</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                H2Q5+R67، طريق وادي القاضي،
                <br />
                تعز، اليمن
              </span>
            </li>
            <li>
              <a
                href="tel:+9674252627"
                className="flex items-center gap-3 hover:text-teal-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span dir="ltr">+967 4 252 627</span>
              </a>
            </li>
            <li>
              <a
                href="mailto:info@khamis-pharma.com"
                className="flex items-center gap-3 hover:text-teal-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span dir="ltr">info@khamis-pharma.com</span>
              </a>
            </li>
          </ul>

          <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-white text-sm">ساعات العمل</span>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>السبت - الخميس</span>
                <span className="text-teal-400 font-medium">8:00 - 20:00</span>
              </div>
              <div className="flex justify-between">
                <span>الجمعة</span>
                <span className="text-slate-500">مغلق</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} شركة خميس فارما. جميع الحقوق محفوظة.
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-teal-400 transition-colors">
              سياسة الخصوصية
            </Link>
            <Link href="#" className="hover:text-teal-400 transition-colors">
              الشروط والأحكام
            </Link>
            <Link href="#" className="hover:text-teal-400 transition-colors">
              سياسة الإرجاع
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
