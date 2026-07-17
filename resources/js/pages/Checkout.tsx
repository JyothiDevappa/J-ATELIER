import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { submitCheckout } from "@/lib/checkoutApi";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getAddresses, Address } from "@/lib/addressApi";
import { validateCoupon, CouponValidationResult } from "@/lib/couponApi";

const DELIVERY_OPTIONS = [
  { id: "standard", label: "Standard Delivery", time: "3–5 business days", price: 15 },
  { id: "express", label: "Express Delivery", time: "1–2 business days", price: 28 },
  { id: "overnight", label: "Overnight", time: "Next business day", price: 45 },
];

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  
  const [delivery, setDelivery] = useState("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "", city: "", postcode: "", country: "United Kingdom" });
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, email: user.email || "" }));
      getAddresses().then((data) => {
        setAddresses(data);
        const defaultAddr = data.find((a) => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setForm({
            firstName: defaultAddr.first_name,
            lastName: defaultAddr.last_name,
            email: defaultAddr.email,
            phone: defaultAddr.phone,
            address: defaultAddr.address,
            city: defaultAddr.city,
            postcode: defaultAddr.postcode,
            country: defaultAddr.country,
          });
        } else if (data.length > 0) {
          setSelectedAddressId(data[0].id);
          setForm({
            firstName: data[0].first_name,
            lastName: data[0].last_name,
            email: data[0].email,
            phone: data[0].phone,
            address: data[0].address,
            city: data[0].city,
            postcode: data[0].postcode,
            country: data[0].country,
          });
        }
      }).catch((err) => {
        console.error("Failed to fetch user addresses:", err);
      });
    }
  }, [user]);

  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);

  useEffect(() => {
    const code = sessionStorage.getItem("applied_coupon_code");
    if (code) {
      setCouponCode(code);
      validateCoupon(code)
        .then((res) => {
          setAppliedCoupon(res);
        })
        .catch((err) => {
          console.error("Failed to validate checkout coupon:", err);
          sessionStorage.removeItem("applied_coupon_code");
          setCouponCode(null);
        });
    }
  }, []);

  const handleAddressSelect = (id: number | 'new') => {
    if (id === 'new') {
      setSelectedAddressId(null);
      setForm({
        firstName: "",
        lastName: "",
        email: user?.email || "",
        phone: "",
        address: "",
        city: "",
        postcode: "",
        country: "United Kingdom",
      });
    } else {
      const addr = addresses.find((a) => a.id === id);
      if (addr) {
        setSelectedAddressId(addr.id);
        setForm({
          firstName: addr.first_name,
          lastName: addr.last_name,
          email: addr.email,
          phone: addr.phone,
          address: addr.address,
          city: addr.city,
          postcode: addr.postcode,
          country: addr.country,
        });
      }
    }
  };

  const selectedDelivery = DELIVERY_OPTIONS.find((d) => d.id === delivery)!;
  const discount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const total = Math.max(0, cartTotal - discount) + selectedDelivery.price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({ title: "Cart is empty", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitCheckout({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        postcode: form.postcode,
        country: form.country,
        delivery: delivery,
        couponCode: couponCode || undefined,
      });
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("last_order_number", res.order_number);
      }
      clearCart();
      setLocation("/order-confirmation");
    } catch (err: any) {
      toast({
        title: "Checkout failed",
        description: err.response?.data?.message || err.message || "An error occurred during checkout",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-12">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-6">
              <Link href="/cart">Cart</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">Checkout</span>
            </div>
            <h1 className="font-serif text-4xl">Checkout</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-12">
                {/* Shipping Address */}
                <section>
                  <h2 className="font-serif text-2xl mb-8">Shipping Address</h2>

                  {addresses.length > 0 && (
                    <div className="mb-8 space-y-3">
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Select Saved Address</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => handleAddressSelect(addr.id)}
                            className={`p-4 border cursor-pointer transition-colors relative ${selectedAddressId === addr.id ? 'border-foreground bg-card' : 'border-border/40 hover:border-accent bg-transparent'}`}
                            data-testid={`saved-address-option-${addr.id}`}
                          >
                            {addr.is_default && (
                              <span className="absolute top-2 right-2 text-[9px] uppercase tracking-widest bg-accent text-accent-foreground px-1.5 py-0.5">Default</span>
                            )}
                            <p className="text-xs font-semibold">{addr.first_name} {addr.last_name}</p>
                            <p className="text-xs text-muted-foreground">{addr.address}</p>
                            <p className="text-xs text-muted-foreground">{addr.city}, {addr.postcode}</p>
                            <p className="text-xs text-muted-foreground">{addr.country}</p>
                          </div>
                        ))}
                        <div
                          onClick={() => handleAddressSelect('new')}
                          className={`p-4 border cursor-pointer transition-colors flex items-center justify-center ${selectedAddressId === null ? 'border-foreground bg-card' : 'border-dashed border-border/40 hover:border-accent bg-transparent'}`}
                          data-testid="new-address-option"
                        >
                          <span className="text-xs uppercase tracking-widest text-muted-foreground">+ Use a new address</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "firstName", label: "First Name", col: 1 },
                      { name: "lastName", label: "Last Name", col: 1 },
                      { name: "email", label: "Email Address", col: 2, type: "email" },
                      { name: "phone", label: "Phone Number", col: 2, type: "tel" },
                      { name: "address", label: "Street Address", col: 2 },
                      { name: "city", label: "City", col: 1 },
                      { name: "postcode", label: "Postcode", col: 1 },
                    ].map((field) => (
                      <div key={field.name} className={field.col === 2 ? "md:col-span-2" : ""}>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{field.label}</label>
                        <input
                          type={field.type || "text"}
                          required
                          value={form[field.name as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                          className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                          data-testid={`input-${field.name}`}
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Country</label>
                      <select
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent cursor-pointer"
                        data-testid="select-country"
                      >
                        {["United Kingdom", "United States", "France", "Germany", "Italy", "Spain", "Australia", "Canada"].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                {/* Delivery Method */}
                <section>
                  <h2 className="font-serif text-2xl mb-8">Delivery Method</h2>
                  <div className="space-y-3">
                    {DELIVERY_OPTIONS.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center justify-between p-5 border cursor-pointer transition-colors ${delivery === option.id ? "border-foreground" : "border-border/40 hover:border-accent"}`}
                        data-testid={`radio-delivery-${option.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${delivery === option.id ? "border-foreground" : "border-border"}`}>
                            {delivery === option.id && <div className="w-2 h-2 rounded-full bg-foreground" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{option.label}</p>
                            <p className="text-xs text-muted-foreground">{option.time}</p>
                          </div>
                        </div>
                        <span className="text-sm">${option.price}</span>
                        <input type="radio" name="delivery" value={option.id} checked={delivery === option.id} onChange={() => setDelivery(option.id)} className="sr-only" />
                      </label>
                    ))}
                  </div>
                </section>

                {/* Payment */}
                <section>
                  <h2 className="font-serif text-2xl mb-8">Payment</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          value={card.number}
                          onChange={(e) => setCard({ ...card, number: e.target.value })}
                          className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                          data-testid="input-card-number"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Name on Card</label>
                        <input
                          type="text"
                          value={card.name}
                          onChange={(e) => setCard({ ...card, name: e.target.value })}
                          className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                          data-testid="input-card-name"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={card.expiry}
                          onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                          className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                          data-testid="input-card-expiry"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          maxLength={4}
                          value={card.cvv}
                          onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                          className="w-full bg-transparent border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                          data-testid="input-card-cvv"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="w-full bg-primary text-primary-foreground py-5 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-place-order"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {isSubmitting ? "Processing..." : `Place Order · $${total.toFixed(2)}`}
                </button>
              </div>

              {/* Right: Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card p-8 sticky top-28">
                  <h2 className="font-serif text-xl mb-8">Order Summary</h2>
                  <div className="space-y-4 mb-8">
                    {items.map((item) => (
                      <div key={item.cartItemId} className="flex gap-3">
                        <img src={item.images[0]} alt={item.name} className="w-14 h-18 object-cover flex-shrink-0" style={{ height: "72px" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.selectedColor} · {item.selectedSize}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm flex-shrink-0">${(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border/20 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-accent">Discount ({appliedCoupon?.type === 'Percentage' ? `${appliedCoupon.value}%` : `$${appliedCoupon?.value}`})</span>
                        <span className="text-accent">−${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>${selectedDelivery.price}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border/20">
                      <span className="text-xs uppercase tracking-widest">Total</span>
                      <span className="font-medium">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
