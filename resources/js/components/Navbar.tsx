import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, User, Menu, X, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { SearchOverlay } from "@/components/SearchOverlay";

export function Navbar() {
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [location] = useLocation();

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isHome = location === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/shop", label: "Shop All" },
    { href: "/shop?collection=new-arrivals", label: "New Arrivals" },
  ];

  const isTransparent = isHome && !scrolled && !mobileOpen;

  return (
    <>
      <motion.nav
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent
            ? "bg-transparent"
            : "bg-background/95 backdrop-blur-md border-b border-border/20"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-18 flex items-center justify-between" style={{ height: "72px" }}>
          <div className="flex items-center gap-8">
            <button
              className="md:hidden p-2 -ml-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="button-mobile-menu"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
            </button>
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[11px] uppercase tracking-widest hover:text-accent transition-colors duration-300"
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-serif text-2xl tracking-[0.25em] hover:text-accent transition-colors duration-300"
            data-testid="link-home"
          >
            J ATELIER
          </Link>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1.5 hover:text-accent transition-colors hidden md:block"
              data-testid="button-search"
              aria-label="Search"
            >
              <Search strokeWidth={1.5} style={{ width: "18px", height: "18px" }} />
            </button>
            <Link href="/profile" className="p-1.5 hover:text-accent transition-colors hidden md:block" data-testid="link-profile" aria-label="Profile">
              <User strokeWidth={1.5} style={{ width: "18px", height: "18px" }} />
            </Link>
            <Link href="/wishlist" className="p-1.5 hover:text-accent transition-colors relative hidden md:block" data-testid="link-wishlist" aria-label="Wishlist">
              <Heart strokeWidth={1.5} style={{ width: "18px", height: "18px" }} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-accent text-[9px] text-accent-foreground rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link href="/cart" className="p-1.5 hover:text-accent transition-colors relative" data-testid="link-cart" aria-label="Cart">
              <ShoppingBag strokeWidth={1.5} style={{ width: "18px", height: "18px" }} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary text-[9px] text-primary-foreground rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background pt-24 px-8 md:hidden"
          >
            <nav className="flex flex-col gap-8 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-serif text-3xl hover:text-accent transition-colors"
                  data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                className="font-serif text-3xl hover:text-accent transition-colors text-left"
              >
                Search
              </button>
              <div className="border-t border-border/20 pt-8 flex flex-col gap-4">
                <Link href="/profile" className="text-sm uppercase tracking-widest hover:text-accent transition-colors">Account</Link>
                <Link href="/wishlist" className="text-sm uppercase tracking-widest hover:text-accent transition-colors">Wishlist</Link>
                <Link href="/cart" className="text-sm uppercase tracking-widest hover:text-accent transition-colors">Cart ({itemCount})</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
