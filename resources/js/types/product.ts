export interface ProductColor {
  id?: number;
  name: string;
  hex: string;
  sort_order?: number;
}

export interface ProductReview {
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  collection: "new-arrivals" | "best-sellers" | "oversized" | "limited-edition";
  colors: ProductColor[];
  sizes: ("XS" | "S" | "M" | "L")[];
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
  fabricDetails: string;
  careInstructions: string;
  story: string;
  reviews: ProductReview[];
  inStock: boolean;
  stock: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  featured?: boolean;
  active?: boolean;
  sortOrder?: number;
}
