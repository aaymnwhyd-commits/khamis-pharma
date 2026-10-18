import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories as categoriesTable, products as productsTable, reviews as reviewsTable } from "@/db/schema";
import { categories, products, reviewsData, colorThemes } from "@/lib/seed-data";

// Re-export for reference - keep inline function using imported colorThemes
import { eq } from "drizzle-orm";

function generatePlaceholderSvg(theme: string, initials: string) {
  const themes: Record<string, { bg1: string; bg2: string; accent: string }> = {
    "from-emerald-50 to-teal-100": { bg1: "#ecfdf5", bg2: "#ccfbf1", accent: "#0d9488" },
    "from-sky-50 to-blue-100": { bg1: "#f0f9ff", bg2: "#dbeafe", accent: "#0284c7" },
    "from-cyan-50 to-teal-100": { bg1: "#ecfeff", bg2: "#ccfbf1", accent: "#0891b2" },
    "from-indigo-50 to-violet-100": { bg1: "#eef2ff", bg2: "#ede9fe", accent: "#6366f1" },
    "from-rose-50 to-pink-100": { bg1: "#fff1f2", bg2: "#fce7f3", accent: "#e11d48" },
    "from-amber-50 to-orange-100": { bg1: "#fffbeb", bg2: "#ffedd5", accent: "#d97706" },
    "from-lime-50 to-green-100": { bg1: "#f7fee7", bg2: "#dcfce7", accent: "#65a30d" },
    "from-fuchsia-50 to-purple-100": { bg1: "#fdf4ff", bg2: "#f3e8ff", accent: "#c026d3" },
  };
  const t = themes[theme] || themes["from-emerald-50 to-teal-100"];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'>
    <defs>
      <linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stop-color='${t.bg1}'/>
        <stop offset='100%' stop-color='${t.bg2}'/>
      </linearGradient>
    </defs>
    <rect width='600' height='600' fill='url(#g)'/>
    <g opacity='0.25'>
      <circle cx='480' cy='120' r='120' fill='${t.accent}'/>
      <circle cx='100' cy='500' r='80' fill='${t.accent}'/>
    </g>
    <g transform='translate(300,280)'>
      <rect x='-90' y='-110' width='180' height='220' rx='16' fill='white' stroke='${t.accent}' stroke-width='3'/>
      <rect x='-70' y='-80' width='140' height='40' rx='6' fill='${t.accent}' opacity='0.15'/>
      <text x='0' y='-52' text-anchor='middle' font-family='sans-serif' font-size='16' font-weight='700' fill='${t.accent}'>PHARMA</text>
      <text x='0' y='20' text-anchor='middle' font-family='sans-serif' font-size='42' font-weight='800' fill='${t.accent}'>${initials}</text>
      <rect x='-50' y='50' width='100' height='8' rx='4' fill='${t.accent}' opacity='0.3'/>
      <rect x='-30' y='70' width='60' height='6' rx='3' fill='${t.accent}' opacity='0.2'/>
    </g>
    <g transform='translate(300,440)'>
      <rect x='-40' y='-15' width='80' height='30' rx='6' fill='white' stroke='${t.accent}' stroke-width='2'/>
      <circle cx='-12' cy='0' r='8' fill='${t.accent}' opacity='0.3'/>
      <circle cx='12' cy='0' r='8' fill='${t.accent}' opacity='0.3'/>
    </g>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function GET() {
  try {
    // Clear tables in reverse order
    await db.delete(reviewsTable);
    await db.delete(productsTable);
    await db.delete(categoriesTable);

    // Insert categories
    const insertedCategories = await db
      .insert(categoriesTable)
      .values(categories)
      .returning();

    const categoryMap = new Map(
      insertedCategories.map((c) => [c.slug, c.id])
    );

    // Insert products
    for (const p of products) {
      const catId = categoryMap.get(p.categorySlug) || null;
      const initials = p.nameEn
        .split(" ")
        .map((w) => w[0])
        .join("")
        .substring(0, 3)
        .toUpperCase();
      const img = generatePlaceholderSvg(p.imageTheme || colorThemes[0], initials);
      await db.insert(productsTable).values({
        name: p.name,
        nameEn: p.nameEn,
        slug: p.slug,
        brand: p.brand,
        categoryId: catId,
        description: p.description,
        activeIngredient: p.activeIngredient,
        dosage: p.dosage,
        form: p.form,
        packaging: p.packaging,
        price: p.price.toString(),
        oldPrice: p.oldPrice ? p.oldPrice.toString() : null,
        stock: p.stock,
        image: img,
        gallery: JSON.stringify([img]),
        isFeatured: p.isFeatured || false,
        isBestseller: p.isBestseller || false,
        isNew: p.isNew || false,
        rating: 0,
        reviewCount: 0,
      });
    }

    // Get all products to map slugs to IDs
    const allProducts = await db.select().from(productsTable);
    const productSlugMap = new Map(allProducts.map((pr) => [pr.slug, pr.id]));

    // Insert reviews
    let reviewIdx = 0;
    for (const r of reviewsData) {
      const pid = productSlugMap.get(r.productSlug);
      if (pid) {
        await db.insert(reviewsTable).values({
          productId: pid,
          author: r.author,
          pharmacy: r.pharmacy,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          verified: r.verified,
        });
        reviewIdx++;
      }
    }

    // Update product ratings
    for (const p of allProducts) {
      const productReviews = await db
        .select()
        .from(reviewsTable)
        .where(eq(reviewsTable.productId, p.id));
      if (productReviews.length > 0) {
        const avgRating =
          productReviews.reduce((sum, r) => sum + r.rating, 0) /
          productReviews.length;
        await db
          .update(productsTable)
          .set({
            rating: Math.round(avgRating * 10) / 10,
            reviewCount: productReviews.length,
          })
          .where(eq(productsTable.id, p.id));
      }
    }

    return NextResponse.json({
      success: true,
      categories: insertedCategories.length,
      products: allProducts.length,
      reviews: reviewIdx,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
