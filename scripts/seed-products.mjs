import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { pgTable, serial, varchar, text, numeric, integer, boolean } from 'drizzle-orm/pg-core';

const dbUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;

if (!dbUrl) {
  console.error('❌ لم يتم العثور على DATABASE_URL في ملف .env.local!');
  process.exit(1);
}

const sql = neon(dbUrl);
const db = drizzle(sql);

// مطابق تماماً للشيما الخاصة بك
const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 255 }).notNull(),
  categoryId: integer("category_id"),
  description: text("description").notNull(),
  activeIngredient: varchar("active_ingredient", { length: 255 }),
  dosage: varchar("dosage", { length: 100 }),
  form: varchar("form", { length: 100 }),
  packaging: varchar("packaging", { length: 100 }),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  image: text("image").notNull(),
  isFeatured: boolean("is_featured").default(false),
  isBestseller: boolean("is_bestseller").default(false),
  isNew: boolean("is_new").default(false),
});

async function main() {
  console.log('🚀 جاري جلب التصنيفات وإدخال الأدوية...');

  // جلب التصنيفات للحصول على الـ ID الحقيقي (Integer)
  const allCategories = await db.select().from(categories);

  if (allCategories.length === 0) {
    console.error('❌ لا توجد تصنيفات في قاعدة البيانات! يرجى إدخال التصنيفات أولاً.');
    return;
  }

  const defaultCatId = allCategories[0].id; // أخذ أول ID رقمي متاح

  // قائمة الأدوية التجريبية مطابقة لجميع الحقول الإجبارية
  const sampleProducts = [
    {
      name: 'بندول إكسترا',
      nameEn: 'Panadol Extra',
      slug: 'panadol-extra',
      brand: 'GSK',
      categoryId: defaultCatId,
      description: 'مسكن قوي للآلام والصداع وخفض الحرارة.',
      activeIngredient: 'Paracetamol + Caffeine',
      dosage: '500mg',
      form: 'أقراص',
      packaging: 'شريط (24 قرص)',
      price: '15.00',
      stock: 100,
      image: '/images/products/panadol.jpg',
      isFeatured: true,
      isBestseller: true,
      isNew: false,
    },
    {
      name: 'أومكس مضاد حيوي',
      nameEn: 'Amoxil 500mg',
      slug: 'amoxil-500mg',
      brand: 'GSK',
      categoryId: defaultCatId,
      description: 'مضاد حيوي واسع المجال لعلاج الالتهابات البكتيرية.',
      activeIngredient: 'Amoxicillin',
      dosage: '500mg',
      form: 'كبسولات',
      packaging: 'علبة (20 كبسولة)',
      price: '45.00',
      stock: 50,
      image: '/images/products/amoxil.jpg',
      isFeatured: false,
      isBestseller: true,
      isNew: true,
    },
    {
      name: 'كريم بيبانثين المرطب',
      nameEn: 'Bepanthen Cream',
      slug: 'bepanthen-cream',
      brand: 'Bayer',
      categoryId: defaultCatId,
      description: 'كريم مرطب للعناية بالبشرة والمساعدة في التئام الجروح والتشققات.',
      activeIngredient: 'Dexpanthenol',
      dosage: '5%',
      form: 'كريم',
      packaging: 'أنبوب 30 جرام',
      price: '30.00',
      stock: 75,
      image: '/images/products/bepanthen.jpg',
      isFeatured: true,
      isBestseller: false,
      isNew: true,
    },
  ];

  for (const prod of sampleProducts) {
    await db.insert(products).values(prod);
    console.log(`✅ تم إدخال المنتج بنجاح: ${prod.name}`);
  }

  console.log('🎉 تمت تعبئة جدول المنتجات بالكامل بنجاح تام!');
}

main().catch((err) => {
  console.error('❌ حدث خطأ أثناء الإدخال:', err);
});