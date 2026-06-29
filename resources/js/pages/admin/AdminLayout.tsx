import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart2,
  Tag, Layers, Settings, ArrowLeft
} from "lucide-react";

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

  return (
    <div className="min-h-screen bg-sidebar flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="font-serif text-lg tracking-widest text-sidebar-foreground" data-testid="link-admin-home">J ATELIER</Link>
          <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 mt-1">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== "/admin" && location.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
                data-testid={`link-admin-${label.toLowerCase()}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <Link href="/" className="flex items-center gap-2 text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/80 transition-colors" data-testid="link-admin-back-to-store">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-background min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
