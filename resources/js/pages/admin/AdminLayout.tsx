import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart2,
  Tag, Layers, Settings, ArrowLeft, LogOut, Compass, LayoutGrid, ChevronDown, ChevronRight
} from "lucide-react";
import { useStoreSetting } from "@/context/StoreSettingContext";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/navigation", label: "Navbar & Footer", icon: Compass },
  { href: "#homepage", label: "Homepage Sections", icon: LayoutGrid, isToggle: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/inventory", label: "Inventory", icon: Layers },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { settings } = useStoreSetting();
  const { user, logout } = useAuth();

  const searchQuery = typeof window !== 'undefined' ? window.location.search : '';

  const isHomepageRoute = location.startsWith("/admin/homepage-sections") ||
    location === "/admin/hero-banner" ||
    location === "/admin/shop-by-color" ||
    location === "/admin/instagram-gallery";

  const isProductsRoute = location === "/admin/products" || location === "/admin/colors";

  const [homepageExpanded, setHomepageExpanded] = useState<boolean>(isHomepageRoute);
  const [productsExpanded, setProductsExpanded] = useState<boolean>(isProductsRoute);

  const isTabActive = (tabKey: string) => {
    if (!location.startsWith("/admin/homepage-sections")) return false;
    if (tabKey === "tagline" && (!searchQuery || !searchQuery.includes("tab="))) return true;
    return searchQuery.includes(`tab=${tabKey}`);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-sidebar flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="font-serif text-lg tracking-widest text-sidebar-foreground" data-testid="link-admin-home">{(settings.store_name ?? 'J Atelier').toUpperCase()}</Link>
          <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 mt-1">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const isHomepage = label === "Homepage Sections";
            const isProducts = label === "Products";

            const active = isHomepage
              ? isHomepageRoute
              : isProducts
              ? isProductsRoute
              : location === href || (href !== "/admin" && location.startsWith(href));

            if (isHomepage) {
              return (
                <div key={label} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setHomepageExpanded(!homepageExpanded)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors text-left ${
                      active
                        ? "text-white"
                        : "text-sidebar-foreground/60 hover:text-white"
                    }`}
                    data-testid="button-admin-homepage-toggle"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-sidebar-foreground/60"}`} strokeWidth={1.5} />
                      <span className={active ? "text-white" : "text-sidebar-foreground/60"}>{label}</span>
                    </div>
                    {homepageExpanded ? (
                      <ChevronDown className={`w-3.5 h-3.5 ${active ? "text-white" : "text-sidebar-foreground/40"}`} />
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 ${active ? "text-white" : "text-sidebar-foreground/40"}`} />
                    )}
                  </button>

                  {/* Homepage Sub-menu Collapsible List */}
                  {homepageExpanded && (
                    <div className="pl-9 space-y-2 border-l border-sidebar-border/40 ml-5 my-1 py-1">
                      <Link
                        href="/admin/hero-banner"
                        className={`block text-xs transition-colors ${
                          location === "/admin/hero-banner"
                            ? "text-white"
                            : "text-sidebar-foreground/50 hover:text-white"
                        }`}
                      >
                        Hero Banner
                      </Link>
                      <Link
                        href="/admin/homepage-sections?tab=tagline"
                        className={`block text-xs transition-colors ${
                          isTabActive("tagline")
                            ? "text-white"
                            : "text-sidebar-foreground/50 hover:text-white"
                        }`}
                      >
                        Tagline Banner
                      </Link>
                      <Link
                        href="/admin/homepage-sections?tab=featured_collections"
                        className={`block text-xs transition-colors ${
                          isTabActive("featured_collections")
                            ? "text-white"
                            : "text-sidebar-foreground/50 hover:text-white"
                        }`}
                      >
                        Shop by Collections
                      </Link>
                      <Link
                        href="/admin/shop-by-color"
                        className={`block text-xs transition-colors ${
                          location === "/admin/shop-by-color"
                            ? "text-white"
                            : "text-sidebar-foreground/50 hover:text-white"
                        }`}
                      >
                        Shop by Color
                      </Link>
                      <Link
                        href="/admin/homepage-sections?tab=limited_edition_banner"
                        className={`block text-xs transition-colors ${
                          isTabActive("limited_edition_banner")
                            ? "text-white"
                            : "text-sidebar-foreground/50 hover:text-white"
                        }`}
                      >
                        Promotional Banner
                      </Link>
                      <Link
                        href="/admin/homepage-sections?tab=our_story"
                        className={`block text-xs transition-colors ${
                          isTabActive("our_story")
                            ? "text-white"
                            : "text-sidebar-foreground/50 hover:text-white"
                        }`}
                      >
                        Our Story
                      </Link>
                      <Link
                        href="/admin/homepage-sections?tab=why_jatelier"
                        className={`block text-xs transition-colors ${
                          isTabActive("why_jatelier")
                            ? "text-white"
                            : "text-sidebar-foreground/50 hover:text-white"
                        }`}
                      >
                        Why Choose Us
                      </Link>
                      <Link
                        href="/admin/instagram-gallery"
                        className={`block text-xs transition-colors ${
                          location === "/admin/instagram-gallery"
                            ? "text-white"
                            : "text-sidebar-foreground/50 hover:text-white"
                        }`}
                      >
                        Instagram Gallery
                      </Link>
                      <Link
                        href="/admin/homepage-sections?tab=newsletter"
                        className={`block text-xs transition-colors ${
                          isTabActive("newsletter")
                            ? "text-white"
                            : "text-sidebar-foreground/50 hover:text-white"
                        }`}
                      >
                        Newsletter
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            if (isProducts) {
              return (
                <div key={label} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setProductsExpanded(!productsExpanded)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors text-left ${
                      active
                        ? "text-white"
                        : "text-sidebar-foreground/60 hover:text-white"
                    }`}
                    data-testid="button-admin-products-toggle"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-sidebar-foreground/60"}`} strokeWidth={1.5} />
                      <span className={active ? "text-white" : "text-sidebar-foreground/60"}>{label}</span>
                    </div>
                    {productsExpanded ? (
                      <ChevronDown className={`w-3.5 h-3.5 ${active ? "text-white" : "text-sidebar-foreground/40"}`} />
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 ${active ? "text-white" : "text-sidebar-foreground/40"}`} />
                    )}
                  </button>

                  {/* Products Sub-menu Collapsible List */}
                  {productsExpanded && (
                    <div className="pl-9 space-y-2 border-l border-sidebar-border/40 ml-5 my-1 py-1">
                      <Link
                        href="/admin/products"
                        className={`block text-xs transition-colors ${
                          location === "/admin/products"
                            ? "text-white"
                            : "text-sidebar-foreground/50 hover:text-white"
                        }`}
                      >
                        All Products
                      </Link>
                      <Link
                        href="/admin/colors"
                        className={`block text-xs transition-colors ${
                          location === "/admin/colors"
                            ? "text-white"
                            : "text-sidebar-foreground/50 hover:text-white"
                        }`}
                      >
                        Manage Colors
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={href} className="space-y-1">
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "text-white"
                      : "text-sidebar-foreground/60 hover:text-white"
                  }`}
                  data-testid={`link-admin-${label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-sidebar-foreground/60"}`} strokeWidth={1.5} />
                  <span className={active ? "text-white" : "text-sidebar-foreground/60"}>{label}</span>
                </Link>
              </div>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border space-y-2">
          {/* Logged-in admin info */}
          {user && (
            <div className="px-3 py-2 mb-1">
              <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/30">Signed in as</p>
              <p className="text-xs text-sidebar-foreground/70 mt-0.5 truncate font-medium">{user.name}</p>
            </div>
          )}
          <Link href="/" className="flex items-center gap-2 text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/80 transition-colors" data-testid="link-admin-back-to-store">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-sidebar-foreground/40 hover:text-red-400 transition-colors w-full"
            data-testid="btn-admin-logout"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-background min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
