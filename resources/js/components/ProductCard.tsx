import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { type Product } from "@/types/product";
import { useProducts } from "@/hooks/useProducts";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const colorMap: Record<string, string> = {
  "Ivory": "#F5F0E8",
  "Black": "#1A1A1A",
  "Mocha": "#8C6A56",
  "Olive": "#5C5C3D",
  "Pink": "#F4A7B9",
  "Sky Blue": "#87CEEB",
  "Grey": "#8E8E93",
  "Dark Pink": "#C24F6C",
  "Taupe": "#8B8579",
  "Clove Green": "#5C5C3D",
  "Brown": "#8C6A56",
  "Blue": "#4A90E2",
  "Light Blue": "#ADD8E6"
};

const getProductColorName = (name: string) => {
  const parts = name.split(" – ");
  if (parts.length > 1) return parts[parts.length - 1].trim();
  const hyphenParts = name.split(" - ");
  if (hyphenParts.length > 1) return hyphenParts[hyphenParts.length - 1].trim();
  return "Ivory";
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { products } = useProducts();
  const [hovered, setHovered] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  // Track active variant displayed on card
  const [activeProduct, setActiveProduct] = useState<Product>(product);

  useEffect(() => {
    setActiveProduct(product);
  }, [product]);

  const wished = isInWishlist(activeProduct.id);

  // Find all sibling products in the same collection
  const siblings = useMemo(() => {
    return products.filter((p) => p.collection === product.collection);
  }, [product.collection, products]);

  // Build swatches dynamically based on the products in that collection
  const swatches = useMemo(() => {
    return siblings.map((sibling) => {
      const siblingColor = sibling.colors[0];
      return {
        product: sibling,
        colorName: siblingColor?.name || getProductColorName(sibling.name),
        hex: siblingColor?.hex || colorMap[getProductColorName(sibling.name)] || "#CCCCCC"
      };
    });
  }, [siblings]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
      className="group relative"
      data-testid={`card-product-${activeProduct.id}`}
    >
      <Link href={`/product/${activeProduct.slug}`}>
        <div
          className="relative aspect-[3/4] overflow-hidden bg-card cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            src={hovered && activeProduct.images[1] ? activeProduct.images[1] : activeProduct.images[0]}
            alt={activeProduct.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
          />
          {activeProduct.isNew && (
            <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest bg-background px-3 py-1 text-foreground">
              New
            </span>
          )}
          {activeProduct.isBestSeller && (
            <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-3 py-1">
              Best Seller
            </span>
          )}
          {activeProduct.collection === "limited-edition" && (
            <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest bg-accent text-accent-foreground px-3 py-1">
              Limited
            </span>
          )}
          {(!activeProduct.inStock || (activeProduct.stock !== undefined && activeProduct.stock <= 0)) && (
            <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest bg-muted text-muted-foreground px-3 py-1">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      <button
        onClick={(e) => { e.preventDefault(); toggleWishlist(activeProduct); }}
        className={`absolute top-4 right-4 p-2 transition-all duration-300 ${wished ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        data-testid={`button-wishlist-${activeProduct.id}`}
        aria-label="Add to wishlist"
      >
        <Heart
          className="w-4 h-4 transition-colors"
          strokeWidth={1.5}
          fill={wished ? "#8C6A56" : "none"}
          color={wished ? "#8C6A56" : "currentColor"}
        />
      </button>

      <div className="pt-4">
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {swatches.map((swatch) => (
            <button
              key={swatch.product.id}
              onClick={(e) => {
                e.preventDefault();
                setActiveProduct(swatch.product);
              }}
              className={`w-3.5 h-3.5 rounded-full inline-block transition-all focus:outline-none focus:ring-1 focus:ring-foreground focus:ring-offset-1 ${
                activeProduct.id === swatch.product.id
                  ? "border border-foreground ring-1 ring-foreground ring-offset-1"
                  : "border border-border/30 hover:border-foreground/50"
              }`}
              style={{ backgroundColor: swatch.hex }}
              title={swatch.colorName}
              aria-label={`Select color ${swatch.colorName}`}
            />
          ))}
        </div>
        <Link href={`/product/${activeProduct.slug}`}>
          <h3 className="font-serif text-base mb-1 hover:text-accent transition-colors cursor-pointer" data-testid={`text-product-name-${activeProduct.id}`}>
            {activeProduct.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground" data-testid={`text-price-${activeProduct.id}`}>
          ${activeProduct.price.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}
