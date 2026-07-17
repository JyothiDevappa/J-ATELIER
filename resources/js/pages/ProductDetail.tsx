import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, ChevronDown, ArrowLeft, ZoomIn } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { products as staticProducts } from "@/data/products";
import { type Product } from "@/types/product";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";

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

export default function ProductDetail() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { products, loading } = useProducts();
  const isNumeric = params.slug && /^\d+$/.test(params.slug);
  const product = products.find((p) => isNumeric ? p.id === Number(params.slug) : p.slug === params.slug);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed, items: recentlyViewed } = useRecentlyViewed();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const availableStock = product?.stock ?? 0;
  const isOutOfStock = !product?.inStock || availableStock <= 0;

  const selectedColor = product?.colors[0];

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
      setSelectedImage(0);
      setSelectedSize("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [product?.id]);

  const siblings = useMemo(() => {
    if (!product) return [];
    return products.filter((p) => p.collection === product.collection);
  }, [product?.collection, products]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="font-serif text-2xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="font-serif text-2xl">Product not found</p>
          <Link href="/shop" className="text-xs uppercase tracking-widest underline mt-4 inline-block">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const wished = isInWishlist(product.id);
  const related = products.filter((p) => p.collection === product.collection && p.id !== product.id).slice(0, 4);

  const handleAddToCart = async () => {
    if (!selectedSize || isOutOfStock) return;

    try {
      await addToCart(product, selectedColor?.name || "", selectedSize, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch {
      setAddedToCart(false);
    }
  };

  const accordionItems = [
    { key: "fabric", label: "Fabric Details", content: product.fabricDetails },
    { key: "care", label: "Care Instructions", content: product.careInstructions },
    { key: "shipping", label: "Shipping Information", content: "Complimentary shipping on orders over $300. Standard delivery 3–5 business days. Express delivery 1–2 business days available at checkout. International shipping to 40+ countries." },
    { key: "returns", label: "Returns & Exchanges", content: "We offer free returns within 30 days of delivery. Items must be unworn and in original packaging. Contact us at returns@jatelier.com or initiate a return through your profile dashboard." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/shop" className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors w-fit" data-testid="link-back-to-shop">
            <ArrowLeft className="w-3.5 h-3.5" /> Shop
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Image Gallery */}
            <div className="space-y-3">
              <motion.div
                className="relative aspect-[3/4] overflow-hidden bg-card cursor-zoom-in"
                onClick={() => setZoomed(true)}
                data-testid="image-product-main"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
                <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm p-2">
                  <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
                </div>
              </motion.div>
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-[3/4] overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-foreground" : "border-transparent"}`}
                    data-testid={`button-thumbnail-${i}`}
                  >
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-accent">
                    {product.collection.replace(/-/g, " ")}
                  </span>
                  {product.isNew && <span className="text-[10px] uppercase tracking-widest bg-card px-3 py-1">New</span>}
                </div>
                <h1 className="font-serif text-3xl md:text-4xl mb-3" data-testid="text-product-name">{product.name}</h1>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`} strokeWidth={0} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
                </div>

                <p className="text-2xl font-light mb-8" data-testid="text-product-price">${product.price.toLocaleString()}</p>

                <p className="text-sm text-muted-foreground leading-relaxed mb-10">{product.description}</p>

                {/* Color Selector */}
                <div className="mb-8">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                    Color — <span className="text-foreground">{getProductColorName(product.name)}</span>
                  </p>
                  <div className="flex gap-3">
                    {swatches.map((swatch) => (
                      <button
                        key={swatch.product.id}
                        onClick={() => setLocation(`/product/${swatch.product.slug}`)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${product.id === swatch.product.id ? "border-foreground scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: swatch.hex, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)" }}
                        title={swatch.colorName}
                        data-testid={`button-color-${swatch.colorName.toLowerCase().replace(/\s+/g, "-")}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Size Selector */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Size</p>
                    <button className="text-[10px] uppercase tracking-widest text-muted-foreground underline hover:text-foreground transition-colors" data-testid="link-size-guide">Size Guide</button>
                  </div>
                  <div className="flex gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`w-11 h-11 text-xs border transition-colors ${selectedSize === s ? "border-foreground bg-foreground text-primary-foreground" : "border-border/40 hover:border-accent text-foreground"}`}
                        data-testid={`button-size-${s}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {!selectedSize && <p className="text-xs text-muted-foreground mt-2">Please select a size</p>}
                </div>

                {/* Quantity */}
                <div className="mb-8">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Quantity</p>
                  <div className="flex items-center border border-border/40 w-fit">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-card transition-colors text-lg" data-testid="button-qty-decrease">−</button>
                    <span className="w-11 text-center text-sm" data-testid="text-quantity">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-11 h-11 flex items-center justify-center hover:bg-card transition-colors text-lg" data-testid="button-qty-increase">+</button>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-3 mb-10">
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={!selectedSize || isOutOfStock}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 text-xs uppercase tracking-widest transition-all duration-300 ${
                      addedToCart
                        ? "bg-accent text-accent-foreground"
                        : !selectedSize || isOutOfStock
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                    data-testid="button-add-to-cart"
                  >
                    {isOutOfStock ? "Out of Stock" : addedToCart ? "Added to Cart" : "Add to Cart"}
                  </motion.button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="w-full py-4 text-xs uppercase tracking-widest border border-border/40 hover:border-accent transition-colors flex items-center justify-center gap-2"
                    data-testid="button-add-to-wishlist"
                  >
                    <Heart className="w-3.5 h-3.5" strokeWidth={1.5} fill={wished ? "#8C6A56" : "none"} color={wished ? "#8C6A56" : "currentColor"} />
                    {wished ? "Saved to Wishlist" : "Add to Wishlist"}
                  </button>
                </div>

                {/* Product Story */}
                <div className="bg-card p-8 mb-8">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">The Story</p>
                  <p className="font-serif text-base italic leading-relaxed text-foreground/80">{product.story}</p>
                </div>

                {/* Accordions */}
                <div className="space-y-0 border-t border-border/20">
                  {accordionItems.map((item) => (
                    <div key={item.key} className="border-b border-border/20">
                      <button
                        onClick={() => setOpenAccordion(openAccordion === item.key ? null : item.key)}
                        className="w-full flex items-center justify-between py-5 text-left"
                        data-testid={`button-accordion-${item.key}`}
                      >
                        <span className="text-xs uppercase tracking-widest">{item.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === item.key ? "rotate-180" : ""}`} strokeWidth={1.5} />
                      </button>
                      <AnimatePresence>
                        {openAccordion === item.key && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-muted-foreground pb-5 leading-relaxed">{item.content}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-24 pt-16 border-t border-border/20">
            <h2 className="font-serif text-3xl mb-12">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(product.reviews || staticProducts.find(p => p.id === product.id)?.reviews || []).map((review, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card p-8"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-accent text-accent" strokeWidth={0} fill="currentColor" />
                    ))}
                  </div>
                  <p className="font-serif text-base italic mb-4">"{review.text}"</p>
                  <p className="text-xs text-muted-foreground">— {review.author}</p>
                  <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div className="mt-24">
              <h2 className="font-serif text-3xl mb-12">You Might Also Love</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </div>
          )}

          {/* Recently Viewed */}
          {recentlyViewed.filter((p) => p.id !== product.id).length > 0 && (
            <div className="mt-24">
              <h2 className="font-serif text-3xl mb-12">Recently Viewed</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recentlyViewed.filter((p) => p.id !== product.id).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center cursor-zoom-out p-4"
            onClick={() => setZoomed(false)}
          >
            <img src={product.images[selectedImage]} alt={product.name} className="max-h-full max-w-full object-contain" />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
