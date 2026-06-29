import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, ShoppingBag } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function Wishlist() {
  const { items, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product: typeof items[0]) => {
    addToCart(product, product.colors[0].label, product.sizes[0], 1);
    toggleWishlist(product);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Saved Pieces</p>
            <h1 className="font-serif text-4xl md:text-5xl">My Wishlist</h1>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-32">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-6" strokeWidth={1} />
              <p className="font-serif text-2xl text-muted-foreground mb-4">Your wishlist is empty</p>
              <p className="text-sm text-muted-foreground mb-10">Save pieces you love for later.</p>
              <Link href="/shop" className="inline-block bg-primary text-primary-foreground px-10 py-4 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors" data-testid="link-explore-wishlist">Explore Collection</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {items.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className="group relative"
                    data-testid={`wishlist-item-${product.id}`}
                  >
                    <Link href={`/product/${product.id}`} className="block">
                      <div className="relative aspect-[3/4] overflow-hidden bg-card mb-4">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                      </div>
                    </Link>
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm p-2"
                      data-testid={`button-remove-wishlist-${product.id}`}
                      aria-label="Remove from wishlist"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-serif text-sm mb-1 hover:text-accent transition-colors">{product.name}</h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mb-3">${product.price.toLocaleString()}</p>
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="w-full border border-border/40 py-2.5 text-[10px] uppercase tracking-widest hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
                      data-testid={`button-move-to-cart-${product.id}`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} /> Move to Cart
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
