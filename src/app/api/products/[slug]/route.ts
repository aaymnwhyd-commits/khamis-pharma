import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  products as productsTable,
  categories as categoriesTable,
  reviews as reviewsTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const rows = await db
    .select({
      product: productsTable,
      categoryName: categoriesTable.name,
      categorySlug: categoriesTable.slug,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.slug, slug))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const row = rows[0];

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, row.product.id))
    .orderBy(reviewsTable.createdAt);

  const related = await db
    .select({
      product: productsTable,
    })
    .from(productsTable)
    .where(
      row.product.categoryId
        ? eq(productsTable.categoryId, row.product.categoryId)
        : eq(productsTable.id, 0)
    )
    .limit(4);

  let gallery: string[] = [];
  try {
    gallery = row.product.gallery
      ? typeof row.product.gallery === "string"
        ? JSON.parse(row.product.gallery)
        : row.product.gallery
      : [];
  } catch {
    gallery = row.product.image ? [row.product.image] : [];
  }

  const product = {
    ...row.product,
    gallery,
    category: row.categoryName
      ? { name: row.categoryName, slug: row.categorySlug }
      : null,
    reviews,
    related: related
      .map((r) => {
        let relGallery: string[] = [];
        try {
          relGallery = r.product.gallery
            ? typeof r.product.gallery === "string"
              ? JSON.parse(r.product.gallery)
              : (r.product.gallery as unknown as string[])
            : [];
        } catch {
          relGallery = r.product.image ? [r.product.image] : [];
        }
        return { ...r.product, gallery: relGallery };
      })
      .filter((p) => p.id !== row.product.id)
      .slice(0, 4),
  };

  return NextResponse.json({ product });
}
