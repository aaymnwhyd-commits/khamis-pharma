import { db } from "./index"; // تأكد من مسار استيراد db لديك
import { categories, products } from "./schema"; // تأكد من مسار schema

async function main() {
  console.log("🌱 جاري إضافة البيانات التجريبية...");

  // 1. إضافة التصنيفات
  const insertedCategories = await db.insert(categories).values([
    {
      name: "المضادات الحيوية",
      name_en: "Antibiotics",
      slug: "antibiotics",
      description: "أدوية علاج العدوى البكتيرية",
      icon: "Pill",
    },
    {
      name: "المسكنات وخافضات الحرارة",
      name_en: "Pain Relief",
      slug: "pain-relief",
      description: "مسكنات الألم ومضادات التهابات",
      icon: "HeartPulse",
    },
    {
      name: "الفيتامينات والمكملات",
      name_en: "Vitamins & Supplements",
      slug: "vitamins",
      description: "مكملات غذائية وفيتامينات صحية",
      icon: "Apple",
    },
  ]).returning();

  console.log("✅ تم إضافة التصنيفات بنجاح");

  // 2. إضافة المنتجات (الأدوية)
  await db.insert(products).values([
    {
      name: "أموكسيسيلين 500 ملجم",
      name_en: "Amoxicillin 500mg",
      slug: "amoxicillin-500mg",
      brand: "Khamis Pharma",
      categoryId: insertedCategories[0].id,
      description: "مضاد حيوي واسع المجال لعلاج التهابات الحلق والشعب الهوائية.",
      activeIngredient: "Amoxicillin",
      dosage: "500mg",
      form: "كبسولات",
      packaging: "شريط 20 كبسولة",
      price: "15.00",
      stock: 100,
      image: "/images/products/amoxicillin.png",
      isFeatured: true,
      isBestseller: true,
    },
    {
      name: "باراسيتامول 500 ملجم",
      name_en: "Paracetamol 500mg",
      slug: "paracetamol-500mg",
      brand: "Khamis Pharma",
      categoryId: insertedCategories[1].id,
      description: "مسكن للألم وخافض للحرارة سريع المفعول.",
      activeIngredient: "Paracetamol",
      dosage: "500mg",
      form: "أقراص",
      packaging: "عبوة 24 قرص",
      price: "5.00",
      stock: 250,
      image: "/images/products/paracetamol.png",
      isFeatured: true,
      isBestseller: true,
    },
    {
      name: "فيتامين سي 1000 ملجم فوار",
      name_en: "Vitamin C 1000mg Effervescent",
      slug: "vitamin-c-1000mg",
      brand: "Khamis Pharma",
      categoryId: insertedCategories[2].id,
      description: "مكمل غذائي لدعم المناعة والوقاية من أزمات البرد.",
      activeIngredient: "Ascorbic Acid",
      dosage: "1000mg",
      form: "أقراص فوارة",
      packaging: "أنبوب 20 قرص",
      price: "12.50",
      stock: 80,
      image: "/images/products/vitaminc.png",
      isNew: true,
    },
  ]);

  console.log("🎉 تم رفع البيانات التجريبية إلى قاعدة البيانات بنجاح!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ حدث خطأ أثناء إضافة البيانات:", err);
  process.exit(1);
});