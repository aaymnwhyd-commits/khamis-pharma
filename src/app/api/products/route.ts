import { NextResponse } from "next/server";
import { db } from "@/db";
import { products as productsTable, categories as categoriesTable } from "@/db/schema";
import { eq, desc, asc, sql, and, ilike, or } from "drizzle-orm";
import type { SortOption } from "@/lib/types";

// 1. دالة الجلب (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = (searchParams.get("sort") || "featured") as SortOption;
  const featured = searchParams.get("featured") === "true";
  const bestseller = searchParams.get("bestseller") === "true";
  const newItems = searchParams.get("new") === "true";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "48");

  let query = db
    .select({
      product: productsTable,
      categoryName: categoriesTable.name,
      categorySlug: categoriesTable.slug,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .$dynamic();

  const conditions = [];

  if (category && category !== "all") {
    conditions.push(eq(categoriesTable.slug, category));
  }
  if (search) {
    conditions.push(
      or(
        ilike(productsTable.name, `%${search}%`),
        ilike(productsTable.nameEn, `%${search}%`),
        ilike(productsTable.brand, `%${search}%`),
        ilike(productsTable.activeIngredient, `%${search}%`)
      )
    );
  }
  if (featured) {
    conditions.push(eq(productsTable.isFeatured, true));
  }
  if (bestseller) {
    conditions.push(eq(productsTable.isBestseller, true));
  }
  if (newItems) {
    conditions.push(eq(productsTable.isNew, true));
  }
  if (minPrice) {
    conditions.push(sql`${productsTable.price} >= ${parseFloat(minPrice)}`);
  }
  if (maxPrice) {
    conditions.push(sql`${productsTable.price} <= ${parseFloat(maxPrice)}`);
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  switch (sort) {
    case "price-asc":
      query = query.orderBy(asc(productsTable.price));
      break;
    case "price-desc":
      query = query.orderBy(desc(productsTable.price));
      break;
    case "rating":
      query = query.orderBy(desc(productsTable.rating));
      break;
    case "newest":
      query = query.orderBy(desc(productsTable.createdAt));
      break;
    default:
      query = query.orderBy(
        desc(productsTable.isFeatured),
        desc(productsTable.isBestseller),
        asc(productsTable.name)
      );
  }

  const offset = (page - 1) * limit;
  query = query.limit(limit).offset(offset);

  const rows = await query;

  const products = rows.map((r) => {
    let gallery: string[] = [];
    try {
      gallery = r.product.gallery
        ? typeof r.product.gallery === "string"
          ? JSON.parse(r.product.gallery)
          : r.product.gallery
        : [];
    } catch {
      gallery = r.product.image ? [r.product.image] : [];
    }
    return {
      ...r.product,
      gallery,
      category: r.categoryName
        ? { id: 0, name: r.categoryName, slug: r.categorySlug, nameEn: "" }
        : null,
    };
  });

  return NextResponse.json({ products, page, limit });
}

// دالة تعديل دواء (PUT) - مع دعم التصنيف
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, price, imageUrl, brand, description, nameEn, categoryId } = body;

    if (!id) {
      return NextResponse.json({ error: "رقم الدواء (ID) مطلوب للتعديل" }, { status: 400 });
    }

    const updatedProduct = await db
      .update(productsTable)
      .set({
        name: name,
        nameEn: nameEn || name,
        price: price.toString(),
        image: imageUrl || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae",
        brand: brand || "خميس فارما",
        description: description || "",
        categoryId: categoryId ? Number(categoryId) : null,
      })
      .where(eq(productsTable.id, Number(id)))
      .returning();

    return NextResponse.json({ message: "تم تحديث الدواء بنجاح", product: updatedProduct[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "حدث خطأ أثناء التعديل" }, { status: 500 });
  }
}

// 2. دالة إضافة دواء جديد (POST) - مع دعم التصنيف تلقائياً
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, categoryId, imageUrl, brand, nameEn } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: "اسم الدواء والسعر حقول أساسية مطلوبة" },
        { status: 400 }
      );
    }

    const slugBase = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");
    const slug = `${slugBase}-${Date.now()}`;

    const newProduct = await db.insert(productsTable).values({
      name,
      nameEn: nameEn || name,
      slug,
      brand: brand || "خميس فارما",
      description: description || "لا توجد مواصفات مضافة حالياً",
      price: price.toString(),
      stock: 10,
      image: imageUrl || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae",
      gallery: JSON.stringify(imageUrl ? [imageUrl] : []),
      categoryId: categoryId ? Number(categoryId) : null, // ربط التصنيف بشكل صحيح
      isFeatured: false,
      isBestseller: false,
      isNew: true,
    }).returning();

    return NextResponse.json({ success: true, product: newProduct[0] });
  } catch (error: any) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إضافة الدواء: " + error.message },
      { status: 500 }
    );
  }
}

// 3. دالة حذف دواء (DELETE)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرّف الدواء (ID) مطلوب للحذف" }, { status: 400 });
    }

    await db.delete(productsTable).where(eq(productsTable.id, parseInt(id)));

    return NextResponse.json({ success: true, message: "تم حذف الدواء بنجاح" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "فشل حذف الدواء: " + error.message },
      { status: 500 }
    );
  }
}