import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

const DELIVERY_OPTIONS = [
  { id: "standard", label: "Standard Delivery", time: "3–5 business days", price: 15 },
  { id: "express", label: "Express Delivery", time: "1–2 business days", price: 28 },
  { id: "overnight", label: "Overnight", time: "Next business day", price: 45 },
];

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, cartTotal } = useCart();
  const [delivery, setDelivery] = useState("standard");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "", city: "", postcode: "", country: "United Kingdom" });
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });

  const selectedDelivery = DELIVERY_OPTIONS.find((d) => d.id === delivery)!;
  const total = cartTotal + selectedDelivery.price;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/order-confirmation");
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
                  className="w-full bg-primary text-primary-foreground py-5 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center justify-center gap-3"
                  data-testid="button-place-order"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Place Order · ${total.toFixed(2)}
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
