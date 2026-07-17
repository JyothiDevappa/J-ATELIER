import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { User, Package, Heart, MapPin, Settings, ChevronRight, LogOut } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress, Address } from "@/lib/addressApi";
import { getOrders, Order } from "@/lib/checkoutApi";
import { toast } from "@/hooks/use-toast";

type Tab = "overview" | "orders" | "wishlist" | "addresses" | "settings";

const STATUS_COLORS: Record<string, string> = {
  Delivered: "text-accent",
  Processing: "text-foreground",
  Shipped: "text-muted-foreground",
};

export default function Profile() {
  const [tab, setTab] = useState<Tab>("overview");
  const { items: wishlistItems } = useWishlist();
  const { user, logout, updateProfile } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);

  // Address form states
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    is_default: false
  });

  // Settings states
  const [settingsForm, setSettingsForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: ""
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setSettingsForm({
        first_name: user.name ? user.name.split(" ")[0] : "",
        last_name: user.name ? user.name.split(" ").slice(1).join(" ") : "",
        email: user.email || "",
        password: ""
      });
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setAddressesLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
    loadOrders();
  }, []);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddressId !== null) {
        const updated = await updateAddress(editingAddressId, addressForm);
        setAddresses(addresses.map(addr => addr.id === editingAddressId ? updated : addr));
        toast({ title: "Address updated successfully" });
      } else {
        const created = await createAddress(addressForm);
        if (addressForm.is_default || addresses.length === 0) {
          await loadAddresses();
        } else {
          setAddresses([...addresses, created]);
        }
        toast({ title: "Address created successfully" });
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
    } catch (error: any) {
      toast({
        title: "Failed to save address",
        description: error.response?.data?.message || error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditAddressClick = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      first_name: addr.first_name,
      last_name: addr.last_name,
      email: addr.email,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      postcode: addr.postcode,
      country: addr.country,
      is_default: addr.is_default
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteAddress(id);
      await loadAddresses();
      toast({ title: "Address deleted successfully" });
    } catch (error: any) {
      toast({
        title: "Failed to delete address",
        description: error.response?.data?.message || error.message,
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      await loadAddresses();
      toast({ title: "Default address updated" });
    } catch (error: any) {
      toast({
        title: "Failed to set default address",
        description: error.response?.data?.message || error.message,
        variant: "destructive"
      });
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const fullName = `${settingsForm.first_name} ${settingsForm.last_name}`.trim();
      await updateProfile({
        name: fullName,
        email: settingsForm.email,
        password: settingsForm.password || undefined
      });
      toast({ title: "Profile updated successfully" });
    } catch (error: any) {
      toast({
        title: "Failed to update profile",
        description: error.response?.data?.message || error.message,
        variant: "destructive"
      });
    } finally {
      setSettingsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

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
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-serif text-xl" data-testid="profile-avatar">
                    {user?.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium" data-testid="profile-username">{user?.name}</p>
                    <p className="text-xs text-muted-foreground" data-testid="profile-email">{user?.email}</p>
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
                  <div className="pt-4 border-t border-border/20 mt-4">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      data-testid="button-profile-logout"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={1.5} />
                      Logout
                    </button>
                  </div>
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
                        { label: "Total Orders", value: orders.length },
                        { label: "Wishlist Items", value: wishlistItems.length },
                        { label: "Member Since", value: user?.created_at ? new Date(user.created_at).getFullYear().toString() : "2026" },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-card p-6 text-center">
                          <p className="font-serif text-3xl mb-1">{stat.value}</p>
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-card p-6">
                      <h3 className="font-serif text-lg mb-4">Recent Orders</h3>
                      {ordersLoading ? (
                        <p className="text-sm text-muted-foreground">Loading recent orders...</p>
                      ) : orders.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No recent orders found.</p>
                      ) : (
                        <div className="space-y-4">
                          {orders.slice(0, 2).map((order) => (
                            <div key={order.id} className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
                              <div>
                                <p className="text-sm font-medium">{order.order_number}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-xs ${STATUS_COLORS[order.status] || "text-foreground"}`}>{order.status}</p>
                                <p className="text-sm">${parseFloat(order.total.toString()).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={() => setTab("orders")} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mt-4 flex items-center gap-1" data-testid="link-all-orders">View All <ChevronRight className="w-3 h-3" /></button>
                    </div>
                  </div>
                )}

                {tab === "orders" && (
                  <div className="space-y-4">
                    <h2 className="font-serif text-2xl mb-6">Order History</h2>
                    {ordersLoading ? (
                      <p className="text-sm text-muted-foreground">Loading order history...</p>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-16 bg-card">
                        <Package className="w-8 h-8 text-muted-foreground mx-auto mb-4" strokeWidth={1} />
                        <p className="text-sm text-muted-foreground mb-4">You have not placed any orders yet.</p>
                        <Link href="/shop" className="text-xs uppercase tracking-widest underline hover:text-accent transition-colors">Start Shopping</Link>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div key={order.id} className="bg-card p-6" data-testid={`order-${order.order_number}`}>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-sm font-medium mb-1">{order.order_number}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs uppercase tracking-widest ${STATUS_COLORS[order.status] || "text-foreground"}`}>{order.status}</span>
                            </div>
                          </div>
                          <div className="space-y-1 mb-4">
                            {order.items.map((item) => (
                              <p key={item.id} className="text-sm text-muted-foreground">
                                {item.product?.name || "Premium Item"} ({item.color} · {item.size}) x {item.quantity}
                              </p>
                            ))}
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-border/20">
                            <p className="text-sm font-medium">${parseFloat(order.total.toString()).toFixed(2)}</p>
                            <span className="text-xs uppercase tracking-widest text-muted-foreground">
                              {order.delivery_method} delivery
                            </span>
                          </div>
                        </div>
                      ))
                    )}
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
                    
                    {showAddressForm ? (
                      <form onSubmit={handleSaveAddress} className="bg-card p-8 space-y-6">
                        <h3 className="font-serif text-lg mb-4">{editingAddressId ? "Edit Address" : "Add New Address"}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">First Name</label>
                            <input
                              required
                              value={addressForm.first_name}
                              onChange={(e) => setAddressForm({ ...addressForm, first_name: e.target.value })}
                              className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                              data-testid="input-address-first-name"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Last Name</label>
                            <input
                              required
                              value={addressForm.last_name}
                              onChange={(e) => setAddressForm({ ...addressForm, last_name: e.target.value })}
                              className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                              data-testid="input-address-last-name"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Email Address</label>
                            <input
                              required
                              type="email"
                              value={addressForm.email}
                              onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                              className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                              data-testid="input-address-email"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Phone Number</label>
                            <input
                              required
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                              className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                              data-testid="input-address-phone"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Street Address</label>
                            <input
                              required
                              value={addressForm.address}
                              onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                              className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                              data-testid="input-address-street"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">City</label>
                            <input
                              required
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                              data-testid="input-address-city"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Postcode</label>
                            <input
                              required
                              value={addressForm.postcode}
                              onChange={(e) => setAddressForm({ ...addressForm, postcode: e.target.value })}
                              className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                              data-testid="input-address-postcode"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Country</label>
                            <select
                              value={addressForm.country}
                              onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                              className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent cursor-pointer"
                              data-testid="select-address-country"
                            >
                              {["United Kingdom", "United States", "France", "Germany", "Italy", "Spain", "Australia", "Canada"].map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={addressForm.is_default}
                                onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                                className="w-4 h-4"
                                data-testid="checkbox-address-default"
                              />
                              <span className="text-sm">Set as default address</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button
                            type="submit"
                            className="bg-primary text-primary-foreground px-8 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors"
                            data-testid="button-save-address"
                          >
                            Save Address
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                            className="border border-border/40 px-8 py-3 text-xs uppercase tracking-widest hover:border-foreground transition-colors"
                            data-testid="button-cancel-address"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {addressesLoading ? (
                          <p className="text-sm text-muted-foreground col-span-2">Loading addresses...</p>
                        ) : addresses.length === 0 ? (
                          <div className="col-span-2 text-center py-8 bg-card border-2 border-dashed border-border/20">
                            <p className="text-sm text-muted-foreground">No saved addresses found.</p>
                          </div>
                        ) : (
                          addresses.map((addr) => (
                            <div
                              key={addr.id}
                              className={`bg-card p-6 border-2 relative ${addr.is_default ? 'border-foreground/20' : 'border-border/10'}`}
                              data-testid={`address-card-${addr.id}`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                {addr.is_default ? (
                                  <span className="text-[10px] uppercase tracking-widest text-accent">Default</span>
                                ) : (
                                  <button
                                    onClick={() => handleSetDefault(addr.id)}
                                    className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                                    data-testid={`button-set-default-address-${addr.id}`}
                                  >
                                    Set as Default
                                  </button>
                                )}
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleEditAddressClick(addr)}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    data-testid={`button-edit-address-${addr.id}`}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAddress(addr.id)}
                                    className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                                    data-testid={`button-delete-address-${addr.id}`}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm font-medium mb-1">{addr.first_name} {addr.last_name}</p>
                              <p className="text-sm text-muted-foreground">{addr.address}</p>
                              <p className="text-sm text-muted-foreground">{addr.city}, {addr.postcode}</p>
                              <p className="text-sm text-muted-foreground">{addr.country}</p>
                            </div>
                          ))
                        )}
                        <button
                          onClick={() => {
                            setEditingAddressId(null);
                            setAddressForm({
                              first_name: "",
                              last_name: "",
                              email: user?.email || "",
                              phone: "",
                              address: "",
                              city: "",
                              postcode: "",
                              country: "United Kingdom",
                              is_default: false
                            });
                            setShowAddressForm(true);
                          }}
                          className="bg-card p-6 border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-3 hover:border-accent transition-colors group"
                          data-testid="button-add-address"
                        >
                          <span className="w-8 h-8 border border-border/40 flex items-center justify-center group-hover:border-accent transition-colors text-lg text-muted-foreground">+</span>
                          <span className="text-xs uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Add New Address</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {tab === "settings" && (
                  <div>
                    <h2 className="font-serif text-2xl mb-6">Account Settings</h2>
                    <div className="bg-card p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">First Name</label>
                          <input
                            value={settingsForm.first_name}
                            onChange={(e) => setSettingsForm({ ...settingsForm, first_name: e.target.value })}
                            className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                            data-testid="input-settings-first-name"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Last Name</label>
                          <input
                            value={settingsForm.last_name}
                            onChange={(e) => setSettingsForm({ ...settingsForm, last_name: e.target.value })}
                            className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                            data-testid="input-settings-last-name"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Email Address</label>
                        <input
                          value={settingsForm.email}
                          onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                          type="email"
                          className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                          data-testid="input-settings-email"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">New Password</label>
                        <input
                          value={settingsForm.password}
                          onChange={(e) => setSettingsForm({ ...settingsForm, password: e.target.value })}
                          type="password"
                          placeholder="Leave blank to keep current"
                          className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                          data-testid="input-settings-password"
                        />
                      </div>
                      <div className="pt-4">
                        <button
                          onClick={handleSaveSettings}
                          disabled={settingsSaving}
                          className="bg-primary text-primary-foreground px-8 py-3 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
                          data-testid="button-save-settings"
                        >
                          {settingsSaving ? "Saving..." : "Save Changes"}
                        </button>
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
