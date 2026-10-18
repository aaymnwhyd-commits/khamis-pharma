"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Building2,
  FileText,
  CreditCard,
  CheckCircle2,
  Package,
  Truck,
  ShieldCheck,
  Shield,
  Wallet,
  Building,
  Clock,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { useToast } from "@/components/ui/toaster";

type Step = "cart" | "info" | "shipping" | "payment" | "success";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<Step>("info");
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    pharmacy: "",
    city: "",
    address: "",
    notes: "",
    paymentMethod: "cod",
  });

  const shipping = subtotal > 50000 ? 0 : subtotal > 0 ? 1500 : 0;
  const tax = 0;
  const total = subtotal + shipping + tax;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("ar-YE", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(n) + " ر.ي";

  useEffect(() => {
    if (items.length === 0 && step !== "success") {
      router.push("/products");
    }
  }, [items.length, step, router]);

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address || !form.city) {
      toast("يرجى تعبئة جميع الحقول المطلوبة", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items.map((i) => ({
            productId: i.productId,
            product: { ...i.product, price: i.product.price.toString() },
            quantity: i.quantity,
          })),
          shipping,
          total: {
            subtotal,
            tax,
            total,
          },
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderNumber(data.orderNumber);
        setStep("success");
        clearCart();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast(data.error || "حدث خطأ، يرجى المحاولة مرة أخرى", "error");
      }
    } catch {
      toast("تعذر إرسال الطلب، تحقق من الاتصال", "error");
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-12 text-center shadow-xl border border-teal-100 animate-scale-in">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-pulse-ring"></div>
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="font-cairo font-black text-3xl text-slate-900 mb-3">
            تم استلام طلبك بنجاح!
          </h1>
          <p className="text-slate-600 mb-6 leading-relaxed">
            شكراً لك على ثقتك بشركة خميس فارما. سنتواصل معك قريباً لتأكيد الطلب
            وترتيب موعد التوصيل.
          </p>

          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 mb-6 inline-block">
            <div className="text-xs text-slate-500 mb-1">رقم الطلب</div>
            <div className="font-cairo font-black text-2xl text-teal-700">
              #{orderNumber}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-right">
            <h3 className="font-cairo font-bold text-slate-900 mb-3 text-sm">
              ماذا يحدث الآن؟
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                سيتم مراجعة طلبك والتواصل معك خلال 2 ساعة عمل لتأكيد التفاصيل
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                سيتم تجهيز الطلب وتغليفه بعناية وفق معايير الجودة
              </li>
              <li className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                التوصيل خلال 24-48 ساعة حسب محافظتك
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/products"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-l from-teal-600 to-emerald-600 text-white font-cairo font-bold rounded-xl hover:shadow-lg btn-press"
            >
              <ArrowLeft className="w-4 h-4 rotate-180" />
              متابعة التسوق
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-800 font-cairo font-bold rounded-xl hover:border-teal-500 hover:text-teal-700 transition-colors btn-press"
            >
              الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/40 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-teal-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للتسوق
          </Link>
          <h1 className="font-cairo font-black text-3xl text-slate-900">إتمام الطلب</h1>
        </div>

        {/* Steps indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {[
              { s: "info", label: "البيانات", icon: User },
              { s: "shipping", label: "الشحن", icon: Truck },
              { s: "payment", label: "الدفع", icon: CreditCard },
            ].map((st, i) => {
              const currentIdx = ["info", "shipping", "payment"].indexOf(step);
              const thisIdx = i;
              const isActive = step === st.s;
              const isDone = thisIdx < currentIdx;
              return (
                <div key={st.s} className="flex items-center gap-2 md:gap-4">
                  <div
                    className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                        : isDone
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-white border border-slate-200 text-slate-400"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <st.icon className="w-4 h-4" />
                    )}
                    <span className="hidden md:inline">{st.label}</span>
                  </div>
                  {i < 2 && (
                    <div
                      className={`w-8 md:w-16 h-0.5 rounded-full ${
                        isDone ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* FORM */}
          <div className="space-y-6">
            {step === "info" && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 animate-fade-in">
                <h2 className="font-cairo font-bold text-xl text-slate-900 mb-1 flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-600" />
                  بيانات العميل
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  أدخل بيانات الصيدلية أو المستشفى
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    icon={<User className="w-4 h-4" />}
                    label="الاسم الكامل *"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    placeholder="د. / أ. اسم المسؤول"
                  />
                  <FormField
                    icon={<Phone className="w-4 h-4" />}
                    label="رقم الهاتف *"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    placeholder="04 252 627"
                    dir="ltr"
                    type="tel"
                  />
                  <FormField
                    icon={<Building2 className="w-4 h-4" />}
                    label="اسم الصيدلية / المستشفى"
                    value={form.pharmacy}
                    onChange={(v) => setForm({ ...form, pharmacy: v })}
                    placeholder="مثال: صيدلية النور"
                  />
                  <FormField
                    icon={<MapPin className="w-4 h-4" />}
                    label="المحافظة / المدينة *"
                    value={form.city}
                    onChange={(v) => setForm({ ...form, city: v })}
                    placeholder="مثال: تعز"
                  />
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      العنوان التفصيلي *
                    </label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="الحي، الشارع، أقرب معلم..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-sm transition-all resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      ملاحظات إضافية
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="أي ملاحظات خاصة بالطلب أو مواعيد التوصيل..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-sm transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      if (!form.name || !form.phone || !form.address || !form.city) {
                        toast("يرجى تعبئة الحقول المطلوبة (*)", "error");
                        return;
                      }
                      setStep("shipping");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-l from-teal-600 to-emerald-600 text-white font-cairo font-bold rounded-xl hover:shadow-xl hover:shadow-teal-600/20 transition-all btn-press"
                  >
                    متابعة للشحن
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {step === "shipping" && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 animate-fade-in">
                <h2 className="font-cairo font-bold text-xl text-slate-900 mb-1 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-teal-600" />
                  طريقة التوصيل
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  اختر طريقة التوصيل المناسبة لك
                </p>

                <div className="space-y-3">
                  <ShippingOption
                    id="local"
                    title="توصيل داخلي (تعز)"
                    desc="توصيل خلال 24 ساعة داخل مدينة تعز"
                    price="مجاني"
                    icon={<Truck className="w-5 h-5" />}
                    selected
                  />
                  <ShippingOption
                    id="gov"
                    title="توصيل للمحافظات الأخرى"
                    desc="توصيل خلال 2-4 أيام عمل"
                    price={subtotal > 50000 ? "مجاني" : formatPrice(1500)}
                    icon={<Package className="w-5 h-5" />}
                  />
                  <ShippingOption
                    id="pickup"
                    title="استلام من المستودع"
                    desc="استلام مباشر من مستودع الشركة في تعز"
                    price="مجاني"
                    icon={<Building className="w-5 h-5" />}
                  />
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-bold mb-1">معلومات التوصيل</div>
                    <p className="text-amber-800">
                      الطلبات التي تزيد عن 50,000 ر.ي تحصل على شحن مجاني لجميع
                      المحافظات. سنتواصل معك قبل التوصيل لتأكيد الموعد.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-6 gap-3">
                  <button
                    onClick={() => setStep("info")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-cairo font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    السابق
                  </button>
                  <button
                    onClick={() => {
                      setStep("payment");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-l from-teal-600 to-emerald-600 text-white font-cairo font-bold rounded-xl hover:shadow-xl hover:shadow-teal-600/20 transition-all btn-press"
                  >
                    متابعة للدفع
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {step === "payment" && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 animate-fade-in">
                <h2 className="font-cairo font-bold text-xl text-slate-900 mb-1 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-teal-600" />
                  طريقة الدفع
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  اختر طريقة الدفع المناسبة
                </p>

                <div className="space-y-3">
                  <PaymentOption
                    id="cod"
                    selected={form.paymentMethod === "cod"}
                    onSelect={() => setForm({ ...form, paymentMethod: "cod" })}
                    icon={<Wallet className="w-5 h-5" />}
                    title="الدفع عند الاستلام"
                    desc="ادفع نقداً عند استلام الطلب"
                  />
                  <PaymentOption
                    id="bank"
                    selected={form.paymentMethod === "bank"}
                    onSelect={() => setForm({ ...form, paymentMethod: "bank" })}
                    icon={<Building2 className="w-5 h-5" />}
                    title="تحويل بنكي"
                    desc="تحويل بنكي إلى حساب الشركة (يُرسل لكم رقم الحساب بعد تأكيد الطلب)"
                  />
                  <PaymentOption
                    id="credit"
                    selected={form.paymentMethod === "credit"}
                    onSelect={() => setForm({ ...form, paymentMethod: "credit" })}
                    icon={<CreditCard className="w-5 h-5" />}
                    title="بطاقة ائتمان"
                    desc="دفع آمن ببطاقة فيزا أو ماستركارد"
                  />
                </div>

                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-bold mb-1">معاملة آمنة ومضمونة</div>
                    <p className="text-emerald-800">
                      جميع معاملاتك آمنة ومشفرة. لا نقوم بتخزين بيانات البطاقة
                      على خوادمنا.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-6 gap-3">
                  <button
                    onClick={() => setStep("shipping")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-cairo font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    السابق
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-l from-teal-600 to-emerald-600 text-white font-cairo font-bold rounded-xl hover:shadow-xl hover:shadow-teal-600/20 transition-all btn-press disabled:opacity-60 disabled:cursor-wait"
                  >
                    {loading ? (
                      <>جاري إرسال الطلب...</>
                    ) : (
                      <>
                        تأكيد الطلب
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: "معاملة آمنة" },
                { icon: Truck, label: "توصيل سريع" },
                { icon: Package, label: "منتجات أصلية" },
              ].map((b, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 text-center"
                >
                  <b.icon className="w-5 h-5 text-teal-600" />
                  <span className="text-xs font-medium text-slate-700">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-cairo font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" />
                ملخص الطلب
              </h3>

              <div className="divide-y divide-slate-100 mb-4 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 py-3">
                    <div className="relative w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                      <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center z-10 shadow">
                        {item.quantity}
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                  src={item.product.image || ""}
                        alt={item.product.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-cairo font-bold text-sm text-slate-900 line-clamp-2">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.product.brand}
                      </p>
                      <div className="font-cairo font-bold text-sm text-teal-700 mt-1">
                        {formatPrice(parseFloat(item.product.price) * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع الفرعي</span>
                  <span className="font-semibold text-slate-900">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>الشحن</span>
                  <span className="font-semibold text-slate-900">
                    {shipping === 0 ? "مجاني" : formatPrice(shipping)}
                  </span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>الضريبة</span>
                    <span className="font-semibold text-slate-900">{formatPrice(tax)}</span>
                  </div>
                )}
                {subtotal < 50000 && shipping > 0 && (
                  <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100 text-xs text-teal-700">
                    أضف {formatPrice(50000 - subtotal)} للحصول على شحن مجاني
                  </div>
                )}
                <div className="h-px bg-slate-200 my-2" />
                <div className="flex justify-between items-baseline">
                  <span className="font-cairo font-bold text-slate-900 text-base">
                    الإجمالي
                  </span>
                  <span className="font-cairo font-extrabold text-2xl text-teal-700">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({
  icon,
  label,
  value,
  onChange,
  placeholder,
  dir,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
          className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none text-sm transition-all"
        />
      </div>
    </div>
  );
}

function ShippingOption({
  title,
  desc,
  price,
  icon,
  selected,
}: {
  id: string;
  title: string;
  desc: string;
  price: string;
  icon: React.ReactNode;
  selected?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
        selected
          ? "border-teal-500 bg-teal-50/50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
          selected ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-cairo font-bold text-slate-900 text-sm">{title}</div>
        <div className="text-xs text-slate-500">{desc}</div>
      </div>
      <div
        className={`font-cairo font-bold text-sm shrink-0 ${
          selected ? "text-teal-700" : "text-slate-700"
        }`}
      >
        {price}
      </div>
    </label>
  );
}

function PaymentOption({
  selected,
  onSelect,
  icon,
  title,
  desc,
}: {
  id: string;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-right transition-all ${
        selected
          ? "border-teal-500 bg-teal-50/50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
          selected ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0 text-right">
        <div className="font-cairo font-bold text-slate-900 text-sm">{title}</div>
        <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
          selected ? "border-teal-600 bg-teal-600" : "border-slate-300"
        }`}
      >
        {selected && <div className="w-2 h-2 bg-white rounded-full"></div>}
      </div>
    </button>
  );
}
