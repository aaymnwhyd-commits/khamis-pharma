"use client";

import React, { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  image: string;
  description?: string;
  category?: { name: string } | string | null;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    imageUrl: "",
    brand: "خميس فارما",
    description: "",
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("فشل في جلب الأدوية");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تحميل الأدوية");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = (item: Product) => {
    setEditingId(item.id);
    setSelectedFile(null);
    setFormData({
      name: item.name || "",
      price: item.price || "",
      imageUrl: item.image || "",
      brand: item.brand || "خميس فارما",
      description: item.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSelectedFile(null);
    setFormData({ name: "", price: "", imageUrl: "", brand: "خميس فارما", description: "" });
  };

  // دالة رفع الصورة إلى الخادم إذا اختار ملفاً من اللابتوب
  const uploadImageIfNeeded = async (): Promise<string> => {
    if (!selectedFile) return formData.imageUrl;

    setUploading(true);
    const data = new FormData();
    data.append("file", selectedFile);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "فشل رفع الصورة");
      return result.imageUrl;
    } catch (err: any) {
      alert(err.message);
      return formData.imageUrl;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. إذا اختار ملفاً محلياً يتم رفعه واستخدام مساره، وإلا يتم اعتماد رابط الـ URL المدخل
      let finalImageUrl = formData.imageUrl;
      if (selectedFile) {
        finalImageUrl = await uploadImageIfNeeded();
      }

      const isEditing = editingId !== null;
      const url = "/api/products";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing 
        ? { ...formData, imageUrl: finalImageUrl, id: editingId } 
        : { ...formData, imageUrl: finalImageUrl };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "فشل إرسال البيانات");
      }

      alert(isEditing ? "تم تعديل بيانات الدواء بنجاح!" : "تمت إضافة الدواء بنجاح!");
      handleCancelEdit();
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت تأكد من حذف هذا الدواء؟")) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل في حذف الدواء");
      alert("تم الحذف بنجاح");
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8" dir="rtl">
      <h1 className="text-3xl font-bold text-slate-800">لوحة إدارة الأدوية - خميس فارما</h1>

      {/* نموذج الإضافة والتعديل */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4 border">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-700">
            {editingId ? "تعديل بيانات الدواء" : "إضافة دواء جديد"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-sm bg-slate-200 text-slate-700 px-3 py-1 rounded hover:bg-slate-300 transition-colors"
            >
              إلغاء التعديل
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="اسم الدواء (إجباري)"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="number"
            step="0.01"
            placeholder="السعر (إجباري)"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="border p-2 rounded w-full"
          />

          {/* 1. حقل رابط الصورة الخارجي كما هو */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm text-slate-600 font-medium">رابط الصورة (Image URL)</label>
            <input
              type="text"
              placeholder="ضع رابط الصورة هنا..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* 2. حقل اختيار ملف من الجهاز يوضع تحته كخيار إضافي */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm text-slate-600 font-medium">أو اختر صورة من اللابتوب</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="border p-1.5 rounded w-full text-sm bg-slate-50"
            />
          </div>

          <input
            type="text"
            placeholder="اسم الشركة/الماركة"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="border p-2 rounded w-full md:col-span-2"
          />
        </div>

        <textarea
          placeholder="وصف الدواء..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border p-2 rounded w-full h-24"
        />

        <button
          type="submit"
          disabled={uploading}
          className={`${
            editingId ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
          } text-white px-6 py-2 rounded font-medium transition-colors disabled:opacity-50`}
        >
          {uploading ? "جاري رفع الصورة..." : editingId ? "حفظ التعديلات" : "حفظ وإضافة الدواء"}
        </button>
      </form>

      {/* جدول الأدوية */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">قائمة الأدوية المتاحة</h2>
        {loading ? (
          <p>جاري التحميل...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">الصورة</th>
                <th className="p-3">اسم الدواء</th>
                <th className="p-3">السعر</th>
                <th className="p-3">القسم</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                  </td>
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">{item.price} $</td>
                  <td className="p-3 text-slate-600">
                    {typeof item.category === "object" && item.category !== null
                      ? (item.category as any).name
                      : item.category || "عام"}
                  </td>
                  <td className="p-3 space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="bg-amber-500 text-white px-3 py-1 rounded text-sm hover:bg-amber-600 ml-2"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}