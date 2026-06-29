import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { User, Package, Heart, MapPin, Settings, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";

type Tab = "overview" | "orders" | "wishlist" | "addresses" | "settings";

const MOCK_ORDERS = [
  { id: "JA-483921", date: "12 January 2024", status: "Delivered", total: 295, items: ["The Cashmere Blend Pullover"] },
  { id: "JA-471203", date: "28 November 2023", status: "Delivered", total: 510, items: ["The Classic Oversized Pullover", "The Kangaroo Pocket Essential"] },
  { id: "JA-460891", date: "3 October 2023", status: "Delivered", total: 265, items: ["The Cloud Oversized Pullover"] },
];

const STATUS_COLORS: Record<string, string> = {
  Delivered: "text-accent",
  Processing: "text-foreground",
  Shipped: "text-muted-foreground",
};

export default function Profile() {
  const [tab, setTab] = useState<Tab>("overview");
  const { items: wishlistItems } = useWishlist();

  const navItems = [
    { id: "overview", label: "Overview", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">My Account</p>
            <h1 className="font-serif text-4xl">Profile</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-card p-6 mb-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-serif text-xl">J</div>
                  <div>
                    <p className="text-sm font-medium">Jane Atelier</p>
                    <p className="text-xs text-muted-foreground">jane@example.com</p>
                  </div>
                </div>
                <nav className="space-y-1">
                  {navItems.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setTab(id as Tab)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${tab === id ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      data-testid={`tab-profile-${id}`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {tab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Total Orders", value: MOCK_ORDERS.length },
                        { label: "Wishlist Items", value: wishlistItems.length },
                        { label: "Member Since", value: "2023" },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-card p-6 text-center">
                          <p className="font-serif text-3xl mb-1">{stat.value}</p>
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-card p-6">
                      <h3 className="font-serif text-lg mb-4">Recent Orders</h3>
                      <div className="space-y-4">
                        {MOCK_ORDERS.slice(0, 2).map((order) => (
                          <div key={order.id} className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
                            <div>
                              <p className="text-sm font-medium">{order.id}</p>
                              <p className="text-xs text-muted-foreground">{order.date}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-xs ${STATUS_COLORS[order.status] || "text-foreground"}`}>{order.status}</p>
                              <p className="text-sm">${order.total}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setTab("orders")} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mt-4 flex items-center gap-1" data-testid="link-all-orders">View All <ChevronRight className="w-3 h-3" /></button>
                    </div>
                  </div>
                )}

                {tab === "orders" && (
                  <div className="space-y-4">
                    <h2 className="font-serif text-2xl mb-6">Order History</h2>
                    {MOCK_ORDERS.map((order) => (
                      <div key={order.id} className="bg-card p-6" data-testid={`order-${order.id}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-sm font-medium mb-1">{order.id}</p>
                            <p className="text-xs text-muted-foreground">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs uppercase tracking-widest ${STATUS_COLORS[order.status] || "text-foreground"}`}>{order.status}</span>
                          </div>
                        </div>
                        <div className="space-y-1 mb-4">
                          {order.items.map((item) => <p key={item} className="text-sm text-muted-foreground">{item}</p>)}
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-border/20">
                          <p className="text-sm font-medium">${order.total}</p>
                          <button className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors" data-testid={`button-reorder-${order.id}`}>Reorder</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "wishlist" && (
                  <div>
                    <h2 className="font-serif text-2xl mb-6">My Wishlist</h2>
                    {wishlistItems.length === 0 ? (
                      <div className="text-center py-16 bg-card">
                        <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
                        <p className="text-sm text-muted-foreground mb-4">No saved items yet.</p>
                        <Link href="/shop" className="text-xs uppercase tracking-widest underline hover:text-accent transition-colors" data-testid="link-explore-from-profile">Explore Collection</Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {wishlistItems.map((product) => (
                          <Link key={product.id} href={`/product/${product.id}`} className="group bg-card p-3" data-testid={`wishlist-profile-item-${product.id}`}>
                            <img src={product.images[0]} alt={product.name} className="w-full aspect-square object-cover mb-3" />
                            <p className="text-sm font-serif group-hover:text-accent transition-colors truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">${product.price}</p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === "addresses" && (
                  <div>
                    <h2 className="font-serif text-2xl mb-6">Saved Addresses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-card p-6 border-2 border-foreground/20">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] uppercase tracking-widest text-accent">Default</span>
                          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="button-edit-address-1">Edit</button>
                        </div>
                        <p className="text-sm font-medium mb-1">Jane Atelier</p>
                        <p className="text-sm text-muted-foreground">12 Mayfair Street</p>
                        <p className="text-sm text-muted-foreground">London, W1K 3AF</p>
                        <p className="text-sm text-muted-foreground">United Kingdom</p>
                      </div>
                      <button className="bg-card p-6 border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-3 hover:border-accent transition-colors group" data-testid="button-add-address">
                        <span className="w-8 h-8 border border-border/40 flex items-center justify-center group-hover:border-accent transition-colors text-lg text-muted-foreground">+</span>
                        <span className="text-xs uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Add New Address</span>
                      </button>
                    </div>
                  </div>
                )}

                {tab === "settings" && (
                  <div>
                    <h2 className="font-serif text-2xl mb-6">Account Settings</h2>
                    <div className="bg-card p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">First Name</label>
                          <input defaultValue="Jane" className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-settings-first-name" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Last Name</label>
                          <input defaultValue="Atelier" className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-settings-last-name" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Email Address</label>
                        <input defaultValue="jane@example.com" type="email" className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-settings-email" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">New Password</label>
                        <input type="password" placeholder="Leave blank to keep current" className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" data-testid="input-settings-password" />
                      </div>
                      <div className="pt-4">
                        <button className="bg-primary text-primary-foreground px-8 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors" data-testid="button-save-settings">Save Changes</button>
                      </div>
                    </div>
                    <div className="mt-6 bg-card p-8">
                      <h3 className="font-serif text-lg mb-4">Newsletter Preferences</h3>
                      <div className="space-y-3">
                        {["New Arrivals", "Limited Edition Drops", "Exclusive Offers", "Style Edits"].map((pref) => (
                          <label key={pref} className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-4 h-4" data-testid={`checkbox-pref-${pref.toLowerCase().replace(/\s+/g, "-")}`} />
                            <span className="text-sm">{pref}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
