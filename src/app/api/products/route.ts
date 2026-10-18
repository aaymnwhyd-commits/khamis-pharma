import { NextResponse } from "next/server";
import { db } from "@/db";
import { products as productsTable, categories as categoriesTable } from "@/db/schema";
import { eq, desc, asc, sql, and, ilike, or } from "drizzle-orm";
import type { SortOption } from "@/lib/types";

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
