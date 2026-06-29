import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Product } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const wished = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
      className="group relative"
      data-testid={`card-product-${product.id}`}
    >
      <Link href={`/product/${product.id}`}>
        <div
          className="relative aspect-[3/4] overflow-hidden bg-card cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            src={hovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
          />
          {product.isNew && (
            <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest bg-background px-3 py-1 text-foreground">
              New
            </span>
          )}
          {product.isBestSeller && (
            <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-3 py-1">
              Best Seller
            </span>
          )}
          {product.collection === "limited-edition" && (
            <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest bg-accent text-accent-foreground px-3 py-1">
              Limited
            </span>
          )}
        </div>
      </Link>

      <button
        onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
        className={`absolute top-4 right-4 p-2 transition-all duration-300 ${wished ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        data-testid={`button-wishlist-${product.id}`}
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
        <div className="flex items-center gap-1.5 mb-2">
          {product.colors.slice(0, 4).map((color) => (
            <span
              key={color.label}
              className="w-3 h-3 rounded-full border border-border/30 inline-block"
              style={{ backgroundColor: color.hex }}
              title={color.label}
            />
          ))}
        </div>
        <Link href={`/product/${product.id}`}>
          <h3 className="font-serif text-base mb-1 hover:text-accent transition-colors cursor-pointer" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground" data-testid={`text-price-${product.id}`}>
          ${product.price.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}
