import { db } from "./index";
import * as schema from "./schema";
import { categories as seedCategories } from "../lib/seed-data";

async function main() {
  console.log("🌱 جاري إدخال البيانات التجريبية إلى قاعدة البيانات...");

  console.log("📁 جاري إدخال التصنيفات...");
  for (const cat of seedCategories) {
    await db.insert(schema.categories).values({
      name: cat.name,
      nameEn: cat.nameEn,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
    }).onConflictDoNothing();
  }

  console.log("✅ تمت إضافة التصنيفات بنجاح وتعبئة قاعدة البيانات!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ حدث خطأ أثناء إدخال البيانات:", err);
  process.exit(1);
});