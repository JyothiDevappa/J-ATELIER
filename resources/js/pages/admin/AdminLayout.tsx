import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart2,
  Tag, Layers, Settings, ArrowLeft, LogOut
} from "lucide-react";
import { useStoreSetting } from "@/context/StoreSettingContext";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
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

  const handleLogout = async () => {
    await logout();
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-sidebar flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="font-serif text-lg tracking-widest text-sidebar-foreground" data-testid="link-admin-home">{(settings.store_name ?? 'J Atelier').toUpperCase()}</Link>
          <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 mt-1">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== "/admin" && location.startsWith(href)) || (href === "/admin/products" && (location === "/admin/shop-by-color" || location === "/admin/instagram-gallery"));
            const isProducts = label === "Products";
            
            return (
              <div key={href} className="space-y-1">
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                  data-testid={`link-admin-${label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                  {label}
                </Link>
                
                {isProducts && (
                  <div className="pl-9 space-y-1 border-l border-sidebar-border ml-5 mb-2 mt-1">
                    <Link
                      href="/admin/products"
                      className={`block py-1.5 text-xs transition-colors ${
                        location === "/admin/products"
                          ? "text-sidebar-accent-foreground font-semibold"
                          : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
                      }`}
                    >
                      Products
                    </Link>
                    <Link
                      href="/admin/shop-by-color"
                      className={`block py-1.5 text-xs transition-colors ${
                        location === "/admin/shop-by-color"
                          ? "text-sidebar-accent-foreground font-semibold"
                          : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
                      }`}
                    >
                      Shop by Color
                    </Link>
                    <Link
                      href="/admin/instagram-gallery"
                      className={`block py-1.5 text-xs transition-colors ${
                        location === "/admin/instagram-gallery"
                          ? "text-sidebar-accent-foreground font-semibold"
                          : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
                      }`}
                    >
                      Instagram Gallery
                    </Link>
                  </div>
                )}
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
