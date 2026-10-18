import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders as ordersTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// 1. جلب الطلبات (GET)
export async function GET() {
  try {
    const allOrders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt));

    return NextResponse.json({ orders: allOrders });
  } catch (error) {
    return NextResponse.json(
      { error: "فشل في جلب الطلبات" },
      { status: 500 }
    );
  }
}

// 2. حذف/أرشفة الطلب بعد اكتماله (DELETE)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get("id");

    if (!idStr) {
      return NextResponse.json(
        { error: "معرف الطلب (ID) مطلوب" },
        { status: 400 }
      );
    }

    const orderId = parseInt(idStr, 10);

    // حذف الطلب من جدول الطلبات بناءً على الـ ID
    await db.delete(ordersTable).where(eq(ordersTable.id, orderId));

    return NextResponse.json({ success: true, message: "تم حذف الطلب بنجاح" });
  } catch (error) {
    console.error("خطأ أثناء حذف الطلب:", error);
    return NextResponse.json(
      { error: "فشل في حذف الطلب من قاعدة البيانات" },
      { status: 500 }
    );
  }
}