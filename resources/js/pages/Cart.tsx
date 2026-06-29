import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ShoppingBag } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const shipping = cartTotal > 300 ? 0 : 15;
  const discount = couponApplied ? cartTotal * 0.1 : 0;
  const total = cartTotal - discount + shipping;
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Your Selection</p>
            <h1 className="font-serif text-4xl md:text-5xl">Shopping Cart</h1>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-32">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-6" strokeWidth={1} />
              <p className="font-serif text-2xl text-muted-foreground mb-4">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mb-10">Discover pieces crafted for your everyday.</p>
              <Link href="/shop" className="inline-block bg-primary text-primary-foreground px-10 py-4 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors" data-testid="link-continue-shopping-empty">
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              {/* Items */}
              <div className="lg:col-span-2">
                <div className="border-b border-border/20 pb-4 mb-6 hidden md:grid grid-cols-12 gap-4">
                  <p className="col-span-6 text-[10px] uppercase tracking-widest text-muted-foreground">Product</p>
                  <p className="col-span-2 text-[10px] uppercase tracking-widest text-muted-foreground text-center">Quantity</p>
                  <p className="col-span-2 text-[10px] uppercase tracking-widest text-muted-foreground text-right">Price</p>
                  <p className="col-span-2 text-[10px] uppercase tracking-widest text-muted-foreground text-right">Total</p>
                </div>

                <div className="space-y-8">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.cartItemId}
                        layout
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-12 gap-4 items-start pb-8 border-b border-border/10"
                        data-testid={`cart-item-${item.cartItemId}`}
                      >
                        <div className="col-span-12 md:col-span-6 flex gap-4">
                          <Link href={`/product/${item.id}`} className="flex-shrink-0">
                            <img src={item.images[0]} alt={item.name} className="w-24 h-32 object-cover bg-card" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/product/${item.id}`}>
                              <h3 className="font-serif text-base mb-1 hover:text-accent transition-colors">{item.name}</h3>
                            </Link>
                            <p className="text-xs text-muted-foreground mb-0.5">{item.selectedColor}</p>
                            <p className="text-xs text-muted-foreground mb-4">Size: {item.selectedSize}</p>
                            <button onClick={() => removeFromCart(item.cartItemId)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors" data-testid={`button-remove-${item.cartItemId}`}>
                              <X className="w-3 h-3" /> Remove
                            </button>
                          </div>
                        </div>
                        <div className="col-span-6 md:col-span-2 flex items-center justify-start md:justify-center">
                          <div className="flex items-center border border-border/40">
                            <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center hover:bg-card transition-colors" data-testid={`button-decrease-${item.cartItemId}`}>−</button>
                            <span className="w-9 text-center text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-card transition-colors" data-testid={`button-increase-${item.cartItemId}`}>+</button>
                          </div>
                        </div>
                        <div className="col-span-3 md:col-span-2 text-sm text-right hidden md:block">${item.price.toLocaleString()}</div>
                        <div className="col-span-3 md:col-span-2 text-sm text-right font-medium">${(item.price * item.quantity).toLocaleString()}</div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="mt-8">
                  <Link href="/shop" className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors" data-testid="link-continue-shopping">
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card p-8 sticky top-28">
                  <h2 className="font-serif text-2xl mb-8">Order Summary</h2>

                  {/* Coupon */}
                  <div className="mb-8">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Coupon Code</p>
                    <div className="flex gap-0">
                      <input
                        type="text"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 bg-background border border-border/40 px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
                        data-testid="input-coupon"
                      />
                      <button
                        onClick={() => coupon && setCouponApplied(true)}
                        className="bg-primary text-primary-foreground px-4 text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors"
                        data-testid="button-apply-coupon"
                      >
                        Apply
                      </button>
                    </div>
                    {couponApplied && <p className="text-xs text-accent mt-2">10% discount applied</p>}
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-accent">Discount (10%)</span>
                        <span className="text-accent">−${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping === 0 ? "Complimentary" : `$${shipping}`}</span>
                    </div>
                    <div className="border-t border-border/20 pt-4 flex justify-between">
                      <span className="text-xs uppercase tracking-widest font-medium">Total</span>
                      <span className="font-medium">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-6">
                    Estimated delivery: <span className="text-foreground">{estimatedDelivery}</span>
                  </p>

                  <Link
                    href="/checkout"
                    className="block w-full bg-primary text-primary-foreground py-4 text-center text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors"
                    data-testid="link-checkout"
                  >
                    Proceed to Checkout
                  </Link>

                  <p className="text-[10px] text-muted-foreground text-center mt-4">Secure checkout · SSL encrypted</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
