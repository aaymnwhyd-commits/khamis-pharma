import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "لم يتم اختيار أي ملف" }, { status: 400 });
    }

    // اسم فريد للصورة لتجنب تكرار الأسماء وتخزينها في مجلد products داخل Vercel Blob
    const filename = `products/${Date.now()}-${file.name.replace(/\s/g, "_")}`;

    // رفع الملف مباشرة إلى Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    });

    // إرجاع الرابط السحابي المباشر ليتم حفظه في قاعدة البيانات ويظهر أونلاين للجميع
    return NextResponse.json({ success: true, imageUrl: blob.url });
  } catch (error: any) {
    return NextResponse.json({ error: "فشل رفع الصورة: " + error.message }, { status: 500 });
  }
}