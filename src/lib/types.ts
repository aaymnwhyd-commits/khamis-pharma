export type Category = {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
};

export type Product = {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  brand: string;
  categoryId: number | null;
  description: string;
  activeIngredient?: string | null;
  dosage?: string | null;
  form?: string | null;
  packaging?: string | null;
  price: string;
  oldPrice?: string | null;
  stock: number;
  image: string;
  gallery: string[] | null;
  isFeatured: boolean | null;
  isBestseller: boolean | null;
  isNew: boolean | null;
  rating: number | null;
  reviewCount: number | null;
  createdAt: Date | null;
  category?: Category | null;
  reviews?: Review[];
};

export type Review = {
  id: number;
  productId: number;
  author: string;
  pharmacy?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  verified: boolean | null;
  createdAt: Date | null;
};

export type CartItem = {
  productId: number;
  product: Product;
  quantity: number;
};

export type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "newest";
