import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, User, Menu, X, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { SearchOverlay } from "@/components/SearchOverlay";
import { useAuth } from "@/context/AuthContext";
import { useStoreSetting } from "@/context/StoreSettingContext";
import { fetchPublicNavigation, HeaderNavItem } from "@/lib/navigationApi";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const DEFAULT_NAV_LINKS: { href: string; label: string }[] = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?collection=new-arrivals", label: "New Arrivals" },
];

export function Navbar() {
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const { settings } = useStoreSetting();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [location] = useLocation();

  const [headerNavItems, setHeaderNavItems] = useState<{ href: string; label: string }[]>(DEFAULT_NAV_LINKS);
  const [brandName, setBrandName] = useState<string>(settings.store_name ?? 'J Atelier');

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isHome = location === "/";

  useEffect(() => {
    fetchPublicNavigation()
      .then((data) => {
        if (data.brand_name) {
          setBrandName(data.brand_name);
        }
        if (data.header_items && data.header_items.length > 0) {
          setHeaderNavItems(
            data.header_items.map((item: HeaderNavItem) => ({
              href: item.url,
              label: item.label,
            }))
          );
        }
      })
      .catch((err) => {
        console.error("Failed to fetch public navigation items:", err);
      });
  }, []);

  useEffect(() => {
    if (settings.store_name) {
      setBrandName(settings.store_name);
    }
  }, [settings.store_name]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

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
              {headerNavItems.map((link) => (
                <Link
                  key={link.href + link.label}
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
            {brandName.toUpperCase()}
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
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 hover:text-accent transition-colors hidden md:block" data-testid="link-profile" aria-label="Profile options">
                    <User strokeWidth={1.5} style={{ width: "18px", height: "18px" }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background border border-border/40 p-2 shadow-lg z-50">
                  <DropdownMenuLabel className="font-serif text-sm px-2 py-1.5 truncate">
                    {user?.name}
                    <p className="text-[10px] text-muted-foreground font-sans lowercase truncate">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/20" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full flex items-center px-2 py-2 text-xs uppercase tracking-wider hover:bg-accent/10 transition-colors cursor-pointer" data-testid="link-dropdown-profile">
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/20" />
                  <DropdownMenuItem onClick={logout} className="w-full flex items-center px-2 py-2 text-xs uppercase tracking-wider hover:bg-destructive/10 text-destructive focus:text-destructive transition-colors cursor-pointer" data-testid="button-logout">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 hover:text-accent transition-colors hidden md:block" data-testid="link-profile" aria-label="Profile options">
                    <User strokeWidth={1.5} style={{ width: "18px", height: "18px" }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background border border-border/40 p-2 shadow-lg z-50">
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="w-full flex items-center px-2 py-2 text-xs uppercase tracking-wider hover:bg-accent/10 transition-colors cursor-pointer" data-testid="link-dropdown-login">
                      Sign In
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/login#register" className="w-full flex items-center px-2 py-2 text-xs uppercase tracking-wider hover:bg-accent/10 transition-colors cursor-pointer" data-testid="link-dropdown-register">
                      Create Account
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
              {headerNavItems.map((link) => (
                <Link
                  key={link.href + link.label}
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
                {isAuthenticated ? (
                  <>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{user?.name}</span>
                    <Link href="/profile" className="text-sm uppercase tracking-widest hover:text-accent transition-colors" data-testid="link-mobile-profile">My Profile</Link>
                    <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm uppercase tracking-widest hover:text-destructive text-destructive text-left transition-colors" data-testid="button-mobile-logout">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-sm uppercase tracking-widest hover:text-accent transition-colors" data-testid="link-mobile-login">Sign In</Link>
                    <Link href="/login#register" className="text-sm uppercase tracking-widest hover:text-accent transition-colors" data-testid="link-mobile-register">Create Account</Link>
                  </>
                )}
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
