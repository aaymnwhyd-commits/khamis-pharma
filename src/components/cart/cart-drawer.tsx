"use client";

import Link from "next/link";
import { useCart } from "./cart-context";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Package } from "lucide-react";
import { useToast } from "../ui/toaster"; // تم تعديل المسار هنا بنجاح
import { useRouter } from "next/navigation";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const shipping = subtotal > 50000 ? 0 : subtotal > 0 ? 1500 : 0;
  const tax = Math.round(subtotal * 0);
  const total = subtotal + shipping + tax;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("ar-YE", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(n) + " ر.ي";

  const handleCheckout = () => {
    if (items.length === 0) {
      toast("السلة فارغة", "info");
      return;
    }
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/50 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-l from-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-cairo font-bold text-lg text-slate-900">
                سلة التسوق
              </h2>
              <p className="text-xs text-slate-500">
                {items.length > 0
                  ? `${items.reduce((s, i) => s + i.quantity, 0)} منتج في السلة`
                  : "السلة فارغة"}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mb-4 animate-float">
                <Package className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="font-cairo font-bold text-xl text-slate-900 mb-2">
                السلة فارغة
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-xs">
                ابدأ بإضافة المنتجات إلى السلة لاستكمال طلبك. نحن نوفر أفضل الأدوية بأسعار الجملة.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  router.push("/products");
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors btn-press shadow-lg shadow-teal-600/20"
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
                تصفح المنتجات
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.productId} className="p-4 flex gap-3 group">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
                    <img
                      src={item.product.image || ""}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-cairo font-bold text-sm text-slate-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {item.product.brand}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        aria-label="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-slate-200 rounded-full overflow-hidden bg-white">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="font-cairo font-bold text-teal-700 text-sm">
                        {formatPrice(parseFloat(item.product.price) * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer (summary) */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 p-6 bg-slate-50/50 space-y-4">
            {shipping === 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <Package className="w-4 h-4" />
                تهانينا! لقد حصلت على شحن مجاني
              </div>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>الشحن والتوصيل</span>
                <span className="font-semibold text-slate-900">
                  {shipping === 0 ? "مجاني" : formatPrice(shipping)}
                </span>
              </div>
              <div className="h-px bg-slate-200 my-2" />
              <div className="flex justify-between items-baseline">
                <span className="font-cairo font-bold text-base text-slate-900">الإجمالي</span>
                <span className="font-cairo font-extrabold text-xl text-teal-700">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCheckout}
                className="col-span-2 w-full py-3.5 bg-gradient-to-l from-teal-600 to-emerald-600 text-white font-cairo font-bold rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-all btn-press shadow-lg shadow-teal-600/20"
              >
                إتمام الطلب
              </button>
              <button
                onClick={() => {
                  clearCart();
                  toast("تم تفريغ السلة", "info");
                }}
                className="py-2.5 text-sm text-slate-600 hover:text-rose-600 border border-slate-200 rounded-xl hover:border-rose-200 transition-colors"
              >
                تفريغ السلة
              </button>
              <Link
                href="/products"
                onClick={closeCart}
                className="py-2.5 text-sm text-slate-600 hover:text-teal-700 border border-slate-200 rounded-xl hover:border-teal-200 transition-colors flex items-center justify-center"
              >
                متابعة التسوق
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}