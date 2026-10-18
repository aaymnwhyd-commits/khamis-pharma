import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import nodemailer from "nodemailer";

// ✉️ ضع بريدك الإلكتروني وكلمة المرور (App Password) هنا:
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "aaymnwhed@gmail.com", // استبدل هذا ببريدك (مثال: ayman@gmail.com)
    pass: "wcii vzgq kmrc jhoi",  // استبدل هذا برمز الـ 16 حرفاً الذي نسخته من جوجل
  },
});

export async function POST(request: Request) {
  const body = await request.json();
  const { customer, items, total, shipping, notes } = body;

  try {
    const [order] = await db
      .insert(orders)
      .values({
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        customerCity: customer.city,
        pharmacyName: customer.pharmacy,
        notes: notes || null,
        subtotal: total.subtotal.toString(),
        shipping: shipping.toString(),
        tax: total.tax.toString(),
        total: total.total.toString(),
        status: "pending",
        paymentMethod: customer.paymentMethod || "cod",
      })
      .returning();

    for (const item of items) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        total: (parseFloat(item.product.price) * item.quantity).toString(),
      });
    }

    const orderNumber = order.id.toString().padStart(6, "0");

    // إرسال إيميل تنبيه فوري بالطلب الجديد
    try {
      const itemsList = items
        .map((i: any) => `• ${i.product.name} (الكمية: ${i.quantity})`)
        .join("\n");

      await transporter.sendMail({
        from: '"خميس فارما 🩺" <YOUR_EMAIL@gmail.com>', // ضع بريدك هنا أيضاً
        to: "YOUR_EMAIL@gmail.com", // ✉️ البريد الذي ستصلك عليه رسالة التنبيه على تلفونك
        subject: `🚨 طلب جديد #${orderNumber} - خميس فارما`,
        text: `
تنبيه: وصل طلب جديد في نظام خميس فارما!

📋 رقم الطلب: #${orderNumber}
👤 اسم العميل: ${customer.name}
📞 الهاتف: ${customer.phone}
📍 العنوان: ${customer.city} - ${customer.address}
🏥 الصيدلية: ${customer.pharmacy || "غير محدد"}

📦 المنتجات المطلوبة:
${itemsList}

💰 الإجمالي: ${total.total} $
        `,
      });
    } catch (emailError) {
      console.error("فشل إرسال إيميل التنبيه ولكن تم حفظ الطلب:", emailError);
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId: order.id,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}