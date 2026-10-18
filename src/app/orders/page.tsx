"use client";

import { useEffect, useState, useRef } from "react";

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  total: number;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(false); // حالة لإظهار رسالة التنبيه المرئية
  const prevOrdersCountRef = useRef<number>(0);

  // دالة لجلب الطلبات
  async function fetchOrders(isInitial = false) {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.orders) {
        const newOrders: Order[] = data.orders;
        
        // إذا زاد عدد الطلبات، قم بإظهار رسالة التنبيه المرئية
        if (!isInitial && newOrders.length > prevOrdersCountRef.current) {
          setNewOrderAlert(true);
        }

        prevOrdersCountRef.current = newOrders.length;
        setOrders(newOrders);
      }
    } catch (error) {
      console.error("خطأ أثناء جلب الطلبات:", error);
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }

  // الجلب الأولي وتفعيل التحديث التلقائي كل 5 ثوانٍ
  useEffect(() => {
    fetchOrders(true);

    const interval = setInterval(() => {
      fetchOrders(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // دالة حذف الطلب بعد اكتماله
  async function handleDeleteOrder(id: number) {
    if (!confirm("هل أنت متأكد أن الطلب تم توصيله وتريد إزالته من قائمة الطلبات الجديدة؟")) return;

    try {
      const res = await fetch(`/api/orders?id=${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        const updatedOrders = orders.filter((order) => order.id !== id);
        setOrders(updatedOrders);
        prevOrdersCountRef.current = updatedOrders.length;
      } else {
        alert("فشل حذف الطلب");
      }
    } catch (error) {
      console.error("خطأ أثناء حذف الطلب:", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">جاري تحميل طلبات العملاء...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 dir-rtl text-right">
      <div className="max-w-5xl mx-auto">
        
        {/* 🚨 رسالة التنبيه المرئية البارزة عند وصول طلب جديد */}
        {newOrderAlert && (
          <div className="mb-6 bg-emerald-600 border-2 border-emerald-700 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <h4 className="font-bold text-lg">تنبيه: وصل طلب جديد للمتجر!</h4>
                <p className="text-sm text-emerald-100">تم تحديث القائمة وإضافة الطلب الجديد أدناه.</p>
              </div>
            </div>
            <button
              onClick={() => setNewOrderAlert(false)}
              className="bg-white text-emerald-800 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-50 transition-colors"
            >
              إخفاء التنبيه
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              📋 لوحة إشعار الطلبات الفورية
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              إدارة واستعراض طلبيات عملاء "خميس فارما" (تحديث تلقائي مع تنبيه مرئي)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrders(false)}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              🔄 تحديث القائمة
            </button>
            <div className="bg-emerald-100 text-emerald-800 text-sm font-semibold px-4 py-2 rounded-full">
              إجمالي الطلبات: {orders.length}
            </div>
          </div>
        </div>

        {/* Orders List / Cards Grid */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-lg font-bold text-gray-800">لا توجد طلبات معلقة حالياً</h3>
            <p className="text-gray-500 text-sm mt-1">نظام المراقبة يعمل في الخلفية بانتظار الطلبات الجديدة...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order: Order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header of Card */}
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-md">
                      طلب #{order.id}
                    </span>
                    <span className="text-xs text-gray-400">
                      📅 {order.createdAt ? new Date(order.createdAt).toLocaleString("ar-YE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }) : ''}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center gap-2 text-gray-800">
                      <span className="font-semibold text-gray-500 w-20">العميل:</span>
                      <span className="font-bold text-gray-900">{order.customerName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-800">
                      <span className="font-semibold text-gray-500 w-20">الهاتف:</span>
                      <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded dir-ltr text-right">
                        📞 {order.customerPhone}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-gray-800">
                      <span className="font-semibold text-gray-500 w-20">العنوان:</span>
                      <span className="text-gray-700">
                        📍 {order.customerCity} - {order.customerAddress}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer of Card with Action Button */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-400 block">الإجمالي</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {order.total ? `${order.total} $` : '0 $'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    ✅ تم التوصيل والإزالة
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}