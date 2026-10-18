import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';

// قراءة متغيرات البيئة من .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL غير موجود في ملف .env.local");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// قائمة التصنيفات الكاملة
const categories = [
  {
    name: "المضادات الحيوية",
    nameEn: "Antibiotics",
    slug: "antibiotics",
    description: "مجموعة واسعة من المضادات الحيوية للعدوى البكتيرية",
    icon: "Pill",
  },
  {
    name: "المسكنات وخافضات الحرارة",
    nameEn: "Pain Relief",
    slug: "pain-relief",
    description: "مسكنات للألم وخافضات للحرارة",
    icon: "Thermometer",
  },
  {
    name: "أدوية القلب والضغط",
    nameEn: "Cardiovascular",
    slug: "cardiovascular",
    description: "أدوية القلب وضغط الدم والكوليسترول",
    icon: "Heart",
  },
  {
    name: "السكري",
    nameEn: "Diabetes",
    slug: "diabetes",
    description: "أدوية السكري والأنسولين",
    icon: "Droplet",
  },
  {
    name: "الجهاز الهضمي",
    nameEn: "Gastrointestinal",
    slug: "gastrointestinal",
    description: "أدوية المعدة والجهاز الهضمي",
    icon: "Salad",
  },
  {
    name: "الفيتامينات والمكملات",
    nameEn: "Vitamins",
    slug: "vitamins",
    description: "فيتامينات ومعادن ومكملات غذائية",
    icon: "Leaf",
  },
  {
    name: "أدوية الجهاز التنفسي",
    nameEn: "Respiratory",
    slug: "respiratory",
    description: "أدوية الربو والحساسية والبرد",
    icon: "Wind",
  },
  {
    name: "العناية بالبشرة والجروح",
    nameEn: "Skin Care",
    slug: "skin-care",
    description: "مراهم جلدية ومطهرات ومنتجات العناية",
    icon: "Sparkles",
  },
];

async function main() {
  console.log("🌱 جاري إدخال جميع التصنيفات إلى قاعدة بيانات Neon...");

  for (const cat of categories) {
    try {
      await db.execute(`
        INSERT INTO categories (name, name_en, slug, description, icon)
        VALUES ('${cat.name}', '${cat.nameEn}', '${cat.slug}', '${cat.description}', '${cat.icon}')
        ON CONFLICT (slug) DO NOTHING;
      `);
      console.log(`✅ تم إدخال التصنيف: ${cat.name}`);
    } catch (err) {
      console.error(`❌ خطأ في إدخال ${cat.name}:`, err.message);
    }
  }

  console.log("🎉 تمت عملية تعبئة قاعدة البيانات بنجاح تام وإدخال كل التصنيفات!");
  process.exit(0);
}

main();